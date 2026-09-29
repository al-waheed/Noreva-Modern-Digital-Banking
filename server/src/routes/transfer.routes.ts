import { Router } from "express";
import {
  findRecipient,
  transferMoney,
} from "../controllers/transfer.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.post("/recipient", authenticate, findRecipient);
router.post("/", authenticate, transferMoney);

export default router;
