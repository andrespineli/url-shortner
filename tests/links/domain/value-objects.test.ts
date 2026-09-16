import { assert, assertEquals, assertFalse, assertThrows } from "@std/assert";
import { InvalidExpiration, InvalidShortCode, InvalidTargetUrl } from "@/links/domain/errors.ts";
import { Expiration } from "@/links/domain/models/expiration.ts";
import { ShortCode } from "@/links/domain/models/short-code.ts";
import { TargetUrl } from "@/links/domain/models/target-url.ts";

const now = new Date("2026-09-16T12:00:00Z");

Deno.test("Feature: Short code format", async (t) => {
  await t.step("Scenario: seven alphanumeric characters are accepted", () => {
    // Given a 7-character alphanumeric value
    // When a short code is built from it
    const code = new ShortCode("aB3dE9z");
    // Then it keeps the value
    assertEquals(code.value, "aB3dE9z");
  });

  await t.step("Scenario: wrong length or symbols are rejected", () => {
    // Given values that are too short, too long or contain symbols
    for (const value of ["abc", "abcdefgh", "abc-def", "abc def", ""]) {
      // When / Then building a short code fails
      assertThrows(() => new ShortCode(value), InvalidShortCode);
    }
  });
});

Deno.test("Feature: Target URL validation", async (t) => {
  await t.step("Scenario: http and https URLs are accepted", () => {
    // Given absolute http(s) URLs
    for (const value of ["http://example.com", "https://www.jusbrasil.com.br/busca?q=x"]) {
      // When a target URL is built
      // Then it keeps the original value
      assertEquals(new TargetUrl(value).value, value);
    }
  });

  await t.step("Scenario: other schemes and malformed values are rejected", () => {
    // Given non-http schemes and malformed strings
    for (
      const value of ["ftp://example.com", "javascript:alert(1)", "mailto:a@b.c", "not a url", ""]
    ) {
      // When / Then building a target URL fails
      assertThrows(() => new TargetUrl(value), InvalidTargetUrl);
    }
  });
});

Deno.test("Feature: Link expiration", async (t) => {
  await t.step("Scenario: a future instant can be scheduled", () => {
    // Given an instant one hour ahead
    const at = new Date("2026-09-16T13:00:00Z");
    // When the expiration is scheduled
    const expiration = Expiration.schedule(at, now);
    // Then it has not passed yet, and passes exactly at that instant
    assertFalse(expiration.hasPassed(now));
    assert(expiration.hasPassed(at));
  });

  await t.step("Scenario: past, present and invalid instants are rejected", () => {
    // Given instants that are not in the future
    for (const at of [new Date("2026-09-16T11:00:00Z"), now, new Date("nope")]) {
      // When / Then scheduling fails
      assertThrows(() => Expiration.schedule(at, now), InvalidExpiration);
    }
  });
});
