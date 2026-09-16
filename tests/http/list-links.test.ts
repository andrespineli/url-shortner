import { assertEquals } from "@std/assert";
import { buildTestApp } from "@tests/support/app.ts";
import { shorten, visit } from "@tests/support/scenarios.ts";

Deno.test("Feature: GET /api/urls", async (t) => {
  await t.step("Scenario: created links are listed newest first with clicks", async () => {
    // Given two links created one minute apart, the first clicked twice
    let now = new Date("2026-09-16T12:00:00Z");
    const testApp = buildTestApp(() => now);
    const first = await shorten(testApp, "https://first.example");
    now = new Date("2026-09-16T12:01:00Z");
    const second = await shorten(testApp, "https://second.example");
    await visit(testApp, first);
    await visit(testApp, first);
    // When the links are listed
    const res = await testApp.app.request("/api/urls");
    // Then the newest comes first, each with its short URL and click count
    assertEquals(res.status, 200);
    const body = await res.json();
    assertEquals(
      body.map((l: { shortCode: string; clicks: number }) => [l.shortCode, l.clicks]),
      [[second, 0], [first, 2]],
    );
    assertEquals(body[0].shortUrl, `http://sho.rt/${second}`);
    assertEquals(body[0].originalUrl, "https://second.example");
    assertEquals(body[0].expiresAt, null);
  });

  await t.step("Scenario: no links yields an empty list", async () => {
    // Given the assembled application with no links
    const { app } = buildTestApp();
    // When the links are listed
    const res = await app.request("/api/urls");
    // Then the list is empty
    assertEquals(res.status, 200);
    assertEquals(await res.json(), []);
  });
});
