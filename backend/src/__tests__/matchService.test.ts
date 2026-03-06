/**
 * AI Matching Tests — ATLASS
 *
 * Tests the core AI matching logic:
 *  - Prompt construction
 *  - Response parsing (valid JSON, edge cases, malformed input)
 *  - Score clamping (0–100)
 *  - Error handling
 *  - Full matching flow with mocked OpenAI client
 */

// Mock config BEFORE any imports that depend on it
jest.mock("../config", () => ({
  config: {
    aiApiKey: "test-key",
    aiBaseUrl: "https://openrouter.ai/api/v1",
    aiModel: "test-model",
    port: 4000,
    nodeEnv: "test",
    databaseUrl: "postgresql://test:test@localhost:5432/test",
    jwtSecret: "test-secret",
    corsOrigin: "*",
    backendUrl: "http://localhost:4000",
    githubClientId: "",
    githubClientSecret: "",
    googleClientId: "",
    googleClientSecret: "",
  },
}));

// Mock repositories
jest.mock("../repositories", () => ({
  profileRepository: {
    findByUserId: jest.fn(),
  },
  jobRepository: {
    findById: jest.fn(),
  },
  matchRepository: {
    upsert: jest.fn(),
    findByDeveloper: jest.fn(),
  },
}));

// Mock OpenAI
const mockCreate = jest.fn();
jest.mock("openai", () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: mockCreate,
      },
    },
  }));
});

import { parseMatchResponse, buildMatchPrompt, matchService } from "../services/matchService";
import { AppError } from "../middleware";
import { profileRepository, jobRepository, matchRepository } from "../repositories";

// Type the mocked functions
const mockedProfileRepo = profileRepository as jest.Mocked<typeof profileRepository>;
const mockedJobRepo = jobRepository as jest.Mocked<typeof jobRepository>;
const mockedMatchRepo = matchRepository as jest.Mocked<typeof matchRepository>;

// ---------------------------------------------------------------------------
// 1. buildMatchPrompt — prompt construction
// ---------------------------------------------------------------------------
describe("buildMatchPrompt", () => {
  const developer = {
    skills: ["TypeScript", "React", "Node.js"],
    experience_years: 5,
    bio: "Full-stack engineer from Casablanca",
  };

  const job = {
    title: "Senior Frontend Engineer",
    required_skills: ["React", "TypeScript", "CSS"],
    description: "Build modern web interfaces for a SaaS platform",
  };

  it("should include all developer skills in the prompt", () => {
    const prompt = buildMatchPrompt(developer, job);
    expect(prompt).toContain("TypeScript");
    expect(prompt).toContain("React");
    expect(prompt).toContain("Node.js");
  });

  it("should include experience years", () => {
    const prompt = buildMatchPrompt(developer, job);
    expect(prompt).toContain("5 years");
  });

  it("should include developer bio", () => {
    const prompt = buildMatchPrompt(developer, job);
    expect(prompt).toContain("Full-stack engineer from Casablanca");
  });

  it("should include job title and required skills", () => {
    const prompt = buildMatchPrompt(developer, job);
    expect(prompt).toContain("Senior Frontend Engineer");
    expect(prompt).toContain("CSS");
  });

  it("should include job description", () => {
    const prompt = buildMatchPrompt(developer, job);
    expect(prompt).toContain("Build modern web interfaces");
  });

  it("should request JSON output with score and reason", () => {
    const prompt = buildMatchPrompt(developer, job);
    expect(prompt).toContain('"score"');
    expect(prompt).toContain('"reason"');
    expect(prompt).toContain("JSON");
  });

  it("should handle empty skills array", () => {
    const noSkills = { ...developer, skills: [] as string[] };
    const prompt = buildMatchPrompt(noSkills, job);
    expect(prompt).toContain("Skills: ");
  });

  it("should handle empty bio", () => {
    const noBio = { ...developer, bio: "" };
    const prompt = buildMatchPrompt(noBio, job);
    expect(prompt).toContain("Bio: ");
  });
});

