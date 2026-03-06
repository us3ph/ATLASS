// ──────────────────────────────────────
// Shared TypeScript types for ATLASS Frontend
// ──────────────────────────────────────

// ─── API Response ───
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

// ─── Auth ───
export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
  role: "developer" | "company";
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: UserPublic;
}

// ─── User ───
export type UserRole = "developer" | "company" | "admin";

export interface UserPublic {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  createdAt: string;
}

// ─── Developer Profile ───
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
  createdAt: string;
  updatedAt: string;
  user: UserPublic;
}

export interface UpdateProfilePayload {
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

// ─── Job ───
export type JobStatus = "open" | "closed" | "draft";

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
  createdAt: string;
  updatedAt: string;
  company: {
    id: string;
    name: string;
  };
}

// ─── AI Match ───
export interface JobMatchResponse {
  jobId: string;
  jobTitle: string;
  companyName: string;
  matchScore: number;
  matchReason: string;
}

// ─── Dashboard ───
export interface DashboardStats {
  totalDevelopers: number;
  totalJobs: number;
  totalMatches: number;
  averageMatchScore: number;
  totalApplications: number;
}

// ─── Applications ───
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
  appliedAt: string;
  reviewedAt: string | null;
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

// ─── Auth Context ───
export interface AuthContextType {
  user: UserPublic | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  loginWithToken: (token: string, user: UserPublic) => void;
  logout: () => void;
}
