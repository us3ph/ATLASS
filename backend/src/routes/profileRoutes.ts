import { Router, Request, Response, NextFunction } from "express";
import { authenticateToken, requireRole, cvUpload } from "../middleware";
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

// PUT /api/profile/update  (supports multipart/form-data with CV file)
router.put(
  "/update",
  authenticateToken,
  requireRole("developer"),
  cvUpload.single("cv"),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;

      // Parse JSON fields from multipart body
      const bodyData = { ...req.body };
      if (typeof bodyData.skills === "string") {
        bodyData.skills = JSON.parse(bodyData.skills);
      }
      if (typeof bodyData.experienceYears === "string") {
        bodyData.experienceYears = parseInt(bodyData.experienceYears, 10);
      }
      if (typeof bodyData.availableForRemote === "string") {
        bodyData.availableForRemote = bodyData.availableForRemote === "true";
      }

      const validatedData = updateProfileSchema.parse(bodyData);

      // Attach CV URL if file was uploaded
      if (req.file) {
        validatedData.cvUrl = `/uploads/cvs/${req.file.filename}`;
      }

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
