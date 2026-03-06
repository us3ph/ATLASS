-- ═══════════════════════════════════════════
-- Migration 003: OAuth & CV Upload Support
-- ═══════════════════════════════════════════

-- Add OAuth provider fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS oauth_provider VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS oauth_id VARCHAR(255);

-- Make password nullable for OAuth-only users (they don't have a password)
ALTER TABLE users ALTER COLUMN password DROP NOT NULL;

-- Unique index on OAuth provider + id (only when provider is set)
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_oauth
  ON users(oauth_provider, oauth_id)
  WHERE oauth_provider IS NOT NULL;

-- Add CV URL to developer_profiles
ALTER TABLE developer_profiles ADD COLUMN IF NOT EXISTS cv_url VARCHAR(500);

-- Add CV URL to job_applications (per-application CV)
ALTER TABLE job_applications ADD COLUMN IF NOT EXISTS cv_url VARCHAR(500);
