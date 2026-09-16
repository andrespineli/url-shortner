export interface Config {
  port: number;
  baseUrl: string;
  databasePath: string;
}

/** Reads the runtime configuration from the environment, with local defaults. */
export function loadConfig(): Config {
  const port = Number(Deno.env.get("PORT") ?? 8000);
  return {
    port,
    baseUrl: (Deno.env.get("BASE_URL") ?? `http://localhost:${port}`).replace(/\/+$/, ""),
    databasePath: Deno.env.get("DATABASE_PATH") ?? "data/shortener.db",
  };
}
