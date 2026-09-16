import { assertEquals } from "@std/assert";
import { buildTestApp } from "@tests/support/app.ts";
import { shorten, visit } from "@tests/support/scenarios.ts";

Deno.test("Feature: GET /api/stats/:code", async (t) => {
  await t.step("Scenario: stats reflect the clicks made through the redirect", async () => {
    // Given a shortened URL
    const testApp = buildTestApp(() => new Date("2026-09-16T12:00:00Z"));
    const code = await shorten(testApp, "https://www.jusbrasil.com.br");
    // When it is clicked three times from two referrers
    await visit(testApp, code, "https://google.com");
    await visit(testApp, code, "https://google.com");
    await visit(testApp, code);
    const res = await testApp.app.request(`/api/stats/${code}`);
    // Then the stats report the total, today's clicks and the referrers
    assertEquals(res.status, 200);
    const body = await res.json();
    assertEquals(body.shortCode, code);
    assertEquals(body.totalClicks, 3);
    assertEquals(body.clicksByDay.length, 30);
    assertEquals(body.clicksByDay.at(-1), { date: "2026-09-16", clicks: 3 });
    assertEquals(body.topReferrers, [
      { referrer: "https://google.com", clicks: 2 },
      { referrer: "direct", clicks: 1 },
    ]);
  });

  await t.step("Scenario: stats of an unknown code answer 404", async () => {
    // Given the assembled application
    const { app } = buildTestApp();
    // When stats of an unknown code are requested
    const res = await app.request("/api/stats/Nope000");
    // Then it answers 404 LINK_NOT_FOUND
    assertEquals(res.status, 404);
    assertEquals((await res.json()).error.code, "LINK_NOT_FOUND");
  });
});
