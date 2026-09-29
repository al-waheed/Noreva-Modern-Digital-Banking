import { Router } from "express";
import {
  getTransactions,
  getTransactionByReference,
} from "../controllers/transaction.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.get("/", authenticate, getTransactions);
router.get("/:reference", authenticate, getTransactionByReference);

export default router;