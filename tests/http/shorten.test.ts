import { assertEquals, assertMatch } from "@std/assert";
import { buildTestApp, postJson } from "@tests/support/app.ts";

const NOW = "2026-09-16T12:00:00.000Z";
const now = () => new Date(NOW);

const linkCount = (deps: ReturnType<typeof buildTestApp>["deps"]) =>
  deps.database.prepare("SELECT count(*) AS n FROM links").get()?.n;

Deno.test("Feature: POST /api/shorten", async (t) => {
  await t.step("Scenario: shortening a valid URL returns the full contract", async () => {
    // Given the assembled application
    const { app, deps } = buildTestApp(now);
    // When a URL is shortened with an expiration
    const res = await app.request(
      "/api/shorten",
      postJson({ url: "https://www.jusbrasil.com.br", expiresAt: "2026-10-01T00:00:00Z" }),
    );
    // Then it answers 201 with the created link
    assertEquals(res.status, 201);
    const body = await res.json();
    assertMatch(body.shortCode, /^[A-Za-z0-9]{7}$/);
    assertEquals(body.shortUrl, `http://sho.rt/${body.shortCode}`);
    assertEquals(body.originalUrl, "https://www.jusbrasil.com.br");
    assertEquals(body.createdAt, NOW);
    assertEquals(body.expiresAt, "2026-10-01T00:00:00.000Z");
    // And the link is persisted
    assertEquals(linkCount(deps), 1);
  });

  await t.step("Scenario: expiresAt is optional", async () => {
    // Given the assembled application
    const { app } = buildTestApp(now);
    // When a URL is shortened without expiration
    const res = await app.request("/api/shorten", postJson({ url: "http://example.com" }));
    // Then the link never expires
    assertEquals(res.status, 201);
    assertEquals((await res.json()).expiresAt, null);
  });

  const rejected: Array<[string, RequestInit, string]> = [
    ["a non-http scheme", postJson({ url: "ftp://example.com" }), "INVALID_URL"],
    ["a javascript URL", postJson({ url: "javascript:alert(1)" }), "INVALID_URL"],
    ["a malformed URL", postJson({ url: "not a url" }), "INVALID_URL"],
    ["a missing URL", postJson({}), "VALIDATION_ERROR"],
    ["a non-JSON body", { method: "POST", body: "url=x" }, "INVALID_JSON"],
    [
      "an expiration in the past",
      postJson({ url: "https://example.com", expiresAt: "2026-09-01T00:00:00Z" }),
      "INVALID_EXPIRATION",
    ],
    [
      "a malformed expiration",
      postJson({ url: "https://example.com", expiresAt: "tomorrow" }),
      "VALIDATION_ERROR",
    ],
  ];

  for (const [input, init, code] of rejected) {
    await t.step(`Scenario: ${input} is rejected with 400 ${code}`, async () => {
      // Given the assembled application
      const { app, deps } = buildTestApp(now);
      // When the invalid request is sent
      const res = await app.request("/api/shorten", init);
      // Then it answers 400 with the error envelope
      assertEquals(res.status, 400);
      assertEquals((await res.json()).error.code, code);
      // And nothing is persisted
      assertEquals(linkCount(deps), 0);
    });
  }
});
