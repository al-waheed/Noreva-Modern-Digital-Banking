import type { Request, Response } from "express";
import { z } from "zod";
import prisma from "../config/prisma";

const cardStatusSchema = z.object({
  status: z.enum(["ACTIVE", "BLOCKED"]),
});

export const updateCardStatus = async (
  req: Request<{ id: string }> & { userId?: string },
  res: Response,
) => {
  if (!req.userId) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  const result = cardStatusSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid card status",
    });
  }

  try {
    const updated = await prisma.card.updateMany({
      where: {
        id: req.params.id,
        userId: req.userId,
      },
      data: {
        status: result.data.status,
      },
    });

    if (updated.count === 0) {
      return res.status(404).json({
        success: false,
        message: "Card not found",
      });
    }

    return res.json({
      success: true,
      status: result.data.status,
    });
  } catch (error) {
    console.error("Update card status error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to update card status",
    });
  }
};