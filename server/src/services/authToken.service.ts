import type { Request, Response } from "express";
import jwt from "jsonwebtoken";

const ACCESS_COOKIE = "noreva_access";
const TOKEN_MAX_AGE = 30 * 60 * 1000;

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" as const : "lax" as const,
  path: "/",
};

export const setAuthCookie = (res: Response, userId: string) => {
  const token = jwt.sign(
    { userId },
    process.env.JWT_SECRET as string,
    { algorithm: "HS256", expiresIn: "30m" },
  );

  res.cookie(ACCESS_COOKIE, token, {
    ...cookieOptions,
    maxAge: TOKEN_MAX_AGE,
  });
};

export const readAuthCookie = (req: Request) => {
  const cookie = req.headers.cookie
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${ACCESS_COOKIE}=`));

  if (!cookie) return undefined;

  try {
    return decodeURIComponent(cookie.slice(ACCESS_COOKIE.length + 1));
  } catch {
    return undefined;
  }
};

export const clearAuthCookie = (res: Response) => {
  res.clearCookie(ACCESS_COOKIE, cookieOptions);
};