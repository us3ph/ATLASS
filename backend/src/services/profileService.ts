import { profileRepository } from "../repositories";
import { AppError } from "../middleware";
import { UpdateDeveloperProfilePayload, DeveloperProfile } from "../types";

const formatProfile = (profile: {
  id: string;
  user_id: string;
  bio: string;
  skills: string[];
  experience_years: number;
  github_url: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  location: string;
  available_for_remote: boolean;
  cv_url: string | null;
  created_at: Date;
  updated_at: Date;
}): DeveloperProfile => ({
  id: profile.id,
  userId: profile.user_id,
  bio: profile.bio,
  skills: profile.skills,
  experienceYears: profile.experience_years,
  githubUrl: profile.github_url ?? undefined,
  linkedinUrl: profile.linkedin_url ?? undefined,
  portfolioUrl: profile.portfolio_url ?? undefined,
  location: profile.location,
  availableForRemote: profile.available_for_remote,
  cvUrl: profile.cv_url ?? undefined,
  createdAt: profile.created_at,
  updatedAt: profile.updated_at,
});

export const profileService = {
  async getProfileByUserId(userId: string) {
    const profile = await profileRepository.findByUserId(userId);
    if (!profile) {
      throw new AppError("Developer profile not found", 404);
    }

    return {
      ...formatProfile(profile),
      user: {
        id: profile.user.id,
        email: profile.user.email,
        fullName: profile.user.full_name,
        role: profile.user.role,
        createdAt: profile.user.created_at,
      },
    };
  },

  async updateProfile(userId: string, profileData: UpdateDeveloperProfilePayload) {
    const existingProfile = await profileRepository.findByUserId(userId);
    if (!existingProfile) {
      throw new AppError("Developer profile not found", 404);
    }

    const updatedProfile = await profileRepository.update(userId, profileData);
    return {
      ...formatProfile(updatedProfile),
      user: {
        id: updatedProfile.user.id,
        email: updatedProfile.user.email,
        fullName: updatedProfile.user.full_name,
        role: updatedProfile.user.role,
        createdAt: updatedProfile.user.created_at,
      },
    };
  },
};
