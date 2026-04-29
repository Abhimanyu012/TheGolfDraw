import { Router } from "express";
import {
  broadcastSystemUpdate,
  listDonations,
  listSubscriptions,
  listUserScores,
  listUsers,
  updateSubscriptionStatus,
  updateUser,
  updateUserScore,
} from "../controllers/admin.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";

const router = Router();

router.use(requireAuth, requireRole("admin"));

router.get("/users", listUsers);
router.patch("/users/:userId", updateUser);
router.get("/users/:userId/scores", listUserScores);
router.patch("/users/:userId/scores/:scoreId", updateUserScore);
router.get("/subscriptions", listSubscriptions);
router.patch("/subscriptions/:subscriptionId/status", updateSubscriptionStatus);
router.get("/donations", listDonations);
router.post("/notifications/broadcast", broadcastSystemUpdate);

export default router;
