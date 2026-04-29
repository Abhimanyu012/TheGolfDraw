import { Router } from "express";
import {
  listPublishedDraws,
  publishDraw,
  simulateDraw,
} from "../controllers/draw.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";

const router = Router();

router.get("/", listPublishedDraws);
router.post("/simulate", requireAuth, requireRole("admin"), simulateDraw);
router.post("/publish", requireAuth, requireRole("admin"), publishDraw);

export default router;
