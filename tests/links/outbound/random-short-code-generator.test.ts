import { assert, assertEquals } from "@std/assert";
import { RandomShortCodeGenerator } from "@/links/outbound/random-short-code-generator.ts";

Deno.test("Feature: Random short codes", async (t) => {
  await t.step("Scenario: generated codes are valid and practically unique", () => {
    // Given the random generator
    const generator = new RandomShortCodeGenerator();
    // When a thousand codes are generated
    const codes = Array.from({ length: 1000 }, () => generator.next().value);
    // Then every code has 7 alphanumeric characters and none repeats
    assert(codes.every((code) => /^[A-Za-z0-9]{7}$/.test(code)));
    assertEquals(new Set(codes).size, codes.length);
  });
});
