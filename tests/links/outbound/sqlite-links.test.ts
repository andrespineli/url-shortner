import { assert, assertEquals, assertFalse } from "@std/assert";
import { Expiration } from "@/links/domain/models/expiration.ts";
import { Link } from "@/links/domain/models/link.ts";
import { ShortCode } from "@/links/domain/models/short-code.ts";
import { TargetUrl } from "@/links/domain/models/target-url.ts";
import { SqliteLinks } from "@/links/outbound/persistence/sqlite-links.ts";
import { openDatabase } from "@/shared/sqlite/database.ts";

const now = new Date("2026-09-16T12:00:00Z");

Deno.test("Feature: SQLite links persistence", async (t) => {
  await t.step("Scenario: a link with expiration round-trips by code", async () => {
    // Given a link that expires tomorrow
    const links = new SqliteLinks(openDatabase(":memory:"));
    const expiresAt = new Date("2026-09-17T12:00:00Z");
    const link = Link.create(
      new ShortCode("Abc1234"),
      new TargetUrl("https://example.com/a"),
      Expiration.schedule(expiresAt, now),
      now,
    );
    // When it is saved and read back
    await links.save(link);
    const found = await links.byCode(new ShortCode("Abc1234"));
    // Then every field is preserved
    assertEquals(found?.target.value, "https://example.com/a");
    assertEquals(found?.createdAt, now);
    assertEquals(found?.expiration?.at, expiresAt);
  });

  await t.step("Scenario: a link without expiration round-trips and exists", async () => {
    // Given a link that never expires
    const links = new SqliteLinks(openDatabase(":memory:"));
    const code = new ShortCode("Xyz9876");
    await links.save(Link.create(code, new TargetUrl("http://example.com"), null, now));
    // When it is looked up
    const found = await links.byCode(code);
    // Then it has no expiration and is reported as existing
    assertEquals(found?.expiration, null);
    assert(await links.exists(code));
  });

  await t.step("Scenario: an unknown code is absent", async () => {
    // Given an empty store
    const links = new SqliteLinks(openDatabase(":memory:"));
    // When an unknown code is looked up
    // Then nothing is found
    assertEquals(await links.byCode(new ShortCode("Nope000")), undefined);
    assertFalse(await links.exists(new ShortCode("Nope000")));
  });
});
