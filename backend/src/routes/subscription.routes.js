import { Router } from "express";
import {
  cancelSubscription,
  getMySubscription,
  upsertSubscription,
} from "../controllers/subscription.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(requireAuth);
router.get("/me", getMySubscription);
router.post("/activate", upsertSubscription);
router.patch("/cancel", cancelSubscription);

export default router;
