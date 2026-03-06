import { Router, Request, Response, NextFunction } from "express";
import { authenticateToken, requireRole } from "../middleware";
import { applicationService } from "../services";
import { applyToJobSchema, updateApplicationStatusSchema } from "../validators";

const router = Router();

// POST /api/applications/apply  — Developer applies to a job (AI match runs automatically)
router.post(
  "/apply",
  authenticateToken,
  requireRole("developer"),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { jobId, coverLetter } = applyToJobSchema.parse(req.body);
      const application = await applicationService.applyToJob(userId, jobId, coverLetter);

      res.status(201).json({
        success: true,
        data: application,
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/applications/me  — Developer sees their applications
router.get(
  "/me",
  authenticateToken,
  requireRole("developer"),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const applications = await applicationService.getMyApplications(userId);

      res.status(200).json({
        success: true,
        data: applications,
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/applications/company  — Company sees all applications for their jobs
router.get(
  "/company",
  authenticateToken,
  requireRole("company", "admin"),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const companyUserId = req.user!.userId;
      const applications = await applicationService.getCompanyApplications(companyUserId);

      res.status(200).json({
        success: true,
        data: applications,
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/applications/job/:jobId  — Company sees applications for a specific job
router.get(
  "/job/:jobId",
  authenticateToken,
  requireRole("company", "admin"),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const companyUserId = req.user!.userId;
      const jobId = req.params.jobId;
      const applications = await applicationService.getJobApplications(companyUserId, jobId);

      res.status(200).json({
        success: true,
        data: applications,
      });
    } catch (error) {
      next(error);
    }
  }
);

// PUT /api/applications/:id/status  — Company updates application status
router.put(
  "/:id/status",
  authenticateToken,
  requireRole("company", "admin"),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const companyUserId = req.user!.userId;
      const applicationId = req.params.id;
      const { status, reviewerNotes } = updateApplicationStatusSchema.parse(req.body);

      const updated = await applicationService.updateApplicationStatus(
        companyUserId,
        applicationId,
        status,
        reviewerNotes
      );

      res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
