import { Router } from "express";
import {
  createCharity,
  deleteCharity,
  getCharityBySlug,
  listCharities,
  updateCharity,
} from "../controllers/charity.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";

const router = Router();

router.get("/", listCharities);
router.get("/:slug", getCharityBySlug);

router.post("/", requireAuth, requireRole("admin"), createCharity);
router.patch("/:id", requireAuth, requireRole("admin"), updateCharity);
router.delete("/:id", requireAuth, requireRole("admin"), deleteCharity);

export default router;
