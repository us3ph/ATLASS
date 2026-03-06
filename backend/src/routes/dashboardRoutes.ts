import { Router, Request, Response, NextFunction } from "express";
import { authenticateToken } from "../middleware";
import { dashboardService } from "../services";

const router = Router();

// GET /api/dashboard/stats
router.get(
  "/stats",
  authenticateToken,
  async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await dashboardService.getStats();

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
