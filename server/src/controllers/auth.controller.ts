import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { z } from "zod";
import prisma from "../config/prisma";
import jwt from "jsonwebtoken";

const registerSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.email(),
  password: z.string().min(6),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

const generateAccountNumber = () => {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(10 + Math.random() * 90);

  return `${random}${timestamp}`;
};

const generateCardNumber = () => {
  const randomDigits = Math.floor(100000000000 + Math.random() * 900000000000);

  return `5399${randomDigits}`;
};

const generateCVV = () => {
  return Math.floor(100 + Math.random() * 900).toString();
};

export const register = async (req: Request, res: Response) => {
  try {
    const result = registerSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid registration details",
        errors: z.treeifyError(result.error),
      });
    }

    const { firstName, lastName, email, password, phone } = result.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const accountNumber = generateAccountNumber();
    const cardNumber = generateCardNumber();
    const cvv = generateCVV();

    const currentDate = new Date();
    const expiryMonth = currentDate.getMonth() + 1;
    const expiryYear = currentDate.getFullYear() + 4;

    const resultTransaction = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          firstName,
          lastName,
          email,
          password: hashedPassword,
          phone,
        },
      });

      const account = await tx.account.create({
        data: {
          accountNumber,
          userId: user.id,
        },
      });

      const wallet = await tx.wallet.create({
        data: {
          accountId: account.id,
          balance: 100000,
        },
      });

      const card = await tx.card.create({
        data: {
          cardNumber,
          expiryMonth,
          expiryYear,
          cvv,
          type: "VIRTUAL",
          userId: user.id,
        },
      });

      return {
        user,
        account,
        wallet,
        card,
      };
    });

    const token = jwt.sign(
      {
        userId: resultTransaction.user.id,
        email: resultTransaction.user.email,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" },
    );

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      token,
      user: {
        id: resultTransaction.user.id,
        firstName: resultTransaction.user.firstName,
        lastName: resultTransaction.user.lastName,
        email: resultTransaction.user.email,
      },
      account: {
        accountNumber: resultTransaction.account.accountNumber,
      },
      wallet: {
        balance: resultTransaction.wallet.balance,
      },
      card: {
        cardNumber: resultTransaction.card.cardNumber,
        expiryMonth: resultTransaction.card.expiryMonth,
        expiryYear: resultTransaction.card.expiryYear,
        cvv: resultTransaction.card.cvv,
        type: resultTransaction.card.type,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid login details",
        errors: z.treeifyError(result.error),
      });
    }

    const { email, password } = result.data;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        account: {
          include: {
            wallet: true,
          },
        },
        cards: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "7d",
      },
    );

    return res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        accountNumber: user.account?.accountNumber,
        balance: user.account?.wallet?.balance,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const getMe = async (
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
        cards: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        accountNumber: user.account?.accountNumber,
        balance: user.account?.wallet?.balance,
        cards: user.cards,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};
