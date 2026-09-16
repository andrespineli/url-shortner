import type { DatabaseSync } from "node:sqlite";
import { Expiration } from "@/links/domain/models/expiration.ts";
import { Link } from "@/links/domain/models/link.ts";
import { ShortCode } from "@/links/domain/models/short-code.ts";
import { TargetUrl } from "@/links/domain/models/target-url.ts";
import type { Links } from "@/links/domain/ports/outbound/links.ts";

interface RawLink {
  code: string;
  original_url: string;
  created_at: string;
  expires_at: string | null;
}

const toRaw = (link: Link): RawLink => ({
  code: link.code.value,
  original_url: link.target.value,
  created_at: link.createdAt.toISOString(),
  expires_at: link.expiration?.at.toISOString() ?? null,
});

const fromRaw = (raw: RawLink): Link =>
  Link.rehydrate({
    code: new ShortCode(raw.code),
    target: new TargetUrl(raw.original_url),
    createdAt: new Date(raw.created_at),
    expiration: raw.expires_at ? Expiration.restore(new Date(raw.expires_at)) : null,
  });

export class SqliteLinks implements Links {
  constructor(private readonly database: DatabaseSync) {}

  save(link: Link): Promise<void> {
    const raw = toRaw(link);
    this.database
      .prepare(
        `INSERT INTO links (code, original_url, created_at, expires_at)
         VALUES (:code, :original_url, :created_at, :expires_at)
         ON CONFLICT (code) DO UPDATE SET
           original_url = excluded.original_url,
           expires_at = excluded.expires_at`,
      )
      .run({ ...raw });
    return Promise.resolve();
  }

  byCode(code: ShortCode): Promise<Link | undefined> {
    const row = this.database
      .prepare("SELECT code, original_url, created_at, expires_at FROM links WHERE code = ?")
      .get(code.value) as RawLink | undefined;
    return Promise.resolve(row ? fromRaw(row) : undefined);
  }

  exists(code: ShortCode): Promise<boolean> {
    const row = this.database.prepare("SELECT 1 FROM links WHERE code = ?").get(code.value);
    return Promise.resolve(row !== undefined);
  }
}
