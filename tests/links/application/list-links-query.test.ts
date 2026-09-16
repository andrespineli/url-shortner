import { assertEquals } from "@std/assert";
import { Query } from "@/links/application/queries/list-links/query.ts";
import { openDatabase } from "@/shared/sqlite/database.ts";

Deno.test("Feature: List links query", async (t) => {
  await t.step("Scenario: links come newest first with their click counts", async () => {
    // Given an older link clicked twice and a newer link never clicked
    const database = openDatabase(":memory:");
    database.exec(
      `INSERT INTO links VALUES ('Older00', 'https://old.example', '2026-09-01T00:00:00.000Z', NULL);
       INSERT INTO links VALUES ('Newer00', 'https://new.example', '2026-09-10T00:00:00.000Z', '2026-12-01T00:00:00.000Z');
       INSERT INTO clicks (code, clicked_at) VALUES ('Older00', '2026-09-02T00:00:00.000Z');
       INSERT INTO clicks (code, clicked_at) VALUES ('Older00', '2026-09-03T00:00:00.000Z');`,
    );
    // When the links are listed
    const links = await new Query(database).execute();
    // Then the newest comes first and counts are exact
    assertEquals(links, [
      {
        shortCode: "Newer00",
        originalUrl: "https://new.example",
        createdAt: "2026-09-10T00:00:00.000Z",
        expiresAt: "2026-12-01T00:00:00.000Z",
        clicks: 0,
      },
      {
        shortCode: "Older00",
        originalUrl: "https://old.example",
        createdAt: "2026-09-01T00:00:00.000Z",
        expiresAt: null,
        clicks: 2,
      },
    ]);
  });

  await t.step("Scenario: an empty store lists nothing", async () => {
    // Given an empty database
    // When the links are listed
    const links = await new Query(openDatabase(":memory:")).execute();
    // Then the list is empty
    assertEquals(links, []);
  });
});
