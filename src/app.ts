import { Hono } from "@hono/hono";
import { logger } from "@hono/hono/logger";
import type { Dependencies } from "@/dependencies.ts";
import { analyticsRoutes } from "@/links/inbound/http/analytics-routes.ts";
import { linksApiRoutes } from "@/links/inbound/http/api-routes.ts";
import { redirectRoutes } from "@/links/inbound/http/redirect-routes.ts";
import { mapLinkError } from "@/links/inbound/http/error-mapping.ts";
import { errorHandler, notFoundHandler } from "@/shared/http/errors.ts";

/** Builds the HTTP app from explicit dependencies so tests never touch the network. */
export function createApp(deps: Dependencies, opts: { log?: boolean } = {}): Hono {
  const app = new Hono();

  if (opts.log) app.use(logger());
  app.onError((err, c) => errorHandler(mapLinkError(err), c));
  app.notFound(notFoundHandler);

  app.get("/health", (c) => c.json({ status: "ok" }));

  // Feature routes mount here, one router per bounded context.
  app.route("/", linksApiRoutes(deps));
  app.route("/", analyticsRoutes(deps));
  app.route("/", redirectRoutes(deps)); // catch-all /:code, keep last

  return app;
}
