import "dotenv/config";
import prisma from "./config/prisma";
import { processScheduledPayments } from "./services/scheduledPayment.service";

const runScheduledPayments = async () => {
  try {
    await processScheduledPayments();
  } finally {
    await prisma.$disconnect();
  }
};

void runScheduledPayments().catch((error) => {
  console.error("Scheduled payments job failed:", error);
  process.exitCode = 1;
});