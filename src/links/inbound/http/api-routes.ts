import { Hono } from "@hono/hono";
import { z } from "@zod/zod";
import { CreateLink } from "@/links/application/commands/create-link.ts";
import type { Dependencies } from "@/dependencies.ts";
import { AppError } from "@/shared/http/errors.ts";
import { parseBody } from "@/shared/http/validate.ts";

const ShortenBody = z.object({
  url: z.string(),
  expiresAt: z.iso.datetime({ offset: true }).nullish(),
});

/** JSON API of the links context: parse → dispatch → status. */
export function linksApiRoutes(deps: Dependencies): Hono {
  const routes = new Hono();
  const shortUrl = (code: string) => `${deps.config.baseUrl}/${code}`;

  routes.post("/api/shorten", async (c) => {
    const body = await parseBody(c, ShortenBody);
    const created = await deps.createLink.handle(new CreateLink(body.url, body.expiresAt ?? null));
    return c.json({
      shortCode: created.shortCode,
      shortUrl: shortUrl(created.shortCode),
      originalUrl: created.originalUrl,
      createdAt: created.createdAt.toISOString(),
      expiresAt: created.expiresAt?.toISOString() ?? null,
    }, 201);
  });

  routes.get("/api/urls", async (c) => {
    const links = await deps.listLinks.execute();
    return c.json(links.map((link) => ({ ...link, shortUrl: shortUrl(link.shortCode) })));
  });

  routes.get("/api/stats/:code", async (c) => {
    const code = c.req.param("code");
    const stats = await deps.linkStats.execute(code, deps.now());
    if (!stats) throw new AppError(404, "LINK_NOT_FOUND", `link ${code} not found`);
    return c.json({
      shortCode: stats.shortCode,
      shortUrl: shortUrl(stats.shortCode),
      originalUrl: stats.originalUrl,
      totalClicks: stats.totalClicks,
      clicksByDay: stats.clicksByDay,
      topReferrers: stats.topReferrers,
    });
  });

  return routes;
}
