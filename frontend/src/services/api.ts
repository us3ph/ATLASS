import axios from "axios";
import type {
  ApiResponse,
  AuthResponse,
  RegisterPayload,
  LoginPayload,
  DeveloperProfile,
  UpdateProfilePayload,
  Job,
  JobMatchResponse,
  DashboardStats,
  ApplicationResponse,
} from "../types";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// ─── Request Interceptor — Attach JWT Token ───
apiClient.interceptors.request.use((requestConfig) => {
  const token = localStorage.getItem("atlass_token");
  if (token) {
    requestConfig.headers.Authorization = `Bearer ${token}`;
  }
  return requestConfig;
});

// ─── Response Interceptor — Handle errors globally ───
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("atlass_token");
      localStorage.removeItem("atlass_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ──────────────────────────────────────
// API Methods
// ──────────────────────────────────────

// ─── Auth ───
export const authApi = {
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>("/auth/register", payload);
    return (response.data as { success: true; data: AuthResponse }).data;
  },

  async login(payload: LoginPayload): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>("/auth/login", payload);
    return (response.data as { success: true; data: AuthResponse }).data;
  },
};

// ─── Profile ───
export const profileApi = {
  async getProfile(userId: string): Promise<DeveloperProfile> {
    const response = await apiClient.get<ApiResponse<DeveloperProfile>>(`/profile/${userId}`);
    return (response.data as { success: true; data: DeveloperProfile }).data;
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<DeveloperProfile> {
    const response = await apiClient.put<ApiResponse<DeveloperProfile>>("/profile/update", payload);
    return (response.data as { success: true; data: DeveloperProfile }).data;
  },
};

// ─── Jobs ───
export const jobsApi = {
  async getAllJobs(): Promise<Job[]> {
    const response = await apiClient.get<ApiResponse<Job[]>>("/jobs");
    return (response.data as { success: true; data: Job[] }).data;
  },

  async getJobById(jobId: string): Promise<Job> {
    const response = await apiClient.get<ApiResponse<Job>>(`/jobs/${jobId}`);
    return (response.data as { success: true; data: Job }).data;
  },

  async matchJob(jobId: string): Promise<JobMatchResponse> {
    const response = await apiClient.post<ApiResponse<JobMatchResponse>>("/jobs/match", { jobId });
    return (response.data as { success: true; data: JobMatchResponse }).data;
  },

  async getMyMatches(): Promise<JobMatchResponse[]> {
    const response = await apiClient.get<ApiResponse<JobMatchResponse[]>>("/jobs/matches/me");
    return (response.data as { success: true; data: JobMatchResponse[] }).data;
  },
};

// ─── Dashboard ───
export const dashboardApi = {
  async getStats(): Promise<DashboardStats> {
    const response = await apiClient.get<ApiResponse<DashboardStats>>("/dashboard/stats");
    return (response.data as { success: true; data: DashboardStats }).data;
  },
};

// ─── Applications ───
export const applicationsApi = {
  async applyToJob(jobId: string, coverLetter?: string): Promise<ApplicationResponse> {
    const response = await apiClient.post<ApiResponse<ApplicationResponse>>("/applications/apply", {
      jobId,
      coverLetter,
    });
    return (response.data as { success: true; data: ApplicationResponse }).data;
  },

  async getMyApplications(): Promise<ApplicationResponse[]> {
    const response = await apiClient.get<ApiResponse<ApplicationResponse[]>>("/applications/me");
    return (response.data as { success: true; data: ApplicationResponse[] }).data;
  },

  async getCompanyApplications(): Promise<ApplicationResponse[]> {
    const response = await apiClient.get<ApiResponse<ApplicationResponse[]>>("/applications/company");
    return (response.data as { success: true; data: ApplicationResponse[] }).data;
  },

  async getJobApplications(jobId: string): Promise<ApplicationResponse[]> {
    const response = await apiClient.get<ApiResponse<ApplicationResponse[]>>(`/applications/job/${jobId}`);
    return (response.data as { success: true; data: ApplicationResponse[] }).data;
  },

  async updateStatus(
    applicationId: string,
    status: string,
    reviewerNotes?: string
  ): Promise<ApplicationResponse> {
    const response = await apiClient.put<ApiResponse<ApplicationResponse>>(
      `/applications/${applicationId}/status`,
      { status, reviewerNotes }
    );
    return (response.data as { success: true; data: ApplicationResponse }).data;
  },
};

export default apiClient;
