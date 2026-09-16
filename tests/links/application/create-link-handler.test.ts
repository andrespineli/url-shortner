import { assertEquals, assertRejects } from "@std/assert";
import { CreateLink } from "@/links/application/commands/create-link.ts";
import { CreateLinkHandler } from "@/links/application/handlers/create-link-handler.ts";
import { InvalidExpiration, InvalidTargetUrl, ShortCodeExhausted } from "@/links/domain/errors.ts";
import { Link } from "@/links/domain/models/link.ts";
import { ShortCode } from "@/links/domain/models/short-code.ts";
import { TargetUrl } from "@/links/domain/models/target-url.ts";
import { fixedClock, InMemoryLinks, SequenceShortCodes } from "@tests/support/doubles.ts";

const clock = fixedClock("2026-09-16T12:00:00Z");

Deno.test("Feature: Create a short link", async (t) => {
  await t.step("Scenario: a valid URL becomes a stored link", async () => {
    // Given an empty store and a generator returning "Abc1234"
    const links = new InMemoryLinks();
    const handler = new CreateLinkHandler(links, new SequenceShortCodes(["Abc1234"]), clock);
    // When a link is created with an expiration
    const created = await handler.handle(
      new CreateLink("https://example.com", "2026-09-20T00:00:00Z"),
    );
    // Then the result describes the stored link
    assertEquals(created, {
      shortCode: "Abc1234",
      originalUrl: "https://example.com",
      createdAt: new Date("2026-09-16T12:00:00Z"),
      expiresAt: new Date("2026-09-20T00:00:00Z"),
    });
    assertEquals(links.rows.has("Abc1234"), true);
  });

  await t.step("Scenario: a colliding code is replaced by the next one", async () => {
    // Given a store that already holds "Taken00"
    const links = new InMemoryLinks();
    await links.save(
      Link.create(new ShortCode("Taken00"), new TargetUrl("http://a.b"), null, clock()),
    );
    const handler = new CreateLinkHandler(
      links,
      new SequenceShortCodes(["Taken00", "Free000"]),
      clock,
    );
    // When a new link is created
    const created = await handler.handle(new CreateLink("https://example.com"));
    // Then the free code is used
    assertEquals(created.shortCode, "Free000");
  });

  await t.step("Scenario: persistent collisions give up", async () => {
    // Given a generator that only returns a taken code
    const links = new InMemoryLinks();
    await links.save(
      Link.create(new ShortCode("Taken00"), new TargetUrl("http://a.b"), null, clock()),
    );
    const handler = new CreateLinkHandler(links, new SequenceShortCodes(["Taken00"]), clock);
    // When / Then creation fails after the retry budget
    await assertRejects(
      () => handler.handle(new CreateLink("https://example.com")),
      ShortCodeExhausted,
    );
  });

  await t.step("Scenario: invalid input stores nothing", async () => {
    // Given an empty store
    const links = new InMemoryLinks();
    const handler = new CreateLinkHandler(links, new SequenceShortCodes(["Abc1234"]), clock);
    // When the URL scheme or the expiration is invalid
    await assertRejects(() => handler.handle(new CreateLink("ftp://x.y")), InvalidTargetUrl);
    await assertRejects(
      () => handler.handle(new CreateLink("https://x.y", "2020-01-01T00:00:00Z")),
      InvalidExpiration,
    );
    // Then nothing was saved
    assertEquals(links.rows.size, 0);
  });
});
