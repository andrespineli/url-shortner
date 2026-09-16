import type { DatabaseSync } from "node:sqlite";
import type { Config } from "@/config.ts";
import { openDatabase } from "@/shared/sqlite/database.ts";

/**
 * Composition root — the only place where concrete infrastructure is built and
 * wired to handlers and queries. Tests call it with an in-memory database.
 */
export interface Dependencies {
  config: Config;
  database: DatabaseSync;
}

export interface Overrides {
  now?: () => Date;
}

export function buildDependencies(config: Config, _overrides: Overrides = {}): Dependencies {
  const database = openDatabase(config.databasePath);

  return {
    config,
    database,
  };
}
