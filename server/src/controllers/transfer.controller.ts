import { Request, Response } from "express";
import { z } from "zod";
import prisma from "../config/prisma";
import { createNotification } from "../services/notification.service";

const recipientSchema = z.object({
  accountNumber: z.string().min(10).max(10),
});

const transferSchema = z.object({
  accountNumber: z.string().min(10).max(10),
  amount: z.number().positive(),
  description: z.string().max(100).optional(),
});

const generateReference = (prefix: string) => {
  return `${prefix}-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
};

// Find recipient
export const findRecipient = async (
  req: Request & { userId?: string },
  res: Response,
) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const result = recipientSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid account number",
      });
    }

    const { accountNumber } = result.data;

    const account = await prisma.account.findUnique({
      where: {
        accountNumber,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }

    if (account.user.id === req.userId) {
      return res.status(400).json({
        success: false,
        message: "You cannot transfer money to yourself",
      });
    }

    return res.json({
      success: true,
      recipient: {
        firstName: account.user.firstName,
        lastName: account.user.lastName,
        accountNumber: account.accountNumber,
      },
    });
  } catch (error) {
    console.error("Find recipient error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to find recipient",
    });
  }
};

// Transfer money
export const transferMoney = async (
  req: Request & { userId?: string },
  res: Response,
) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const result = transferSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid transfer details",
      });
    }

    const { accountNumber, amount, description } = result.data;

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than zero",
      });
    }

    // Get sender
    const sender = await prisma.user.findUnique({
      where: {
        id: req.userId,
      },
      include: {
        account: {
          include: {
            wallet: true,
          },
        },
      },
    });

    if (!sender || !sender.account?.wallet) {
      return res.status(404).json({
        success: false,
        message: "Sender account not found",
      });
    }

    // Get recipient
    const recipientAccount = await prisma.account.findUnique({
      where: {
        accountNumber,
      },
      include: {
        user: true,
        wallet: true,
      },
    });

    if (!recipientAccount || !recipientAccount.wallet) {
      return res.status(404).json({
        success: false,
        message: "Recipient account not found",
      });
    }

    if (recipientAccount.userId === sender.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot transfer money to yourself",
      });
    }

    const senderReference = generateReference("NRE-S");
    const receiverReference = generateReference("NRE-R");

    const transferResult = await prisma.$transaction(async (tx) => {
      // Remove money from sender ONLY if the balance is sufficient.
      const senderUpdate = await tx.wallet.updateMany({
        where: {
          id: sender.account!.wallet!.id,
          balance: {
            gte: amount,
          },
        },
        data: {
          balance: {
            decrement: amount,
          },
        },
      });

      // If no wallet was updated, the sender does not have enough money.
      if (senderUpdate.count === 0) {
        throw new Error("INSUFFICIENT_BALANCE");
      }

      // Add money to recipient
      const updatedRecipientWallet = await tx.wallet.update({
        where: {
          id: recipientAccount.wallet!.id,
        },
        data: {
          balance: {
            increment: amount,
          },
        },
      });

      // Get the sender's updated wallet balance
      const updatedSenderWallet = await tx.wallet.findUnique({
        where: {
          id: sender.account!.wallet!.id,
        },
      });

      if (!updatedSenderWallet) {
        throw new Error("SENDER_WALLET_NOT_FOUND");
      }

      // Create sender transaction
      const senderTransaction = await tx.transaction.create({
        data: {
          reference: senderReference,
          amount,
          type: "TRANSFER",
          status: "SUCCESS",
          description: description || "Transfer",
          senderId: sender.id,
          receiverId: recipientAccount.userId,
          walletId: sender.account!.wallet!.id,
        },
      });

      // Create receiver transaction
      const receiverTransaction = await tx.transaction.create({
        data: {
          reference: receiverReference,
          amount,
          type: "TRANSFER",
          status: "SUCCESS",
          description: description || "Transfer",
          senderId: sender.id,
          receiverId: recipientAccount.userId,
          walletId: recipientAccount.wallet!.id,
        },
      });

      return {
        updatedSenderWallet,
        updatedRecipientWallet,
        senderTransaction,
        receiverTransaction,
      };
    });

    await Promise.all([
      createNotification({
        userId: sender.id,
        title: "Transfer successful",
        message: `₦${amount.toLocaleString("en-NG")} sent to ${recipientAccount.user.firstName} ${recipientAccount.user.lastName}.`,
      }),

      createNotification({
        userId: recipientAccount.userId,
        title: "Money received",
        message: `₦${amount.toLocaleString("en-NG")} received from ${sender.firstName} ${sender.lastName}.`,
      }),
    ]);

    return res.status(200).json({
      success: true,
      message: "Transfer successful",
      transfer: {
        senderBalance: transferResult.updatedSenderWallet.balance,
        recipientBalance: transferResult.updatedRecipientWallet.balance,
        senderTransaction: transferResult.senderTransaction,
        receiverTransaction: transferResult.receiverTransaction,
        recipient: {
          firstName: recipientAccount.user.firstName,
          lastName: recipientAccount.user.lastName,
          email: recipientAccount.user.email,
          accountNumber: recipientAccount.accountNumber,
        },
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "INSUFFICIENT_BALANCE") {
      return res.status(400).json({
        success: false,
        message: "Insufficient balance",
      });
    }

    console.error("Transfer error:", error);

    return res.status(500).json({
      success: false,
      message: "Transfer failed",
    });
  }
};
