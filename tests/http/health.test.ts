import { assertEquals } from "@std/assert";
import { buildTestApp } from "@tests/support/app.ts";

Deno.test("Feature: Service health", async (t) => {
  await t.step("Scenario: the assembled application reports it is ready", async () => {
    // Given the application assembled over an in-memory database
    const { app } = buildTestApp();
    // When the health endpoint is requested
    const res = await app.request("/health");
    // Then it answers 200 with status ok
    assertEquals(res.status, 200);
    assertEquals(await res.json(), { status: "ok" });
  });

  await t.step("Scenario: an unknown route answers with the error envelope", async () => {
    // Given the assembled application
    const { app } = buildTestApp();
    // When an unknown route is requested
    const res = await app.request("/api/nope");
    // Then it answers 404 with a stable error code
    assertEquals(res.status, 404);
    assertEquals((await res.json()).error.code, "ROUTE_NOT_FOUND");
  });
});
