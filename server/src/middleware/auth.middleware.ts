import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { readAuthCookie } from "../services/authToken.service";

interface AuthenticatedRequest extends Request {
  userId?: string;
}

export const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = readAuthCookie(req);
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
      { algorithms: ["HS256"] },
    ) as jwt.JwtPayload & { userId?: string };

    if (typeof decoded.userId !== "string") {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    req.userId = decoded.userId;
    return next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};
