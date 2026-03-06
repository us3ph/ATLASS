import { prisma } from "../database";
import { ApplicationStatus } from "../types";

export const applicationRepository = {
  async findByDeveloperAndJob(developerId: string, jobId: string) {
    return prisma.job_applications.findUnique({
      where: {
        developer_id_job_id: {
          developer_id: developerId,
          job_id: jobId,
        },
      },
    });
  },

  async create(
    developerId: string,
    jobId: string,
    coverLetter: string,
    matchScore: number | null,
    matchReason: string | null
  ) {
    return prisma.job_applications.create({
      data: {
        developer_id: developerId,
        job_id: jobId,
        cover_letter: coverLetter,
        match_score: matchScore,
        match_reason: matchReason,
      },
      include: {
        job: {
          include: {
            company: {
              select: { id: true, full_name: true },
            },
          },
        },
        developer: {
          include: {
            user: {
              select: { id: true, full_name: true, email: true },
            },
          },
        },
      },
    });
  },

  async findByDeveloper(developerId: string) {
    return prisma.job_applications.findMany({
      where: { developer_id: developerId },
      include: {
        job: {
          include: {
            company: {
              select: { id: true, full_name: true },
            },
          },
        },
        developer: {
          include: {
            user: {
              select: { id: true, full_name: true, email: true },
            },
          },
        },
      },
      orderBy: { applied_at: "desc" },
    });
  },

  async findByJob(jobId: string) {
    return prisma.job_applications.findMany({
      where: { job_id: jobId },
      include: {
        job: {
          include: {
            company: {
              select: { id: true, full_name: true },
            },
          },
        },
        developer: {
          include: {
            user: {
              select: { id: true, full_name: true, email: true },
            },
          },
        },
      },
      orderBy: { match_score: "desc" },
    });
  },

  async findByCompany(companyId: string) {
    return prisma.job_applications.findMany({
      where: {
        job: { company_id: companyId },
      },
      include: {
        job: {
          include: {
            company: {
              select: { id: true, full_name: true },
            },
          },
        },
        developer: {
          include: {
            user: {
              select: { id: true, full_name: true, email: true },
            },
          },
        },
      },
      orderBy: { applied_at: "desc" },
    });
  },

  async findById(applicationId: string) {
    return prisma.job_applications.findUnique({
      where: { id: applicationId },
      include: {
        job: {
          include: {
            company: {
              select: { id: true, full_name: true },
            },
          },
        },
        developer: {
          include: {
            user: {
              select: { id: true, full_name: true, email: true },
            },
          },
        },
      },
    });
  },

  async updateStatus(
    applicationId: string,
    status: ApplicationStatus,
    reviewerNotes?: string
  ) {
    return prisma.job_applications.update({
      where: { id: applicationId },
      data: {
        status,
        reviewer_notes: reviewerNotes ?? undefined,
        reviewed_at: new Date(),
      },
      include: {
        job: {
          include: {
            company: {
              select: { id: true, full_name: true },
            },
          },
        },
        developer: {
          include: {
            user: {
              select: { id: true, full_name: true, email: true },
            },
          },
        },
      },
    });
  },

  async countByJob(jobId: string) {
    return prisma.job_applications.count({
      where: { job_id: jobId },
    });
  },

  async countByCompany(companyId: string) {
    return prisma.job_applications.count({
      where: { job: { company_id: companyId } },
    });
  },

  async countAll() {
    return prisma.job_applications.count();
  },
};
