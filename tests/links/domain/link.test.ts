import { assertEquals, assertThrows } from "@std/assert";
import { LinkExpired } from "@/links/domain/errors.ts";
import { Expiration } from "@/links/domain/models/expiration.ts";
import { Link } from "@/links/domain/models/link.ts";
import { ShortCode } from "@/links/domain/models/short-code.ts";
import { TargetUrl } from "@/links/domain/models/target-url.ts";

const created = new Date("2026-09-16T12:00:00Z");
const expiresAt = new Date("2026-09-16T13:00:00Z");
const visitor = { referrer: "https://google.com", userAgent: "Mozilla", ip: "10.0.0.1" };

const expiringLink = () =>
  Link.create(
    new ShortCode("Abc1234"),
    new TargetUrl("https://example.com"),
    Expiration.schedule(expiresAt, created),
    created,
  );

Deno.test("Feature: Visiting a link", async (t) => {
  await t.step("Scenario: an active link yields a click with the visitor data", () => {
    // Given a link that expires in one hour
    const link = expiringLink();
    // When it is visited one second before expiring
    const at = new Date(expiresAt.getTime() - 1000);
    const click = link.visit(visitor, at);
    // Then a click is recorded for that code, visitor and instant
    assertEquals(click.code.value, "Abc1234");
    assertEquals(click.visitor, visitor);
    assertEquals(click.clickedAt, at);
  });

  await t.step("Scenario: a link refuses visits at and after its expiration", () => {
    // Given a link that expires in one hour
    const link = expiringLink();
    // When it is visited exactly at, or after, the expiration instant
    for (const at of [expiresAt, new Date("2026-09-17T00:00:00Z")]) {
      // Then the visit is refused as expired
      assertThrows(() => link.visit(visitor, at), LinkExpired);
    }
  });

  await t.step("Scenario: a link without expiration is always visitable", () => {
    // Given a link without expiration
    const link = Link.create(
      new ShortCode("Abc1234"),
      new TargetUrl("https://example.com"),
      null,
      created,
    );
    // When it is visited years later
    const click = link.visit(visitor, new Date("2036-01-01T00:00:00Z"));
    // Then the click is recorded
    assertEquals(click.code.value, "Abc1234");
  });
});
