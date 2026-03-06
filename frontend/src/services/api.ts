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

  async updateProfile(payload: UpdateProfilePayload, cvFile?: File): Promise<DeveloperProfile> {
    // Use FormData when there's a CV file
    if (cvFile) {
      const formData = new FormData();
      formData.append("cv", cvFile);
      // Append all other fields
      if (payload.bio !== undefined) formData.append("bio", payload.bio);
      if (payload.skills !== undefined) formData.append("skills", JSON.stringify(payload.skills));
      if (payload.experienceYears !== undefined) formData.append("experienceYears", String(payload.experienceYears));
      if (payload.githubUrl !== undefined) formData.append("githubUrl", payload.githubUrl);
      if (payload.linkedinUrl !== undefined) formData.append("linkedinUrl", payload.linkedinUrl);
      if (payload.portfolioUrl !== undefined) formData.append("portfolioUrl", payload.portfolioUrl);
      if (payload.location !== undefined) formData.append("location", payload.location);
      if (payload.availableForRemote !== undefined) formData.append("availableForRemote", String(payload.availableForRemote));

      const response = await apiClient.put<ApiResponse<DeveloperProfile>>("/profile/update", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return (response.data as { success: true; data: DeveloperProfile }).data;
    }

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
  async applyToJob(jobId: string, coverLetter?: string, cvFile?: File): Promise<ApplicationResponse> {
    // Always use FormData to support optional CV upload
    const formData = new FormData();
    formData.append("jobId", jobId);
    if (coverLetter) formData.append("coverLetter", coverLetter);
    if (cvFile) formData.append("cv", cvFile);

    const response = await apiClient.post<ApiResponse<ApplicationResponse>>("/applications/apply", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 30000, // AI matching + upload may take longer
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
