CREATE TABLE IF NOT EXISTS "activities" (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  activity_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('activity', 'challenge')),
  completed_at TEXT NOT NULL,
  notes TEXT
);