import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  findRecipient,
  transferMoney,
} from "../controllers/transfer.controller";

import { authenticate } from "../middleware/auth.middleware";

const router = Router();

const transferLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many transfer attempts. Please try again later.",
  },
});

router.post("/recipient", authenticate, findRecipient);

router.post("/", authenticate, transferLimiter, transferMoney);

export default router;
