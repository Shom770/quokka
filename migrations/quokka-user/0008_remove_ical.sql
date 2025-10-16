-- Defer FK checks until the migration finishes (D1 wraps the file atomically)
PRAGMA defer_foreign_keys = on;

ALTER TABLE users DROP COLUMN ical_iurl;
