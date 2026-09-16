import { assertEquals } from "@std/assert";
import { Query } from "@/links/application/queries/link-stats/query.ts";
import { openDatabase } from "@/shared/sqlite/database.ts";

const now = new Date("2026-09-16T15:00:00Z");

function seededDatabase() {
  const database = openDatabase(":memory:");
  database.exec(
    `INSERT INTO links VALUES ('Abc1234', 'https://example.com', '2026-08-01T00:00:00.000Z', NULL);
     INSERT INTO links VALUES ('Quiet00', 'https://quiet.example', '2026-09-01T00:00:00.000Z', NULL);`,
  );
  const click = database.prepare(
    "INSERT INTO clicks (code, referrer, user_agent, ip, clicked_at) VALUES ('Abc1234', ?, 'UA', '1.1.1.1', ?)",
  );
  click.run("https://google.com", "2026-09-16T01:00:00.000Z"); // today
  click.run("https://google.com", "2026-09-16T23:59:59.000Z"); // today, late
  click.run(null, "2026-09-15T12:00:00.000Z"); // yesterday, direct
  click.run("https://t.co", "2026-08-18T00:00:00.000Z"); // first day of the window
  click.run("https://t.co", "2026-08-17T23:59:59.000Z"); // 31 days ago, outside
  return database;
}

Deno.test("Feature: Link statistics query", async (t) => {
  await t.step("Scenario: clicks are counted by UTC day over the last 30 days", async () => {
    // Given a link with clicks today, yesterday, on the window edge and before it
    const query = new Query(seededDatabase());
    // When its statistics are read
    const stats = await query.execute("Abc1234", now);
    // Then the total counts every click
    assertEquals(stats?.totalClicks, 5);
    // And the series has 30 days ending today, zero-filled
    const days = stats!.clicksByDay;
    assertEquals(days.length, 30);
    assertEquals(days[0], { date: "2026-08-18", clicks: 1 });
    assertEquals(days[28], { date: "2026-09-15", clicks: 1 });
    assertEquals(days[29], { date: "2026-09-16", clicks: 2 });
    assertEquals(days.reduce((sum, d) => sum + d.clicks, 0), 4);
  });

  await t.step("Scenario: top referrers are ranked and missing ones are direct", async () => {
    // Given the same seeded link
    const query = new Query(seededDatabase());
    // When its statistics are read
    const stats = await query.execute("Abc1234", now);
    // Then referrers are ordered by clicks
    assertEquals(stats?.topReferrers, [
      { referrer: "https://google.com", clicks: 2 },
      { referrer: "https://t.co", clicks: 2 },
      { referrer: "direct", clicks: 1 },
    ]);
  });

  await t.step("Scenario: a link without clicks has empty statistics", async () => {
    // Given a link that was never clicked
    const query = new Query(seededDatabase());
    // When its statistics are read
    const stats = await query.execute("Quiet00", now);
    // Then everything is zero
    assertEquals(stats?.totalClicks, 0);
    assertEquals(stats?.clicksByDay.every((d) => d.clicks === 0), true);
    assertEquals(stats?.topReferrers, []);
  });

  await t.step("Scenario: an unknown code has no statistics", async () => {
    // Given the seeded database
    const query = new Query(seededDatabase());
    // When an unknown code is read
    // Then nothing is returned
    assertEquals(await query.execute("Nope000", now), undefined);
  });
});
