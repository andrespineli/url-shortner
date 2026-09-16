import { dirname } from "node:path";
import { DatabaseSync } from "node:sqlite";

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS links (
    code         TEXT PRIMARY KEY,
    original_url TEXT NOT NULL,
    created_at   TEXT NOT NULL,
    expires_at   TEXT
  );
  CREATE INDEX IF NOT EXISTS links_created_at ON links (created_at);

  CREATE TABLE IF NOT EXISTS clicks (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    code       TEXT NOT NULL REFERENCES links (code),
    referrer   TEXT,
    user_agent TEXT,
    ip         TEXT,
    clicked_at TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS clicks_code_clicked_at ON clicks (code, clicked_at);
`;

/** Opens the SQLite database (":memory:" for tests) and applies the idempotent schema. */
export function openDatabase(path: string): DatabaseSync {
  if (path !== ":memory:") Deno.mkdirSync(dirname(path), { recursive: true });
  const database = new DatabaseSync(path);
  database.exec("PRAGMA foreign_keys = ON;");
  database.exec(SCHEMA);
  return database;
}
