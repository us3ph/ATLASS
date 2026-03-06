import { z } from "zod";

// ─── Auth Validators ───
export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters"),
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must be at most 100 characters"),
  role: z.enum(["developer", "company"]),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// ─── Profile Validators ───
export const updateProfileSchema = z.object({
  bio: z.string().max(2000).optional(),
  skills: z.array(z.string().max(50)).max(30).optional(),
  experienceYears: z.number().min(0).max(50).optional(),
  githubUrl: z.string().url().optional().or(z.literal("")),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
  portfolioUrl: z.string().url().optional().or(z.literal("")),
  location: z.string().max(100).optional(),
  availableForRemote: z.boolean().optional(),
});

// ─── Job Validators ───
export const createJobSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must be at most 200 characters"),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(5000, "Description must be at most 5000 characters"),
  requiredSkills: z
    .array(z.string().max(50))
    .min(1, "At least one skill is required")
    .max(20),
  location: z.string().max(100),
  isRemote: z.boolean(),
  salaryMin: z.number().positive().optional(),
  salaryMax: z.number().positive().optional(),
  currency: z.string().length(3).default("USD"),
});

// ─── Match Validators ───
export const matchJobSchema = z.object({
  jobId: z.string().uuid("Invalid job ID"),
});

// ─── Application Validators ───
export const applyToJobSchema = z.object({
  jobId: z.string().uuid("Invalid job ID"),
  coverLetter: z.string().max(3000, "Cover letter must be at most 3000 characters").optional(),
});

export const updateApplicationStatusSchema = z.object({
  status: z.enum(["pending", "reviewed", "accepted", "rejected"]),
  reviewerNotes: z.string().max(2000).optional(),
});
