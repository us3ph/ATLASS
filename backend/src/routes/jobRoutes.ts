import { Router, Request, Response, NextFunction } from "express";
import { authenticateToken, requireRole } from "../middleware";
import { jobService, matchService } from "../services";
import { createJobSchema, matchJobSchema } from "../validators";

const router = Router();

// GET /api/jobs
router.get(
  "/",
  async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const jobs = await jobService.getAllJobs();

      res.status(200).json({
        success: true,
        data: jobs,
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/jobs/:id
router.get(
  "/:id",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const jobId = req.params.id;
      const job = await jobService.getJobById(jobId);

      res.status(200).json({
        success: true,
        data: job,
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/jobs  (company only)
router.post(
  "/",
  authenticateToken,
  requireRole("company", "admin"),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const companyId = req.user!.userId;
      const validatedData = createJobSchema.parse(req.body);
      const newJob = await jobService.createJob(companyId, validatedData);

      res.status(201).json({
        success: true,
        data: newJob,
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/jobs/match  (AI matching — developer only)
router.post(
  "/match",
  authenticateToken,
  requireRole("developer"),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const { jobId } = matchJobSchema.parse(req.body);
      const matchResult = await matchService.matchDeveloperToJob(userId, jobId);

      res.status(200).json({
        success: true,
        data: matchResult,
      });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/jobs/matches/me  (developer sees their matches)
router.get(
  "/matches/me",
  authenticateToken,
  requireRole("developer"),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.userId;
      const matches = await matchService.getDeveloperMatches(userId);

      res.status(200).json({
        success: true,
        data: matches,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
