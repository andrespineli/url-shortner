import { assertEquals } from "@std/assert";
import { buildTestApp, postJson } from "@tests/support/app.ts";

type TestApp = ReturnType<typeof buildTestApp>;

const clickRows = ({ deps }: TestApp) =>
  deps.database
    .prepare("SELECT referrer, user_agent, ip, clicked_at FROM clicks ORDER BY id")
    .all()
    .map((row) => ({ ...row }));

async function shorten(testApp: TestApp, body: Record<string, unknown>): Promise<string> {
  const res = await testApp.app.request("/api/shorten", postJson(body));
  return (await res.json()).shortCode;
}

Deno.test("Feature: GET /:code", async (t) => {
  await t.step("Scenario: an active link redirects permanently without caching", async () => {
    // Given a shortened URL
    const testApp = buildTestApp();
    const code = await shorten(testApp, { url: "https://www.jusbrasil.com.br" });
    // When the short code is visited
    const res = await testApp.app.request(`/${code}`);
    // Then it answers 301 to the original URL and forbids caching
    assertEquals(res.status, 301);
    assertEquals(res.headers.get("location"), "https://www.jusbrasil.com.br");
    assertEquals(res.headers.get("cache-control"), "no-store");
  });

  await t.step("Scenario: every visit records referrer, user agent, ip and timestamp", async () => {
    // Given a shortened URL and a fixed clock
    const testApp = buildTestApp(() => new Date("2026-09-16T12:00:00Z"));
    const code = await shorten(testApp, { url: "https://example.com" });
    // When it is visited three times, once with full visitor headers
    await testApp.app.request(`/${code}`, {
      headers: {
        referer: "https://twitter.com/post",
        "user-agent": "Mozilla/5.0",
        "x-forwarded-for": "203.0.113.7, 10.0.0.1",
      },
    });
    await testApp.app.request(`/${code}`);
    await testApp.app.request(`/${code}`);
    // Then three clicks are stored, the first one with the visitor data
    const rows = clickRows(testApp);
    assertEquals(rows.length, 3);
    assertEquals(rows[0], {
      referrer: "https://twitter.com/post",
      user_agent: "Mozilla/5.0",
      ip: "203.0.113.7",
      clicked_at: "2026-09-16T12:00:00.000Z",
    });
    assertEquals(rows[1]?.referrer, null);
  });

  await t.step("Scenario: an unknown code answers 404 and records nothing", async () => {
    // Given the assembled application with no links
    const testApp = buildTestApp();
    // When unknown and malformed codes are visited
    for (const path of ["/Nope000", "/abc"]) {
      const res = await testApp.app.request(path);
      // Then each answers 404 LINK_NOT_FOUND
      assertEquals(res.status, 404);
      assertEquals((await res.json()).error.code, "LINK_NOT_FOUND");
    }
    // And no click is stored
    assertEquals(clickRows(testApp).length, 0);
  });

  await t.step("Scenario: an expired link answers 410 and records nothing", async () => {
    // Given a link created at noon that expires at 13:00
    let now = new Date("2026-09-16T12:00:00Z");
    const testApp = buildTestApp(() => now);
    const code = await shorten(testApp, {
      url: "https://example.com",
      expiresAt: "2026-09-16T13:00:00Z",
    });
    // When the clock passes the expiration and the link is visited
    now = new Date("2026-09-16T13:00:01Z");
    const res = await testApp.app.request(`/${code}`);
    // Then it answers 410 LINK_EXPIRED
    assertEquals(res.status, 410);
    assertEquals((await res.json()).error.code, "LINK_EXPIRED");
    // And no click is stored
    assertEquals(clickRows(testApp).length, 0);
  });

  await t.step("Scenario: API and health routes are not shadowed by short codes", async () => {
    // Given the assembled application
    const { app } = buildTestApp();
    // When the health route is requested
    const res = await app.request("/health");
    // Then it is still served
    assertEquals(res.status, 200);
  });
});
