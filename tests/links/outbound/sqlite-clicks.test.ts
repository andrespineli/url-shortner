import { assertEquals } from "@std/assert";
import { Click } from "@/links/domain/models/click.ts";
import { Link } from "@/links/domain/models/link.ts";
import { ShortCode } from "@/links/domain/models/short-code.ts";
import { TargetUrl } from "@/links/domain/models/target-url.ts";
import { SqliteClicks } from "@/links/outbound/persistence/sqlite-clicks.ts";
import { SqliteLinks } from "@/links/outbound/persistence/sqlite-links.ts";
import { openDatabase } from "@/shared/sqlite/database.ts";

Deno.test("Feature: SQLite clicks persistence", async (t) => {
  await t.step(
    "Scenario: a click is stored with referrer, user agent, ip and timestamp",
    async () => {
      // Given a stored link
      const database = openDatabase(":memory:");
      const code = new ShortCode("Abc1234");
      const at = new Date("2026-09-16T12:00:00Z");
      await new SqliteLinks(database).save(
        Link.create(code, new TargetUrl("https://example.com"), null, at),
      );
      // When a click and an anonymous click are recorded
      const clicks = new SqliteClicks(database);
      await clicks.record(
        Click.record(code, { referrer: "https://t.co", userAgent: "UA", ip: "1.2.3.4" }, at),
      );
      await clicks.record(Click.record(code, { referrer: null, userAgent: null, ip: null }, at));
      // Then both rows hold exactly the visitor data
      const rows = database
        .prepare("SELECT code, referrer, user_agent, ip, clicked_at FROM clicks ORDER BY id")
        .all()
        .map((row) => ({ ...row }));
      assertEquals(rows, [
        {
          code: "Abc1234",
          referrer: "https://t.co",
          user_agent: "UA",
          ip: "1.2.3.4",
          clicked_at: "2026-09-16T12:00:00.000Z",
        },
        {
          code: "Abc1234",
          referrer: null,
          user_agent: null,
          ip: null,
          clicked_at: "2026-09-16T12:00:00.000Z",
        },
      ]);
    },
  );
});
