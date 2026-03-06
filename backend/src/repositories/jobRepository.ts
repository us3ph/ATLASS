import { prisma } from "../database";
import { CreateJobPayload, JobStatus } from "../types";

export const jobRepository = {
  async findAll(status?: JobStatus) {
    return prisma.jobs.findMany({
      where: status ? { status } : { status: "open" },
      include: {
        company: {
          select: {
            id: true,
            full_name: true,
            email: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    });
  },

  async findById(jobId: string) {
    return prisma.jobs.findUnique({
      where: { id: jobId },
      include: {
        company: {
          select: {
            id: true,
            full_name: true,
            email: true,
          },
        },
      },
    });
  },

  async create(companyId: string, jobData: CreateJobPayload) {
    return prisma.jobs.create({
      data: {
        company_id: companyId,
        title: jobData.title,
        description: jobData.description,
        required_skills: jobData.requiredSkills,
        location: jobData.location,
        is_remote: jobData.isRemote,
        salary_min: jobData.salaryMin,
        salary_max: jobData.salaryMax,
        currency: jobData.currency ?? "USD",
      },
      include: {
        company: {
          select: {
            id: true,
            full_name: true,
            email: true,
          },
        },
      },
    });
  },

  async countAll() {
    return prisma.jobs.count({ where: { status: "open" } });
  },
};
