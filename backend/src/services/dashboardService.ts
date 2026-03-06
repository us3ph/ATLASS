import { userRepository, jobRepository, matchRepository, applicationRepository } from "../repositories";
import { DashboardStats } from "../types";

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const [totalDevelopers, totalJobs, totalMatches, averageMatchScore, totalApplications] =
      await Promise.all([
        userRepository.countAll(),
        jobRepository.countAll(),
        matchRepository.countAll(),
        matchRepository.averageScore(),
        applicationRepository.countAll(),
      ]);

    return {
      totalDevelopers,
      totalJobs,
      totalMatches,
      averageMatchScore: Math.round(averageMatchScore),
      totalApplications,
    };
  },
};
