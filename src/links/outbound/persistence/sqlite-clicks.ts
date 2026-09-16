import type { DatabaseSync } from "node:sqlite";
import type { Click } from "@/links/domain/models/click.ts";
import type { Clicks } from "@/links/domain/ports/outbound/clicks.ts";

export class SqliteClicks implements Clicks {
  constructor(private readonly database: DatabaseSync) {}

  record(click: Click): Promise<void> {
    this.database
      .prepare(
        `INSERT INTO clicks (code, referrer, user_agent, ip, clicked_at)
         VALUES (?, ?, ?, ?, ?)`,
      )
      .run(
        click.code.value,
        click.visitor.referrer,
        click.visitor.userAgent,
        click.visitor.ip,
        click.clickedAt.toISOString(),
      );
    return Promise.resolve();
  }
}
