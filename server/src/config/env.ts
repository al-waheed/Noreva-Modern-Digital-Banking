import dotenv from "dotenv";

dotenv.config();

const requiredEnv = [
  "DATABASE_URL",
  "JWT_SECRET",
  "FRONTEND_URL",
  "EMAILJS_SERVICE_ID",
  "EMAILJS_TEMPLATE_ID",
  "EMAILJS_PUBLIC_KEY",
  "EMAILJS_PRIVATE_KEY",
] as const;

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}
