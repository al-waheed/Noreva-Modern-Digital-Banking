import { Router } from "express";
import {
  cancelScheduledPayment,
  createScheduledPayment,
  getScheduledPayments,
} from "../controllers/scheduledPayment.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.get("/", authenticate, getScheduledPayments);
router.post("/", authenticate, createScheduledPayment);
router.patch("/:id/cancel", authenticate, cancelScheduledPayment);

export default router;
