import { profileRepository, jobRepository, applicationRepository } from "../repositories";
import { matchService } from "./matchService";
import { AppError } from "../middleware";
import { ApplicationResponse, ApplicationStatus } from "../types";

const formatApplication = (app: {
  id: string;
  developer_id: string;
  job_id: string;
  cover_letter: string;
  cv_url: string | null;
  status: string;
  match_score: number | null;
  match_reason: string | null;
  reviewer_notes: string;
  applied_at: Date;
  reviewed_at: Date | null;
  job: { id: string; title: string; company: { id: string; full_name: string } };
  developer: {
    id: string;
    bio: string;
    skills: string[];
    experience_years: number;
    location: string;
    cv_url: string | null;
    user: { id: string; full_name: string; email: string };
  };
}): ApplicationResponse => ({
  id: app.id,
  developerId: app.developer_id,
  jobId: app.job_id,
  coverLetter: app.cover_letter,
  cvUrl: app.cv_url,
  status: app.status as ApplicationStatus,
  matchScore: app.match_score,
  matchReason: app.match_reason,
  reviewerNotes: app.reviewer_notes,
  appliedAt: app.applied_at,
  reviewedAt: app.reviewed_at,
  job: {
    id: app.job.id,
    title: app.job.title,
    company: { id: app.job.company.id, name: app.job.company.full_name },
  },
  developer: {
    id: app.developer.id,
    bio: app.developer.bio,
    skills: app.developer.skills,
    experienceYears: app.developer.experience_years,
    location: app.developer.location,
    cvUrl: app.developer.cv_url,
    user: {
      id: app.developer.user.id,
      fullName: app.developer.user.full_name,
      email: app.developer.user.email,
    },
  },
});

export const applicationService = {
  /**
   * Developer applies to a job — AI match runs automatically
   */
  async applyToJob(
    userId: string,
    jobId: string,
    coverLetter?: string,
    cvUrl?: string
  ): Promise<ApplicationResponse> {
    const developerProfile = await profileRepository.findByUserId(userId);
    if (!developerProfile) {
      throw new AppError("Please complete your profile before applying.", 404);
    }

    const job = await jobRepository.findById(jobId);
    if (!job) {
      throw new AppError("Job not found", 404);
    }

    if (job.status !== "open") {
      throw new AppError("This job is no longer accepting applications", 400);
    }

    // Check if already applied
    const existingApplication = await applicationRepository.findByDeveloperAndJob(
      developerProfile.id,
      jobId
    );
    if (existingApplication) {
      throw new AppError("You have already applied to this job", 409);
    }

    // Run AI matching
    let matchScore: number | null = null;
    let matchReason: string | null = null;

    try {
      const matchResult = await matchService.matchDeveloperToJob(userId, jobId);
      matchScore = matchResult.matchScore;
      matchReason = matchResult.matchReason;
    } catch (matchError) {
      console.error("[Application] AI matching failed, proceeding without score:", matchError);
      // Application still goes through even if AI fails
    }

    const application = await applicationRepository.create(
      developerProfile.id,
      jobId,
      coverLetter ?? "",
      matchScore,
      matchReason,
      cvUrl
    );

    return formatApplication(application);
  },

  /**
   * Developer views their own applications
   */
  async getMyApplications(userId: string): Promise<ApplicationResponse[]> {
    const developerProfile = await profileRepository.findByUserId(userId);
    if (!developerProfile) {
      throw new AppError("Developer profile not found", 404);
    }

    const applications = await applicationRepository.findByDeveloper(developerProfile.id);
    return applications.map(formatApplication);
  },

  /**
   * Company views applications for one of their jobs
   */
  async getJobApplications(
    companyUserId: string,
    jobId: string
  ): Promise<ApplicationResponse[]> {
    const job = await jobRepository.findById(jobId);
    if (!job) {
      throw new AppError("Job not found", 404);
    }

    if (job.company_id !== companyUserId) {
      throw new AppError("You can only view applications for your own jobs", 403);
    }

    const applications = await applicationRepository.findByJob(jobId);
    return applications.map(formatApplication);
  },

  /**
   * Company views all applications across all their jobs
   */
  async getCompanyApplications(companyUserId: string): Promise<ApplicationResponse[]> {
    const applications = await applicationRepository.findByCompany(companyUserId);
    return applications.map(formatApplication);
  },

  /**
   * Company updates application status (accept/reject/review)
   */
  async updateApplicationStatus(
    companyUserId: string,
    applicationId: string,
    status: ApplicationStatus,
    reviewerNotes?: string
  ): Promise<ApplicationResponse> {
    const application = await applicationRepository.findById(applicationId);
    if (!application) {
      throw new AppError("Application not found", 404);
    }

    // Verify the company owns this job
    if (application.job.company.id !== companyUserId) {
      throw new AppError("You can only update applications for your own jobs", 403);
    }

    const updated = await applicationRepository.updateStatus(
      applicationId,
      status,
      reviewerNotes
    );

    return formatApplication(updated);
  },
};
