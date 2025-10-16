CREATE TABLE IF NOT EXISTS sleep_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  hours REAL NOT NULL CHECK (hours >= 0 AND hours <= 24),
  quality INTEGER CHECK (quality >= 1 AND quality <= 5),
  notes TEXT,
  sleep_date TEXT NOT NULL,
  created_at TEXT NOT NULL
);