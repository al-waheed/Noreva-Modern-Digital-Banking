import express from "express";
import cors from "cors";
import "./config/env";
import prisma from "./config/prisma";
import authRoutes from "./routes/auth.routes";
import transferRoutes from "./routes/transfer.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import transactionRoutes from "./routes/transaction.routes";
import scheduledPaymentRoutes from "./routes/scheduledPayment.routes";
import notificationRoutes from "./routes/notification.routes";
import { processScheduledPayments } from "./services/scheduledPayment.service";

const app = express();

// const allowedOrigin = process.env.FRONTEND_URL;

// app.use(
//   cors({
//     origin: allowedOrigin,
//     credentials: true,
//   }),
// );

const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/transfers", transferRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/scheduled-payments", scheduledPaymentRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/api/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      success: true,
      message: "Fintech API and database are running",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

setInterval(() => {
  processScheduledPayments();
}, 60 * 1000);

processScheduledPayments();
