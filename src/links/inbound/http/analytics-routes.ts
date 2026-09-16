import { Hono } from "@hono/hono";
import type { Dependencies } from "@/dependencies.ts";
import { analyticsNotFoundPage, analyticsPage } from "@/links/inbound/http/analytics-page.ts";

/** Shareable, server-rendered analytics page of a short link. */
export function analyticsRoutes(deps: Dependencies): Hono {
  const routes = new Hono();

  routes.get("/analytics/:code", async (c) => {
    const code = c.req.param("code");
    const stats = await deps.linkStats.execute(code, deps.now());
    if (!stats) return c.html(analyticsNotFoundPage(code), 404);
    return c.html(analyticsPage(stats, `${deps.config.baseUrl}/${stats.shortCode}`));
  });

  return routes;
}
