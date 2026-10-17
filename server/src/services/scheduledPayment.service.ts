import prisma from "../config/prisma";
import { createNotification } from "./notification.service";

const generateReference = () => {
  return `NRV-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
};

export const processScheduledPayments = async () => {
  try {
    const payments = await prisma.scheduledPayment.findMany({
      where: {
        status: "PENDING",
        scheduledFor: {
          lte: new Date(),
        },
      },
      select: {
        id: true,
      },
    });

    for (const { id } of payments) {
      try {
        const result = await prisma.$transaction(async (tx) => {
          const claim = await tx.scheduledPayment.updateMany({
            where: {
              id,
              status: "PENDING",
              scheduledFor: {
                lte: new Date(),
              },
            },
            data: {
              status: "SUCCESS",
            },
          });

          if (claim.count === 0) {
            return null;
          }

          const payment = await tx.scheduledPayment.findUnique({
            where: { id },
            include: {
              user: {
                include: {
                  account: {
                    include: {
                      wallet: true,
                    },
                  },
                },
              },
              receiver: {
                include: {
                  account: {
                    include: {
                      wallet: true,
                    },
                  },
                },
              },
            },
          });

          if (!payment) {
            throw new Error(`Scheduled payment ${id} disappeared after claim.`);
          }

          const senderWallet = payment.user.account?.wallet;
          const receiverWallet = payment.receiver?.account?.wallet;

          if (!senderWallet || !receiverWallet || !payment.receiver) {
            await tx.scheduledPayment.update({
              where: { id },
              data: { status: "FAILED" },
            });

            return { status: "FAILED" as const, payment };
          }

          const senderUpdate = await tx.wallet.updateMany({
            where: {
              id: senderWallet.id,
              balance: {
                gte: payment.amount,
              },
            },
            data: {
              balance: {
                decrement: payment.amount,
              },
            },
          });

          if (senderUpdate.count === 0) {
            await tx.scheduledPayment.update({
              where: { id },
              data: { status: "FAILED" },
            });

            return { status: "FAILED" as const, payment };
          }

          await tx.wallet.update({
            where: { id: receiverWallet.id },
            data: {
              balance: {
                increment: payment.amount,
              },
            },
          });

          await tx.transaction.createMany({
            data: [
              {
                reference: generateReference(),
                amount: payment.amount,
                type: "TRANSFER",
                status: "SUCCESS",
                description: payment.description || "Scheduled payment",
                senderId: payment.userId,
                receiverId: payment.receiverId,
                walletId: senderWallet.id,
              },
              {
                reference: generateReference(),
                amount: payment.amount,
                type: "TRANSFER",
                status: "SUCCESS",
                description: payment.description || "Scheduled payment",
                senderId: payment.userId,
                receiverId: payment.receiverId,
                walletId: receiverWallet.id,
              },
            ],
          });

          return { status: "SUCCESS" as const, payment };
        });

        if (!result) {
          continue;
        }

        if (result.status === "FAILED") {
          console.log(
            `Scheduled payment ${id} failed: insufficient funds or invalid account.`,
          );
          continue;
        }

        const { payment } = result;

        try {
          await Promise.all([
            createNotification({
              userId: payment.userId,
              title: "Scheduled payment sent",
              message: `₦${Number(payment.amount).toLocaleString("en-NG")} sent to ${payment.receiver!.firstName} ${payment.receiver!.lastName} via scheduled payment.`,
            }),
            createNotification({
              userId: payment.receiverId!,
              title: "Money received",
              message: `₦${Number(payment.amount).toLocaleString("en-NG")} received from ${payment.user.firstName} ${payment.user.lastName} via scheduled payment.`,
            }),
          ]);
        } catch (notificationError) {
          console.error(
            `Unable to send notifications for scheduled payment ${id}:`,
            notificationError,
          );
        }

        console.log(`Scheduled payment ${id} processed successfully.`);
      } catch (error) {
        console.error(`Scheduled payment ${id} failed:`, error);
      }
    }
  } catch (error) {
    console.error("Scheduled payment processor error:", error);
  }
};
