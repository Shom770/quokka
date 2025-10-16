-- Migration: create user_urls and completed_assignments tables
-- Created: 2025-10-15

DROP TABLE IF EXISTS user_urls;
DROP TABLE IF EXISTS completed_assignments;

-- Table to map a user to a single URL (or multiple URLs if desired)
CREATE TABLE IF NOT EXISTS user_urls (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ensure quick lookups by user
CREATE INDEX IF NOT EXISTS idx_user_urls_user_id ON user_urls(user_id);

-- Table to track completion status of assignments per user
CREATE TABLE IF NOT EXISTS completed_assignments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  assignment_id TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT 0,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uc_user_assignment UNIQUE (user_id, assignment_id)
);

-- Indexes for lookups
CREATE INDEX IF NOT EXISTS idx_completed_assignments_user_id ON completed_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_completed_assignments_assignment_id ON completed_assignments(assignment_id);
