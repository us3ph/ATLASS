-- ══════════════════════════════════════
-- ATLASS Database — Job Applications
-- ══════════════════════════════════════

-- ─── Application Status Enum ───
CREATE TYPE "ApplicationStatus" AS ENUM ('pending', 'reviewed', 'accepted', 'rejected');

-- ─── Job Applications ───
CREATE TABLE job_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    developer_id UUID NOT NULL REFERENCES developer_profiles(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    cover_letter TEXT DEFAULT '',
    status "ApplicationStatus" NOT NULL DEFAULT 'pending',
    match_score INT,
    match_reason TEXT,
    reviewer_notes TEXT DEFAULT '',
    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(developer_id, job_id)
);

CREATE INDEX idx_job_applications_developer_id ON job_applications(developer_id);
CREATE INDEX idx_job_applications_job_id ON job_applications(job_id);
CREATE INDEX idx_job_applications_status ON job_applications(status);
CREATE INDEX idx_job_applications_match_score ON job_applications(match_score);
