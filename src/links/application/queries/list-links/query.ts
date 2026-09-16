import type { DatabaseSync } from "node:sqlite";

export interface LinkRecord {
  shortCode: string;
  originalUrl: string;
  createdAt: string;
  expiresAt: string | null;
  clicks: number;
}

/** Lists every link, newest first, with its click count (read side, no aggregates). */
export class Query {
  constructor(private readonly database: DatabaseSync) {}

  execute(): Promise<LinkRecord[]> {
    const rows = this.database
      .prepare(
        `SELECT l.code, l.original_url, l.created_at, l.expires_at, count(c.id) AS clicks
         FROM links l LEFT JOIN clicks c ON c.code = l.code
         GROUP BY l.code
         ORDER BY l.created_at DESC, l.rowid DESC`,
      )
      .all();
    return Promise.resolve(rows.map((row) => ({
      shortCode: String(row.code),
      originalUrl: String(row.original_url),
      createdAt: String(row.created_at),
      expiresAt: row.expires_at === null ? null : String(row.expires_at),
      clicks: Number(row.clicks),
    })));
  }
}
