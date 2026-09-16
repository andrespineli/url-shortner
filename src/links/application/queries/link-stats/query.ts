import type { DatabaseSync } from "node:sqlite";

export interface DailyClicksRecord {
  date: string; // YYYY-MM-DD (UTC)
  clicks: number;
}

export interface ReferrerClicksRecord {
  referrer: string;
  clicks: number;
}

export interface LinkStatsRecord {
  shortCode: string;
  originalUrl: string;
  createdAt: string;
  expiresAt: string | null;
  totalClicks: number;
  clicksByDay: DailyClicksRecord[];
  topReferrers: ReferrerClicksRecord[];
}

export const STATS_WINDOW_DAYS = 30;
export const TOP_REFERRERS_LIMIT = 10;
const DAY_MS = 24 * 60 * 60 * 1000;

interface LinkRow {
  code: string;
  original_url: string;
  created_at: string;
  expires_at: string | null;
  total: number;
}

/** Reads click analytics for one link straight from storage (read side, no aggregates). */
export class Query {
  constructor(private readonly database: DatabaseSync) {}

  execute(code: string, now: Date): Promise<LinkStatsRecord | undefined> {
    const link = this.database
      .prepare(
        `SELECT l.code, l.original_url, l.created_at, l.expires_at,
                (SELECT count(*) FROM clicks c WHERE c.code = l.code) AS total
         FROM links l WHERE l.code = ?`,
      )
      .get(code) as LinkRow | undefined;
    if (!link) return Promise.resolve(undefined);

    const days = lastDays(now, STATS_WINDOW_DAYS);
    const perDay = new Map(
      this.database
        .prepare(
          `SELECT substr(clicked_at, 1, 10) AS date, count(*) AS clicks
           FROM clicks WHERE code = ? AND clicked_at >= ?
           GROUP BY date`,
        )
        .all(code, `${days[0]}T00:00:00.000Z`)
        .map((row) => [String(row.date), Number(row.clicks)]),
    );

    const topReferrers = this.database
      .prepare(
        `SELECT coalesce(nullif(referrer, ''), 'direct') AS referrer, count(*) AS clicks
         FROM clicks WHERE code = ?
         GROUP BY 1 ORDER BY clicks DESC, referrer ASC LIMIT ?`,
      )
      .all(code, TOP_REFERRERS_LIMIT)
      .map((row) => ({ referrer: String(row.referrer), clicks: Number(row.clicks) }));

    return Promise.resolve({
      shortCode: link.code,
      originalUrl: link.original_url,
      createdAt: link.created_at,
      expiresAt: link.expires_at,
      totalClicks: Number(link.total),
      clicksByDay: days.map((date) => ({ date, clicks: perDay.get(date) ?? 0 })),
      topReferrers,
    });
  }
}

/** The last `count` UTC calendar days, oldest first, ending today. */
function lastDays(now: Date, count: number): string[] {
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Array.from(
    { length: count },
    (_, i) => new Date(today - (count - 1 - i) * DAY_MS).toISOString().slice(0, 10),
  );
}
