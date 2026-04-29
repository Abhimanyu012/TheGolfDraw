import { Router } from "express";
import {
  getAdminDashboard,
  getUserDashboard,
} from "../controllers/dashboard.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";

const router = Router();

router.get("/me", requireAuth, getUserDashboard);
router.get("/admin", requireAuth, requireRole("admin"), getAdminDashboard);

export default router;
