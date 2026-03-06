import { userRepository, jobRepository, matchRepository } from "../repositories";
import { DashboardStats } from "../types";

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const [totalDevelopers, totalJobs, totalMatches, averageMatchScore] =
      await Promise.all([
        userRepository.countAll(),
        jobRepository.countAll(),
        matchRepository.countAll(),
        matchRepository.averageScore(),
      ]);

    return {
      totalDevelopers,
      totalJobs,
      totalMatches,
      averageMatchScore: Math.round(averageMatchScore),
    };
  },
};
