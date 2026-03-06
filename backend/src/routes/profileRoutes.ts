import { Router, Request, Response, NextFunction } from "express";
import { authenticateToken, requireRole } from "../middleware";
import { profileService } from "../services";
import { updateProfileSchema } from "../validators";

const router = Router();

// GET /api/profile/:id
router.get(
  "/:id",
  authenticateToken,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.params.id;
      const profile = await profileService.getProfileByUserId(userId);

      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/profile/update
router.put(
  "/update",
  authenticateToken,
  requireRole("developer"),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const validatedData = updateProfileSchema.parse(req.body);
      const updatedProfile = await profileService.updateProfile(userId, validatedData);

      res.status(200).json({
        success: true,
        data: updatedProfile,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
