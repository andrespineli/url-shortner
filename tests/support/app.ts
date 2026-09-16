import { createApp } from "@/app.ts";
import type { Config } from "@/config.ts";
import { buildDependencies } from "@/dependencies.ts";

export const testConfig: Config = {
  port: 0,
  baseUrl: "http://sho.rt",
  databasePath: ":memory:",
};

/** Assembles the real app over a fresh in-memory SQLite database. */
export function buildTestApp(now: () => Date = () => new Date()) {
  const deps = buildDependencies(testConfig, { now });
  return { app: createApp(deps), deps };
}

export const postJson = (body: unknown): RequestInit => ({
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify(body),
});
