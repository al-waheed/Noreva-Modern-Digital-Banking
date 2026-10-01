import { Request, Response } from "express";
import prisma from "../config/prisma";

export const getTransactions = async (
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

    const account = await prisma.account.findUnique({
      where: {
        userId: req.userId,
      },
      include: {
        wallet: true,
      },
    });

    if (!account?.wallet) {
      return res.status(404).json({
        success: false,
        message: "Wallet not found",
      });
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        walletId: account.wallet.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        sender: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            account: {
              select: {
                accountNumber: true,
              },
            },
          },
        },
        receiver: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            account: {
              select: {
                accountNumber: true,
              },
            },
          },
        },
      },
    });

    return res.json({
      success: true,
      transactions,
    });
  } catch (error) {
    console.error("Transactions error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load transactions",
    });
  }
};

export const getTransactionByReference = async (
  req: Request<{ reference: string }> & { userId?: string },
  res: Response,
) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const account = await prisma.account.findUnique({
      where: {
        userId: req.userId,
      },
      include: {
        wallet: true,
      },
    });

    if (!account?.wallet) {
      return res.status(404).json({
        success: false,
        message: "Wallet not found",
      });
    }

    const transaction = await prisma.transaction.findFirst({
      where: {
        reference: req.params.reference,
        walletId: account.wallet.id,
      },
      include: {
        sender: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            account: {
              select: {
                accountNumber: true,
              },
            },
          },
        },
        receiver: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            account: {
              select: {
                accountNumber: true,
              },
            },
          },
        },
      },
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    return res.json({
      success: true,
      transaction,
    });
  } catch (error) {
    console.error("Transaction details error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load transaction",
    });
  }
};
