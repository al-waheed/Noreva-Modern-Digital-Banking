import { Request, Response } from "express";
import prisma from "../config/prisma";

export const getDashboard = async (
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

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: {
        account: {
          include: {
            wallet: true,
          },
        },
      },
    });

    if (!user || !user.account?.wallet) {
      return res.status(404).json({
        success: false,
        message: "Account information not found",
      });
    }

    const walletId = user.account.wallet.id;

    const transactions = await prisma.transaction.findMany({
      where: {
        walletId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
      include: {
        sender: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        receiver: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Start of the current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Get all successful transactions from this month
    const monthlyTransactions = await prisma.transaction.findMany({
      where: {
        walletId,
        status: "SUCCESS",
        createdAt: {
          gte: startOfMonth,
        },
      },
    });

    // Monthly transaction activity for the current year
    const currentYear = new Date().getFullYear();

    const yearlyTransactions = await prisma.transaction.findMany({
      where: {
        walletId,
        status: "SUCCESS",
        createdAt: {
          gte: new Date(currentYear, 0, 1),
        },
      },
    });

    const monthlyActivity = Array.from({ length: 12 }, (_, index) => ({
      month: new Date(currentYear, index, 1).toLocaleString("en-US", {
        month: "short",
      }),
      amount: 0,
    }));

    yearlyTransactions.forEach((transaction) => {
      const month = new Date(transaction.createdAt).getMonth();

      monthlyActivity[month].amount += Number(transaction.amount);
    });

    let moneyReceived = 0;
    let moneySent = 0;

    monthlyTransactions.forEach((transaction) => {
      const amount = Number(transaction.amount);

      if (transaction.receiverId === user.id) {
        moneyReceived += amount;
      }

      if (transaction.senderId === user.id) {
        moneySent += amount;
      }
    });

    return res.json({
      success: true,

      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },

      account: {
        accountNumber: user.account.accountNumber,
        balance: user.account.wallet.balance,
      },

      stats: {
        moneyReceived,
        moneySent,
        transactionCount: monthlyTransactions.length,
      },

      monthlyActivity,

      transactions,
    });
  } catch (error) {
    console.error("Dashboard error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load dashboard",
    });
  }
};
