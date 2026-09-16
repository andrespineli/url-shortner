import { assertEquals, assertRejects } from "@std/assert";
import { VisitLink } from "@/links/application/commands/visit-link.ts";
import { VisitLinkHandler } from "@/links/application/handlers/visit-link-handler.ts";
import { LinkExpired, LinkNotFound } from "@/links/domain/errors.ts";
import type { Click } from "@/links/domain/models/click.ts";
import { Expiration } from "@/links/domain/models/expiration.ts";
import { Link } from "@/links/domain/models/link.ts";
import { ShortCode } from "@/links/domain/models/short-code.ts";
import { TargetUrl } from "@/links/domain/models/target-url.ts";
import type { Clicks } from "@/links/domain/ports/outbound/clicks.ts";
import { fixedClock, InMemoryLinks } from "@tests/support/doubles.ts";

class RecordedClicks implements Clicks {
  readonly all: Click[] = [];
  record(click: Click): Promise<void> {
    this.all.push(click);
    return Promise.resolve();
  }
}

const created = new Date("2026-09-16T12:00:00Z");

async function givenLinks() {
  const links = new InMemoryLinks();
  await links.save(
    Link.create(new ShortCode("Active1"), new TargetUrl("https://example.com"), null, created),
  );
  await links.save(
    Link.create(
      new ShortCode("Expired"),
      new TargetUrl("https://old.example.com"),
      Expiration.schedule(new Date("2026-09-16T12:30:00Z"), created),
      created,
    ),
  );
  return links;
}

Deno.test("Feature: Visit a short link", async (t) => {
  await t.step("Scenario: an active link returns its destination and records a click", async () => {
    // Given an active link
    const clicks = new RecordedClicks();
    const handler = new VisitLinkHandler(
      await givenLinks(),
      clicks,
      fixedClock("2026-09-16T13:00:00Z"),
    );
    // When it is visited
    const result = await handler.handle(
      new VisitLink("Active1", "https://t.co", "curl/8", "1.2.3.4"),
    );
    // Then the destination is returned and one click is recorded
    assertEquals(result, { originalUrl: "https://example.com" });
    assertEquals(clicks.all.length, 1);
    assertEquals(clicks.all[0]?.visitor, {
      referrer: "https://t.co",
      userAgent: "curl/8",
      ip: "1.2.3.4",
    });
  });

  await t.step("Scenario: unknown, malformed and expired codes record nothing", async () => {
    // Given the stored links, one of them already expired
    const clicks = new RecordedClicks();
    const handler = new VisitLinkHandler(
      await givenLinks(),
      clicks,
      fixedClock("2026-09-16T13:00:00Z"),
    );
    // When unknown, malformed and expired codes are visited
    await assertRejects(
      () => handler.handle(new VisitLink("Nope000", null, null, null)),
      LinkNotFound,
    );
    await assertRejects(
      () => handler.handle(new VisitLink("bad!", null, null, null)),
      LinkNotFound,
    );
    await assertRejects(
      () => handler.handle(new VisitLink("Expired", null, null, null)),
      LinkExpired,
    );
    // Then no click is recorded
    assertEquals(clicks.all.length, 0);
  });
});
