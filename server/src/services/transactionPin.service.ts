import bcrypt from "bcrypt";
import prisma from "../config/prisma";

export const hasTransactionPin = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { transactionPinHash: true },
  });

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  return Boolean(user.transactionPinHash);
};

export const createTransactionPin = async (userId: string, pin: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { transactionPinHash: true },
  });

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  if (user.transactionPinHash) {
    throw new Error("PIN_ALREADY_SET");
  }

  const transactionPinHash = await bcrypt.hash(pin, 10);

  await prisma.user.update({
    where: { id: userId },
    data: {
      transactionPinHash,
    },
  });
};

export const changeTransactionPin = async (
  userId: string,
  currentPin: string,
  newPin: string,
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { transactionPinHash: true },
  });

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  if (!user.transactionPinHash) {
    throw new Error("PIN_NOT_SET");
  }

  const currentPinIsValid = await bcrypt.compare(
    currentPin,
    user.transactionPinHash,
  );

  if (!currentPinIsValid) {
    throw new Error("INCORRECT_CURRENT_PIN");
  }

  if (currentPin === newPin) {
    throw new Error("PIN_UNCHANGED");
  }

  const transactionPinHash = await bcrypt.hash(newPin, 10);

  await prisma.user.update({
    where: { id: userId },
    data: { transactionPinHash },
  });
};

export const verifyTransactionPin = async (userId: string, pin: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { transactionPinHash: true },
  });

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  if (!user.transactionPinHash) {
    throw new Error("PIN_NOT_SET");
  }

  return bcrypt.compare(pin, user.transactionPinHash);
};
