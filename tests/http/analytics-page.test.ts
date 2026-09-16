import { assert, assertEquals, assertFalse, assertStringIncludes } from "@std/assert";
import { buildTestApp } from "@tests/support/app.ts";
import { shorten, visit } from "@tests/support/scenarios.ts";

Deno.test("Feature: Analytics page", async (t) => {
  await t.step("Scenario: the page shows total, daily chart and referrers", async () => {
    // Given a shortened URL clicked twice from a referrer
    const testApp = buildTestApp();
    const code = await shorten(testApp, "https://www.jusbrasil.com.br");
    await visit(testApp, code, "https://news.ycombinator.com");
    await visit(testApp, code, "https://news.ycombinator.com");
    // When the analytics page is opened
    const res = await testApp.app.request(`/analytics/${code}`);
    // Then it renders HTML with the total, the chart and the referrer
    assertEquals(res.status, 200);
    assertStringIncludes(res.headers.get("content-type") ?? "", "text/html");
    const page = await res.text();
    assertStringIncludes(page, `data-testid="total-clicks">2<`);
    assertStringIncludes(page, "<svg");
    assertStringIncludes(page, "https://news.ycombinator.com");
    assertStringIncludes(page, `http://sho.rt/${code}`);
  });

  await t.step("Scenario: user-provided content is escaped", async () => {
    // Given a link whose URL and referrer carry markup
    const testApp = buildTestApp();
    const code = await shorten(testApp, "https://evil.example/?q=<script>alert(1)</script>");
    await visit(testApp, code, "https://x.example/<img src=x onerror=alert(1)>");
    // When the analytics page is opened
    const page = await (await testApp.app.request(`/analytics/${code}`)).text();
    // Then no raw markup from the data reaches the page
    assertFalse(page.includes("<script>alert(1)</script>"));
    assertFalse(page.includes("<img src=x"));
    assert(page.includes("&lt;script&gt;"));
  });

  await t.step("Scenario: an unknown code shows a not found page", async () => {
    // Given the assembled application
    const { app } = buildTestApp();
    // When the analytics page of an unknown code is opened
    const res = await app.request("/analytics/Nope000");
    // Then it answers a 404 HTML page
    assertEquals(res.status, 404);
    assertStringIncludes(await res.text(), "Link não encontrado");
  });
});
