import { jobRepository } from "../repositories";
import { AppError } from "../middleware";
import { CreateJobPayload, Job } from "../types";

const formatJob = (job: {
  id: string;
  company_id: string;
  title: string;
  description: string;
  required_skills: string[];
  location: string;
  is_remote: boolean;
  salary_min: number | null;
  salary_max: number | null;
  currency: string;
  status: string;
  created_at: Date;
  updated_at: Date;
}): Job => ({
  id: job.id,
  companyId: job.company_id,
  title: job.title,
  description: job.description,
  requiredSkills: job.required_skills,
  location: job.location,
  isRemote: job.is_remote,
  salaryMin: job.salary_min ?? undefined,
  salaryMax: job.salary_max ?? undefined,
  currency: job.currency,
  status: job.status as Job["status"],
  createdAt: job.created_at,
  updatedAt: job.updated_at,
});

export const jobService = {
  async getAllJobs() {
    const jobs = await jobRepository.findAll();
    return jobs.map((job) => ({
      ...formatJob(job),
      company: {
        id: job.company.id,
        name: job.company.full_name,
      },
    }));
  },

  async getJobById(jobId: string) {
    const job = await jobRepository.findById(jobId);
    if (!job) {
      throw new AppError("Job not found", 404);
    }

    return {
      ...formatJob(job),
      company: {
        id: job.company.id,
        name: job.company.full_name,
      },
    };
  },

  async createJob(companyId: string, jobData: CreateJobPayload) {
    const job = await jobRepository.create(companyId, jobData);
    return {
      ...formatJob(job),
      company: {
        id: job.company.id,
        name: job.company.full_name,
      },
    };
  },
};
