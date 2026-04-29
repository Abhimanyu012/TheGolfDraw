import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware.js";
import {
  createSubscriptionOrder,
  verifySubscriptionPayment,
} from "../controllers/payment.controller.js";

const router = Router();

router.use(requireAuth);
router.post("/subscriptions/order", createSubscriptionOrder);
router.post("/subscriptions/verify", verifySubscriptionPayment);

export default router;
