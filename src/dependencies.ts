import type { DatabaseSync } from "node:sqlite";
import type { Config } from "@/config.ts";
import { CreateLinkHandler } from "@/links/application/handlers/create-link-handler.ts";
import { VisitLinkHandler } from "@/links/application/handlers/visit-link-handler.ts";
import type { ShortCodeGenerator } from "@/links/domain/ports/outbound/short-code-generator.ts";
import { SqliteClicks } from "@/links/outbound/persistence/sqlite-clicks.ts";
import { SqliteLinks } from "@/links/outbound/persistence/sqlite-links.ts";
import { RandomShortCodeGenerator } from "@/links/outbound/random-short-code-generator.ts";
import { openDatabase } from "@/shared/sqlite/database.ts";

/**
 * Composition root — the only place where concrete infrastructure is built and
 * wired to handlers and queries. Tests call it with an in-memory database.
 */
export interface Dependencies {
  config: Config;
  database: DatabaseSync;
  createLink: CreateLinkHandler;
  visitLink: VisitLinkHandler;
}

export interface Overrides {
  now?: () => Date;
  codes?: ShortCodeGenerator;
}

export function buildDependencies(config: Config, overrides: Overrides = {}): Dependencies {
  const now = overrides.now ?? (() => new Date());
  const database = openDatabase(config.databasePath);
  const links = new SqliteLinks(database);
  const clicks = new SqliteClicks(database);
  const codes = overrides.codes ?? new RandomShortCodeGenerator();

  return {
    config,
    database,
    createLink: new CreateLinkHandler(links, codes, now),
    visitLink: new VisitLinkHandler(links, clicks, now),
  };
}
