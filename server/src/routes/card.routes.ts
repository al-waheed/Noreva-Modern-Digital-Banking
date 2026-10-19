import { Router } from "express";
import { updateCardStatus } from "../controllers/card.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.patch("/:id/status", authenticate, updateCardStatus);

export default router;