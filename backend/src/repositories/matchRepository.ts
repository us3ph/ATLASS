import { prisma } from "../database";

export const matchRepository = {
  async findByDeveloperAndJob(developerId: string, jobId: string) {
    return prisma.job_matches.findUnique({
      where: {
        developer_id_job_id: {
          developer_id: developerId,
          job_id: jobId,
        },
      },
    });
  },

  async upsert(developerId: string, jobId: string, score: number, reason: string) {
    return prisma.job_matches.upsert({
      where: {
        developer_id_job_id: {
          developer_id: developerId,
          job_id: jobId,
        },
      },
      update: {
        score,
        reason,
      },
      create: {
        developer_id: developerId,
        job_id: jobId,
        score,
        reason,
      },
    });
  },

  async findByDeveloper(developerId: string) {
    return prisma.job_matches.findMany({
      where: { developer_id: developerId },
      include: {
        job: {
          include: {
            company: {
              select: {
                id: true,
                full_name: true,
              },
            },
          },
        },
      },
      orderBy: { score: "desc" },
    });
  },

  async countAll() {
    return prisma.job_matches.count();
  },

  async averageScore() {
    const result = await prisma.job_matches.aggregate({
      _avg: { score: true },
    });
    return result._avg.score ?? 0;
  },
};
