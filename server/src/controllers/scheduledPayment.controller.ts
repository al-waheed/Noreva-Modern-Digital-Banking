import { Request, Response } from "express";
import { z } from "zod";
import prisma from "../config/prisma";
import { verifyTransactionPin } from "../services/transactionPin.service";

const createScheduledPaymentSchema = z.object({
  accountNumber: z.string().min(10).max(10),
  amount: z.number().positive(),
  description: z.string().max(100).optional(),
  scheduledFor: z.string(),
  frequency: z.enum(["ONCE", "DAILY", "WEEKLY", "MONTHLY"]),
  transactionPin: z
    .string()
    .regex(/^\d{4}$/, "Transaction PIN must be 4 digits"),
});

export const getScheduledPayments = async (
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

    const payments = await prisma.scheduledPayment.findMany({
      where: {
        userId: req.userId,
      },
      orderBy: {
        scheduledFor: "asc",
      },
      include: {
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
      payments,
    });
  } catch (error) {
    console.error("Scheduled payments error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load scheduled payments",
    });
  }
};

export const createScheduledPayment = async (
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

    const result = createScheduledPaymentSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid payment details",
      });
    }

    const {
      accountNumber,
      amount,
      description,
      scheduledFor,
      frequency,
      transactionPin,
    } = result.data;

    // Verify the user's reusable transaction PIN.
    try {
      const pinIsValid = await verifyTransactionPin(
        req.userId,
        transactionPin,
      );

      if (!pinIsValid) {
        return res.status(401).json({
          success: false,
          message: "Incorrect transaction PIN",
        });
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "USER_NOT_FOUND") {
          return res.status(404).json({
            success: false,
            message: "User not found",
          });
        }

        if (error.message === "PIN_NOT_SET") {
          return res.status(400).json({
            success: false,
            message: "Transaction PIN has not been set",
          });
        }
      }

      console.error(
        "Scheduled payment transaction PIN verification error:",
        error,
      );

      return res.status(500).json({
        success: false,
        message: "Unable to verify transaction PIN",
      });
    }

    const date = new Date(scheduledFor);

    if (Number.isNaN(date.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid scheduled date",
      });
    }

    if (date <= new Date()) {
      return res.status(400).json({
        success: false,
        message: "Scheduled date must be in the future",
      });
    }

    const receiverAccount = await prisma.account.findUnique({
      where: {
        accountNumber,
      },
      include: {
        user: true,
      },
    });

    if (!receiverAccount) {
      return res.status(404).json({
        success: false,
        message: "Recipient account not found",
      });
    }

    if (receiverAccount.userId === req.userId) {
      return res.status(400).json({
        success: false,
        message: "You cannot schedule a payment to yourself",
      });
    }

    const payment = await prisma.scheduledPayment.create({
      data: {
        amount,
        description: description?.trim() || null,
        scheduledFor: date,
        frequency,
        userId: req.userId,
        receiverId: receiverAccount.userId,
        status: "PENDING",
      },
      include: {
        receiver: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      payment,
    });
  } catch (error) {
    console.error("Create scheduled payment error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to schedule payment",
    });
  }
};

export const cancelScheduledPayment = async (
  req: Request<{ id: string }> & { userId?: string },
  res: Response,
) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const payment = await prisma.scheduledPayment.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId,
      },
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Scheduled payment not found",
      });
    }

    const updatedPayment = await prisma.scheduledPayment.update({
      where: {
        id: payment.id,
      },
      data: {
        status: "FAILED",
      },
    });

    return res.json({
      success: true,
      payment: updatedPayment,
    });
  } catch (error) {
    console.error("Cancel scheduled payment error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to cancel scheduled payment",
    });
  }
};
