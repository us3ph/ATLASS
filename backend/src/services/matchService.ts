import OpenAI from "openai";
import { config } from "../config";
import { profileRepository, jobRepository, matchRepository } from "../repositories";
import { AppError } from "../middleware";
import { MatchResult, JobMatchResponse } from "../types";

const openai = new OpenAI({
  apiKey: config.openaiApiKey,
});

const buildMatchPrompt = (
  developerProfile: {
    skills: string[];
    experience_years: number;
    bio: string;
  },
  job: {
    title: string;
    required_skills: string[];
    description: string;
  }
): string => {
  return `Given this developer profile:
- Skills: ${developerProfile.skills.join(", ")}
- Experience: ${developerProfile.experience_years} years
- Bio: ${developerProfile.bio}

And this job:
- Title: ${job.title}
- Required Skills: ${job.required_skills.join(", ")}
- Description: ${job.description}

Analyze how well this developer matches this job opportunity. Consider skill overlap, experience level, and overall fit.

Return ONLY a valid JSON object with no additional text:
{ "score": <number 0-100>, "reason": "<brief explanation of the match>" }`;
};

const parseMatchResponse = (content: string): MatchResult => {
  try {
    const cleaned = content.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    const score = Math.max(0, Math.min(100, Math.round(Number(parsed.score))));
    const reason = String(parsed.reason || "No reason provided");

    return { score, reason };
  } catch (parseError) {
    throw new AppError("Failed to parse AI matching response", 502);
  }
};

export const matchService = {
  async matchDeveloperToJob(userId: string, jobId: string): Promise<JobMatchResponse> {
    const developerProfile = await profileRepository.findByUserId(userId);
    if (!developerProfile) {
      throw new AppError("Developer profile not found. Please complete your profile first.", 404);
    }

    const job = await jobRepository.findById(jobId);
    if (!job) {
      throw new AppError("Job not found", 404);
    }

    if (job.status !== "open") {
      throw new AppError("This job is no longer accepting applications", 400);
    }

    // Check if skills exist on the profile
    if (developerProfile.skills.length === 0) {
      throw new AppError("Please add skills to your profile before matching", 400);
    }

    const prompt = buildMatchPrompt(
      {
        skills: developerProfile.skills,
        experience_years: developerProfile.experience_years,
        bio: developerProfile.bio,
      },
      {
        title: job.title,
        required_skills: job.required_skills,
        description: job.description,
      }
    );

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "You are an expert recruiter AI. Evaluate developer-job matches and return JSON with a score (0-100) and a reason.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 300,
      });

      const responseContent = completion.choices[0]?.message?.content;
      if (!responseContent) {
        throw new AppError("AI service returned an empty response", 502);
      }

      const matchResult = parseMatchResponse(responseContent);

      // Save the match result to the database
      await matchRepository.upsert(
        developerProfile.id,
        jobId,
        matchResult.score,
        matchResult.reason
      );

      return {
        jobId: job.id,
        jobTitle: job.title,
        companyName: job.company.full_name,
        matchScore: matchResult.score,
        matchReason: matchResult.reason,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      console.error("[AI Match Error]", error);
      throw new AppError("AI matching service is temporarily unavailable", 503);
    }
  },

  async getDeveloperMatches(userId: string): Promise<JobMatchResponse[]> {
    const developerProfile = await profileRepository.findByUserId(userId);
    if (!developerProfile) {
      throw new AppError("Developer profile not found", 404);
    }

    const matches = await matchRepository.findByDeveloper(developerProfile.id);

    return matches.map((match) => ({
      jobId: match.job.id,
      jobTitle: match.job.title,
      companyName: match.job.company.full_name,
      matchScore: match.score,
      matchReason: match.reason,
    }));
  },
};
