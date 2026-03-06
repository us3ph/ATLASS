import { Router } from "express";
import authRoutes from "./authRoutes";
import profileRoutes from "./profileRoutes";
import jobRoutes from "./jobRoutes";
import dashboardRoutes from "./dashboardRoutes";
import applicationRoutes from "./applicationRoutes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/profile", profileRoutes);
router.use("/jobs", jobRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/applications", applicationRoutes);

export default router;
