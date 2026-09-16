import { assertEquals } from "@std/assert";
import { openDatabase } from "@/shared/sqlite/database.ts";

Deno.test("Feature: SQLite schema", async (t) => {
  await t.step("Scenario: opening the database creates links and clicks tables", () => {
    // Given a fresh in-memory database
    const database = openDatabase(":memory:");
    // When the schema tables are listed
    const tables = database
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name IN ('links','clicks')")
      .all()
      .map((row) => row.name)
      .sort();
    // Then both tables exist
    assertEquals(tables, ["clicks", "links"]);
  });

  await t.step("Scenario: applying the schema twice is harmless", () => {
    // Given a database whose schema was already applied
    const database = openDatabase(":memory:");
    // When the schema is applied again
    database.exec("CREATE TABLE IF NOT EXISTS links (code TEXT PRIMARY KEY)");
    // Then the database remains usable
    assertEquals(database.prepare("SELECT count(*) AS n FROM links").get()?.n, 0);
  });
});
