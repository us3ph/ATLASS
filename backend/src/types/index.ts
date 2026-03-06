// ──────────────────────────────────────
// Shared TypeScript types for ATLASS
// ──────────────────────────────────────

// ─── API Response Types ───
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

// ─── Auth Types ───
export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthTokenPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  token: string;
  user: UserPublic;
}

// ─── User Types ───
export type UserRole = "developer" | "company" | "admin";

export interface UserPublic {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  createdAt: Date;
}

// ─── Developer Profile Types ───
export interface DeveloperProfile {
  id: string;
  userId: string;
  bio: string;
  skills: string[];
  experienceYears: number;
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  location: string;
  availableForRemote: boolean;
  cvUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateDeveloperProfilePayload {
  bio?: string;
  skills?: string[];
  experienceYears?: number;
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  location?: string;
  availableForRemote?: boolean;
  cvUrl?: string;
}

// ─── Job Types ───
export interface Job {
  id: string;
  companyId: string;
  title: string;
  description: string;
  requiredSkills: string[];
  location: string;
  isRemote: boolean;
  salaryMin?: number;
  salaryMax?: number;
  currency: string;
  status: JobStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type JobStatus = "open" | "closed" | "draft";

export interface CreateJobPayload {
  title: string;
  description: string;
  requiredSkills: string[];
  location: string;
  isRemote: boolean;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
}

// ─── AI Match Types ───
export interface MatchResult {
  score: number;
  reason: string;
}

export interface JobMatchResponse {
  jobId: string;
  jobTitle: string;
  companyName: string;
  matchScore: number;
  matchReason: string;
}

// ─── Dashboard Types ───
export interface DashboardStats {
  totalDevelopers: number;
  totalJobs: number;
  totalMatches: number;
  averageMatchScore: number;
  totalApplications: number;
}

// ─── Application Types ───
export type ApplicationStatus = "pending" | "reviewed" | "accepted" | "rejected";

export interface ApplicationResponse {
  id: string;
  developerId: string;
  jobId: string;
  coverLetter: string;
  cvUrl: string | null;
  status: ApplicationStatus;
  matchScore: number | null;
  matchReason: string | null;
  reviewerNotes: string;
  appliedAt: Date;
  reviewedAt: Date | null;
  job: {
    id: string;
    title: string;
    company: { id: string; name: string };
  };
  developer: {
    id: string;
    bio: string;
    skills: string[];
    experienceYears: number;
    location: string;
    cvUrl: string | null;
    user: { id: string; fullName: string; email: string };
  };
}

export interface ApplyToJobPayload {
  jobId: string;
  coverLetter?: string;
}

export interface UpdateApplicationStatusPayload {
  status: ApplicationStatus;
  reviewerNotes?: string;
}

// ─── Express Augmentation ───
declare global {
  namespace Express {
    interface Request {
      user?: AuthTokenPayload;
    }
  }
}
