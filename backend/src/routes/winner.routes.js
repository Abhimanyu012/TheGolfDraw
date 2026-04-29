import { Router } from "express";
import {
  listAllWinners,
  listMyWinnings,
  reviewWinner,
  uploadWinnerProof,
} from "../controllers/winner.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { uploadProof } from "../middlewares/upload.middleware.js";

const router = Router();

router.use(requireAuth);
router.get("/me", listMyWinnings);
router.patch("/:winnerId/proof", uploadProof.single("proof"), uploadWinnerProof);
router.get("/", requireRole("admin"), listAllWinners);
router.patch("/:winnerId/review", requireRole("admin"), reviewWinner);

export default router;
