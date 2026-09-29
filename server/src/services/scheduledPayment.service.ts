import prisma from "../config/prisma";

const getNextScheduledDate = (
  date: Date,
  frequency: "DAILY" | "WEEKLY" | "MONTHLY",
) => {
  const nextDate = new Date(date);

  if (frequency === "DAILY") {
    nextDate.setDate(nextDate.getDate() + 1);
  }

  if (frequency === "WEEKLY") {
    nextDate.setDate(nextDate.getDate() + 7);
  }

  if (frequency === "MONTHLY") {
    nextDate.setMonth(nextDate.getMonth() + 1);
  }

  return nextDate;
};

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

    for (const payment of payments) {
      const senderWallet = payment.user.account?.wallet;
      const receiverWallet = payment.receiver?.account?.wallet;

      if (!senderWallet || !receiverWallet || !payment.receiver) {
        console.error(
          `Scheduled payment ${payment.id} has invalid account information.`,
        );

        continue;
      }

      // Make sure the sender has enough money.
      const senderUpdate = await prisma.wallet.updateMany({
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
        await prisma.scheduledPayment.update({
          where: {
            id: payment.id,
          },
          data: {
            status: "FAILED",
          },
        });

        console.log(
          `Scheduled payment ${payment.id} failed: insufficient balance.`,
        );

        continue;
      }

      try {
        await prisma.wallet.update({
          where: {
            id: receiverWallet.id,
          },
          data: {
            balance: {
              increment: payment.amount,
            },
          },
        });

        await prisma.transaction.createMany({
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

        if (payment.frequency === "ONCE") {
          await prisma.scheduledPayment.update({
            where: {
              id: payment.id,
            },
            data: {
              status: "SUCCESS",
            },
          });
        } else {
          await prisma.scheduledPayment.update({
            where: {
              id: payment.id,
            },
            data: {
              scheduledFor: getNextScheduledDate(
                payment.scheduledFor,
                payment.frequency,
              ),
            },
          });
        }

        console.log(`Scheduled payment ${payment.id} processed successfully.`);
      } catch (error) {
        // Return the money if something failed after deducting it.
        await prisma.wallet.update({
          where: {
            id: senderWallet.id,
          },
          data: {
            balance: {
              increment: payment.amount,
            },
          },
        });

        console.error(`Scheduled payment ${payment.id} failed:`, error);
      }
    }
  } catch (error) {
    console.error("Scheduled payment processor error:", error);
  }
};
