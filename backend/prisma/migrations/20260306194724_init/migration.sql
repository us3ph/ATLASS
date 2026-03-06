-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('developer', 'company', 'admin');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('open', 'closed', 'draft');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('pending', 'reviewed', 'accepted', 'rejected');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255),
    "full_name" VARCHAR(100) NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'developer',
    "oauth_provider" VARCHAR(50),
    "oauth_id" VARCHAR(255),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "developer_profiles" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "bio" TEXT NOT NULL DEFAULT '',
    "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "experience_years" INTEGER NOT NULL DEFAULT 0,
    "github_url" VARCHAR(255),
    "linkedin_url" VARCHAR(255),
    "portfolio_url" VARCHAR(255),
    "location" VARCHAR(100) NOT NULL DEFAULT '',
    "available_for_remote" BOOLEAN NOT NULL DEFAULT true,
    "cv_url" VARCHAR(500),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "developer_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jobs" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT NOT NULL,
    "required_skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "location" VARCHAR(100) NOT NULL,
    "is_remote" BOOLEAN NOT NULL DEFAULT false,
    "salary_min" INTEGER,
    "salary_max" INTEGER,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "status" "JobStatus" NOT NULL DEFAULT 'open',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_matches" (
    "id" UUID NOT NULL,
    "developer_id" UUID NOT NULL,
    "job_id" UUID NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "reason" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "job_matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_applications" (
    "id" UUID NOT NULL,
    "developer_id" UUID NOT NULL,
    "job_id" UUID NOT NULL,
    "cover_letter" TEXT NOT NULL DEFAULT '',
    "cv_url" VARCHAR(500),
    "status" "ApplicationStatus" NOT NULL DEFAULT 'pending',
    "match_score" INTEGER,
    "match_reason" TEXT,
    "reviewer_notes" TEXT NOT NULL DEFAULT '',
    "applied_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewed_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "job_applications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_oauth_provider_oauth_id_key" ON "users"("oauth_provider", "oauth_id");

-- CreateIndex
CREATE UNIQUE INDEX "developer_profiles_user_id_key" ON "developer_profiles"("user_id");

-- CreateIndex
CREATE INDEX "developer_profiles_user_id_idx" ON "developer_profiles"("user_id");

-- CreateIndex
CREATE INDEX "developer_profiles_skills_idx" ON "developer_profiles"("skills");

-- CreateIndex
CREATE INDEX "jobs_company_id_idx" ON "jobs"("company_id");

-- CreateIndex
CREATE INDEX "jobs_status_idx" ON "jobs"("status");

-- CreateIndex
CREATE INDEX "jobs_required_skills_idx" ON "jobs"("required_skills");

-- CreateIndex
CREATE INDEX "job_matches_developer_id_idx" ON "job_matches"("developer_id");

-- CreateIndex
CREATE INDEX "job_matches_job_id_idx" ON "job_matches"("job_id");

-- CreateIndex
CREATE INDEX "job_matches_score_idx" ON "job_matches"("score");

-- CreateIndex
CREATE UNIQUE INDEX "job_matches_developer_id_job_id_key" ON "job_matches"("developer_id", "job_id");

-- CreateIndex
CREATE INDEX "job_applications_developer_id_idx" ON "job_applications"("developer_id");

-- CreateIndex
CREATE INDEX "job_applications_job_id_idx" ON "job_applications"("job_id");

-- CreateIndex
CREATE INDEX "job_applications_status_idx" ON "job_applications"("status");

-- CreateIndex
CREATE INDEX "job_applications_match_score_idx" ON "job_applications"("match_score");

-- CreateIndex
CREATE UNIQUE INDEX "job_applications_developer_id_job_id_key" ON "job_applications"("developer_id", "job_id");

-- AddForeignKey
ALTER TABLE "developer_profiles" ADD CONSTRAINT "developer_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_matches" ADD CONSTRAINT "job_matches_developer_id_fkey" FOREIGN KEY ("developer_id") REFERENCES "developer_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_matches" ADD CONSTRAINT "job_matches_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_developer_id_fkey" FOREIGN KEY ("developer_id") REFERENCES "developer_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
