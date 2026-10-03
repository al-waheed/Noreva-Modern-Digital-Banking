import { Request, Response } from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { z } from "zod";
import prisma from "../config/prisma";
import jwt from "jsonwebtoken";
import { createTransactionPin } from "../services/transactionPin.service";

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

const forgotPasswordSchema = z.object({
  email: z.email(),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(6),
});

const transactionPinSchema = z.object({
  pin: z.string().regex(/^\d{4}$/, "PIN must be exactly 4 digits"),
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

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const result = forgotPasswordSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid email address",
      });
    }

    const { email } = result.data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Always return the same response whether the email exists or not.
    if (!user) {
      return res.json({
        success: true,
        message:
          "If an account exists with this email, a password reset link has been sent.",
      });
    }

    // Remove any previous reset tokens for this user.
    await prisma.passwordResetToken.deleteMany({
      where: {
        userId: user.id,
      },
    });

    // Generate a secure random token.
    const token = crypto.randomBytes(32).toString("hex");

    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });

    const frontendUrl = process.env.FRONTEND_URL;

    if (!frontendUrl) {
      throw new Error("FRONTEND_URL is not configured");
    }

    const resetLink = `${frontendUrl}/reset-password?token=${token}`;

    // Send password reset email through EmailJS.
    const emailResponse = await fetch(
      "https://api.emailjs.com/api/v1.0/email/send",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          service_id: process.env.EMAILJS_SERVICE_ID,
          template_id: process.env.EMAILJS_TEMPLATE_ID,
          user_id: process.env.EMAILJS_PUBLIC_KEY,
          accessToken: process.env.EMAILJS_PRIVATE_KEY,
          template_params: {
            to_email: user.email,
            to_name: `${user.firstName} ${user.lastName}`,
            reset_link: resetLink,
          },
        }),
      },
    );

    if (!emailResponse.ok) {
      const emailError = await emailResponse.text();

      console.error("Password reset email failed:", emailError);

      return res.status(500).json({
        success: false,
        message: "Unable to send password reset email",
      });
    }

    return res.json({
      success: true,
      message:
        "If an account exists with this email, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const result = resetPasswordSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid password reset details",
      });
    }

    const { token, password } = result.data;

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: {
        token,
      },
    });

    if (!resetToken) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset link",
      });
    }

    if (resetToken.expiresAt < new Date()) {
      await prisma.passwordResetToken.delete({
        where: {
          id: resetToken.id,
        },
      });

      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset link",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.$transaction([
      prisma.user.update({
        where: {
          id: resetToken.userId,
        },
        data: {
          password: hashedPassword,
        },
      }),

      prisma.passwordResetToken.delete({
        where: {
          id: resetToken.id,
        },
      }),
    ]);

    return res.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

interface AuthenticatedRequest extends Request {
  userId?: string;
}

export const setTransactionPin = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const result = transactionPinSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error.issues[0]?.message || "Invalid PIN",
      });
    }

    const { pin } = result.data;

    await createTransactionPin(userId, pin);

    return res.status(201).json({
      success: true,
      message: "Transaction PIN created successfully",
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "USER_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      if (error.message === "PIN_ALREADY_SET") {
        return res.status(400).json({
          success: false,
          message: "Transaction PIN has already been set",
        });
      }
    }

    console.error("Set transaction PIN error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create transaction PIN",
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
        hasTransactionPin: Boolean(user.transactionPinHash),
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
