import { Router } from "express";
import {
  addScore,
  deleteScore,
  listMyScores,
  updateScore,
} from "../controllers/score.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireActiveSubscription } from "../middlewares/subscription.middleware.js";

const router = Router();

router.use(requireAuth);
router.use(requireActiveSubscription);
router.get("/", listMyScores);
router.post("/", addScore);
router.patch("/:id", updateScore);
router.delete("/:id", deleteScore);

export default router;
