import { type Context, Hono } from "@hono/hono";
import { getConnInfo } from "@hono/hono/deno";
import { VisitLink } from "@/links/application/commands/visit-link.ts";
import type { Dependencies } from "@/dependencies.ts";

function clientIp(c: Context): string | null {
  const forwarded = c.req.header("x-forwarded-for")?.split(",")[0]?.trim();
  if (forwarded) return forwarded;
  try {
    return getConnInfo(c).remote.address ?? null;
  } catch {
    return null; // no socket behind the request (e.g. app.request in tests)
  }
}

/** Short link resolution. Mounted last so it never shadows /api or /analytics. */
export function redirectRoutes(deps: Dependencies): Hono {
  const routes = new Hono();

  routes.get("/:code", async (c) => {
    const { originalUrl } = await deps.visitLink.handle(
      new VisitLink(
        c.req.param("code"),
        c.req.header("referer") ?? null,
        c.req.header("user-agent") ?? null,
        clientIp(c),
      ),
    );
    // 301 as specified, but never cached: every visit must reach us to be counted.
    c.header("Cache-Control", "no-store");
    return c.redirect(originalUrl, 301);
  });

  return routes;
}
