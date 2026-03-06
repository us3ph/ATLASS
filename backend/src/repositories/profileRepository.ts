import { prisma } from "../database";
import { UpdateDeveloperProfilePayload } from "../types";

export const profileRepository = {
  async findByUserId(userId: string) {
    return prisma.developer_profiles.findUnique({
      where: { user_id: userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            full_name: true,
            role: true,
            created_at: true,
          },
        },
      },
    });
  },

  async findById(profileId: string) {
    return prisma.developer_profiles.findUnique({
      where: { id: profileId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            full_name: true,
            role: true,
            created_at: true,
          },
        },
      },
    });
  },

  async createForUser(userId: string) {
    return prisma.developer_profiles.create({
      data: {
        user_id: userId,
      },
    });
  },

  async update(userId: string, profileData: UpdateDeveloperProfilePayload) {
    return prisma.developer_profiles.update({
      where: { user_id: userId },
      data: {
        bio: profileData.bio,
        skills: profileData.skills,
        experience_years: profileData.experienceYears,
        github_url: profileData.githubUrl,
        linkedin_url: profileData.linkedinUrl,
        portfolio_url: profileData.portfolioUrl,
        location: profileData.location,
        available_for_remote: profileData.availableForRemote,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            full_name: true,
            role: true,
            created_at: true,
          },
        },
      },
    });
  },

  async countAll() {
    return prisma.developer_profiles.count();
  },
};
