import { Hono } from "@hono/hono";
import { logger } from "@hono/hono/logger";
import type { Dependencies } from "@/dependencies.ts";
import { errorHandler, notFoundHandler } from "@/shared/http/errors.ts";

/** Builds the HTTP app from explicit dependencies so tests never touch the network. */
export function createApp(deps: Dependencies, opts: { log?: boolean } = {}): Hono {
  const app = new Hono();

  if (opts.log) app.use(logger());
  app.onError(errorHandler);
  app.notFound(notFoundHandler);

  app.get("/health", (c) => c.json({ status: "ok" }));

  // Feature routes mount here, one router per bounded context.
  void deps;

  return app;
}
