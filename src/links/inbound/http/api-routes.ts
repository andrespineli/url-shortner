import { Hono } from "@hono/hono";
import { z } from "@zod/zod";
import { CreateLink } from "@/links/application/commands/create-link.ts";
import type { Dependencies } from "@/dependencies.ts";
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

  return routes;
}
