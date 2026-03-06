import { Router, Request, Response, NextFunction } from "express";
import { authService } from "../services";
import { registerSchema, loginSchema } from "../validators";

const router = Router();

// POST /api/auth/register
router.post(
  "/register",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = registerSchema.parse(req.body);
      const authResponse = await authService.register(validatedData);

      res.status(201).json({
        success: true,
        data: authResponse,
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/auth/login
router.post(
  "/login",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = loginSchema.parse(req.body);
      const authResponse = await authService.login(validatedData);

      res.status(200).json({
        success: true,
        data: authResponse,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
