import { Router } from "express";
import { createDonation, listMyDonations } from "../controllers/donation.controller.js";
import { optionalAuth, requireAuth } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", optionalAuth, createDonation);
router.get("/me", requireAuth, listMyDonations);

export default router;