// ---------------------------------------------------------------------------
// 2. parseMatchResponse — JSON extraction and validation
// ---------------------------------------------------------------------------
describe("parseMatchResponse", () => {
  beforeEach(() => {
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  // -- Valid JSON responses --

  it("should parse a clean JSON response", () => {
    const result = parseMatchResponse('{"score": 85, "reason": "Strong skill overlap"}');
    expect(result.score).toBe(85);
    expect(result.reason).toBe("Strong skill overlap");
  });

  it("should parse JSON with extra whitespace", () => {
    const result = parseMatchResponse('  { "score" : 72 , "reason" : "Good match" }  ');
    expect(result.score).toBe(72);
    expect(result.reason).toBe("Good match");
  });

  it("should parse JSON wrapped in markdown code fences", () => {
    const input = '```json\n{"score": 60, "reason": "Moderate overlap"}\n```';
    const result = parseMatchResponse(input);
    expect(result.score).toBe(60);
    expect(result.reason).toBe("Moderate overlap");
  });

  it("should parse JSON wrapped in bare code fences", () => {
    const input = '```\n{"score": 55, "reason": "Some overlap"}\n```';
    const result = parseMatchResponse(input);
    expect(result.score).toBe(55);
  });

  it("should extract JSON from surrounding text", () => {
    const input = 'Here is the analysis:\n{"score": 78, "reason": "Developer has relevant skills"}\nHope this helps!';
    const result = parseMatchResponse(input);
    expect(result.score).toBe(78);
    expect(result.reason).toBe("Developer has relevant skills");
  });

  it("should handle multiline JSON", () => {
    const input = `{
      "score": 90,
      "reason": "Excellent match with requirements"
    }`;
    const result = parseMatchResponse(input);
    expect(result.score).toBe(90);
  });

  // -- Score clamping --

  it("should clamp score above 100 to 100", () => {
    const result = parseMatchResponse('{"score": 150, "reason": "Overfit"}');
    expect(result.score).toBe(100);
  });

  it("should clamp negative score to 0", () => {
    const result = parseMatchResponse('{"score": -20, "reason": "Negative test"}');
    expect(result.score).toBe(0);
  });

  it("should round decimal scores", () => {
    const result = parseMatchResponse('{"score": 72.7, "reason": "Rounded"}');
    expect(result.score).toBe(73);
  });

  it("should handle score of 0", () => {
    const result = parseMatchResponse('{"score": 0, "reason": "No match at all"}');
    expect(result.score).toBe(0);
    expect(result.reason).toBe("No match at all");
  });

  it("should handle score of 100", () => {
    const result = parseMatchResponse('{"score": 100, "reason": "Perfect match"}');
    expect(result.score).toBe(100);
  });

  // -- Edge cases for reason --

  it("should return default reason when reason is missing", () => {
    const result = parseMatchResponse('{"score": 50}');
    expect(result.reason).toBe("No reason provided");
  });

  it("should handle reason with special characters", () => {
    const result = parseMatchResponse('{"score": 65, "reason": "React & TypeScript skills are strong"}');
    expect(result.score).toBe(65);
    expect(result.reason).toContain("React & TypeScript");
  });

  // -- Score as string --

  it("should handle score as string number", () => {
    const result = parseMatchResponse('{"score": "80", "reason": "String score"}');
    expect(result.score).toBe(80);
  });

  // -- Invalid / malformed responses --

  it("should throw AppError for completely invalid content", () => {
    expect(() => parseMatchResponse("This is not JSON at all")).toThrow(AppError);
  });

  it("should throw AppError for empty string", () => {
    expect(() => parseMatchResponse("")).toThrow(AppError);
  });

  it("should throw with status 502 for parse failures", () => {
    try {
      parseMatchResponse("not json");
      fail("Should have thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect((error as AppError).statusCode).toBe(502);
    }
  });

  it("should handle JSON without score/reason structure gracefully", () => {
    // parseMatchResponse extracts any JSON with score/reason pattern via regex;
    // if the JSON doesn't have those keys, Number(undefined) = NaN
    const result = parseMatchResponse('{"name": "test", "value": 42}');
    expect(result.reason).toBe("No reason provided");
  });

  // -- Complex real-world AI responses --

  it("should parse response with extra fields (resilience)", () => {
    const input = '{"score": 88, "reason": "Strong match", "confidence": "high", "details": {"skills_overlap": 5}}';
    const result = parseMatchResponse(input);
    expect(result.score).toBe(88);
    expect(result.reason).toBe("Strong match");
  });

  it("should parse response with explanation preamble and markdown fences", () => {
    const input = `Based on my analysis:

\`\`\`json
{
  "score": 74,
  "reason": "The developer has 3 out of 5 required skills with 5 years of experience."
}
\`\`\`

This score reflects a strong foundation.`;
    const result = parseMatchResponse(input);
    expect(result.score).toBe(74);
    expect(result.reason).toContain("3 out of 5 required skills");
  });
});

// ---------------------------------------------------------------------------
// 3. matchService integration tests (mocked OpenAI + repositories)
// ---------------------------------------------------------------------------
describe("matchService.matchDeveloperToJob", () => {
  beforeEach(() => {
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.clearAllMocks();
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should throw error when profile is not found", async () => {
    (mockedProfileRepo.findByUserId as jest.Mock).mockResolvedValue(null);

    await expect(matchService.matchDeveloperToJob("user-1", "job-1")).rejects.toThrow(
      "Developer profile not found"
    );
  });

  it("should throw error when job is not found", async () => {
    (mockedProfileRepo.findByUserId as jest.Mock).mockResolvedValue({
      id: "profile-1",
      skills: ["TypeScript"],
      experience_years: 3,
      bio: "Test dev",
    });
    (mockedJobRepo.findById as jest.Mock).mockResolvedValue(null);

    await expect(matchService.matchDeveloperToJob("user-1", "job-1")).rejects.toThrow(
      "Job not found"
    );
  });

  it("should throw error when job is not open", async () => {
    (mockedProfileRepo.findByUserId as jest.Mock).mockResolvedValue({
      id: "profile-1",
      skills: ["TypeScript"],
      experience_years: 3,
      bio: "Test dev",
    });
    (mockedJobRepo.findById as jest.Mock).mockResolvedValue({
      id: "job-1",
      title: "Test Job",
      status: "closed",
      required_skills: ["TypeScript"],
      description: "Closed job",
    });

    await expect(matchService.matchDeveloperToJob("user-1", "job-1")).rejects.toThrow(
      "no longer accepting"
    );
  });

  it("should throw error when developer has no skills", async () => {
    (mockedProfileRepo.findByUserId as jest.Mock).mockResolvedValue({
      id: "profile-1",
      skills: [],
      experience_years: 3,
      bio: "Test dev",
    });
    (mockedJobRepo.findById as jest.Mock).mockResolvedValue({
      id: "job-1",
      title: "Test Job",
      status: "open",
      required_skills: ["Python"],
      description: "A job",
    });

    await expect(matchService.matchDeveloperToJob("user-1", "job-1")).rejects.toThrow(
      "add skills"
    );
  });

  it("should return match results with correct structure", async () => {
    (mockedProfileRepo.findByUserId as jest.Mock).mockResolvedValue({
      id: "profile-1",
      skills: ["React", "TypeScript"],
      experience_years: 5,
      bio: "Experienced developer",
    });
    (mockedJobRepo.findById as jest.Mock).mockResolvedValue({
      id: "job-1",
      title: "Frontend Dev",
      status: "open",
      required_skills: ["React", "TypeScript", "CSS"],
      description: "Build UIs",
      company: { full_name: "TechCorp" },
    });
    (mockedMatchRepo.upsert as jest.Mock).mockResolvedValue(undefined);

    mockCreate.mockResolvedValue({
      choices: [
        {
          message: {
            content: '{"score": 82, "reason": "Strong React and TypeScript skills match well"}',
          },
        },
      ],
    });

    const result = await matchService.matchDeveloperToJob("user-1", "job-1");

    expect(result).toHaveProperty("jobId", "job-1");
    expect(result).toHaveProperty("jobTitle", "Frontend Dev");
    expect(result).toHaveProperty("companyName", "TechCorp");
    expect(result).toHaveProperty("matchScore", 82);
    expect(result).toHaveProperty("matchReason", "Strong React and TypeScript skills match well");
    expect(result.matchScore).toBeGreaterThanOrEqual(0);
    expect(result.matchScore).toBeLessThanOrEqual(100);
  });

  it("should save match result to database via upsert", async () => {
    (mockedProfileRepo.findByUserId as jest.Mock).mockResolvedValue({
      id: "profile-1",
      skills: ["Python", "Django"],
      experience_years: 3,
      bio: "Backend developer",
    });
    (mockedJobRepo.findById as jest.Mock).mockResolvedValue({
      id: "job-2",
      title: "Backend Dev",
      status: "open",
      required_skills: ["Python", "PostgreSQL"],
      description: "Build APIs",
      company: { full_name: "DataCo" },
    });
    (mockedMatchRepo.upsert as jest.Mock).mockResolvedValue(undefined);

    mockCreate.mockResolvedValue({
      choices: [
        {
          message: {
            content: '{"score": 70, "reason": "Good Python fit"}',
          },
        },
      ],
    });

    await matchService.matchDeveloperToJob("user-1", "job-2");

    expect(mockedMatchRepo.upsert).toHaveBeenCalledWith(
      "profile-1",
      "job-2",
      70,
      "Good Python fit"
    );
  });

  it("should handle empty AI response", async () => {
    (mockedProfileRepo.findByUserId as jest.Mock).mockResolvedValue({
      id: "profile-1",
      skills: ["Python"],
      experience_years: 2,
      bio: "Junior dev",
    });
    (mockedJobRepo.findById as jest.Mock).mockResolvedValue({
      id: "job-2",
      title: "Backend Dev",
      status: "open",
      required_skills: ["Python", "Django"],
      description: "Build APIs",
      company: { full_name: "DataCo" },
    });

    mockCreate.mockResolvedValue({
      choices: [{ message: { content: null } }],
    });

    await expect(matchService.matchDeveloperToJob("user-1", "job-2")).rejects.toThrow(
      "empty response"
    );
  });

  it("should handle AI service errors (503)", async () => {
    (mockedProfileRepo.findByUserId as jest.Mock).mockResolvedValue({
      id: "profile-1",
      skills: ["Go"],
      experience_years: 4,
      bio: "Go developer",
    });
    (mockedJobRepo.findById as jest.Mock).mockResolvedValue({
      id: "job-3",
      title: "Systems Engineer",
      status: "open",
      required_skills: ["Go", "Kubernetes"],
      description: "Infrastructure work",
      company: { full_name: "CloudInc" },
    });

    mockCreate.mockRejectedValue(new Error("Service unavailable"));

    await expect(matchService.matchDeveloperToJob("user-1", "job-3")).rejects.toThrow(
      "temporarily unavailable"
    );
  });

  it("should handle malformed AI response", async () => {
    (mockedProfileRepo.findByUserId as jest.Mock).mockResolvedValue({
      id: "profile-1",
      skills: ["Java"],
      experience_years: 6,
      bio: "Java dev",
    });
    (mockedJobRepo.findById as jest.Mock).mockResolvedValue({
      id: "job-4",
      title: "Java Developer",
      status: "open",
      required_skills: ["Java", "Spring"],
      description: "Enterprise Java",
      company: { full_name: "EnterpriseCo" },
    });

    mockCreate.mockResolvedValue({
      choices: [{ message: { content: "Sorry, I cannot evaluate this." } }],
    });

    await expect(matchService.matchDeveloperToJob("user-1", "job-4")).rejects.toThrow();
  });
});

// ---------------------------------------------------------------------------
// 4. Score boundary and semantic tests
// ---------------------------------------------------------------------------
describe("AI score semantics", () => {
  beforeEach(() => {
    jest.spyOn(console, "log").mockImplementation(() => {});
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should parse score at lower boundary (0)", () => {
    const result = parseMatchResponse('{"score": 0, "reason": "No overlap whatsoever"}');
    expect(result.score).toBe(0);
  });

  it("should parse score at upper boundary (100)", () => {
    const result = parseMatchResponse('{"score": 100, "reason": "Perfect candidate"}');
    expect(result.score).toBe(100);
  });

  it("should correctly parse low score", () => {
    const result = parseMatchResponse('{"score": 15, "reason": "Very few skills match"}');
    expect(result.score).toBeLessThan(30);
  });

  it("should correctly parse high score", () => {
    const result = parseMatchResponse('{"score": 92, "reason": "Nearly all skills align"}');
    expect(result.score).toBeGreaterThan(80);
  });

  it("should produce NaN for non-numeric score strings", () => {
    const result = parseMatchResponse('{"score": "not_a_number", "reason": "Bad input"}');
    // Number("not_a_number") = NaN -> Math.round(NaN) = NaN -> Math.max(0, NaN) = NaN
    expect(result.score).toBeNaN();
  });
});
