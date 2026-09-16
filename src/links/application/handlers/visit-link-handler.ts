import type { VisitLink } from "@/links/application/commands/visit-link.ts";
import { LinkNotFound } from "@/links/domain/errors.ts";
import { ShortCode } from "@/links/domain/models/short-code.ts";
import type { Clicks } from "@/links/domain/ports/outbound/clicks.ts";
import type { Links } from "@/links/domain/ports/outbound/links.ts";

export class VisitLinkHandler {
  constructor(
    private readonly links: Links,
    private readonly clicks: Clicks,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async handle(command: VisitLink): Promise<{ originalUrl: string }> {
    if (!ShortCode.isValid(command.code)) throw new LinkNotFound(command.code);
    const link = await this.links.byCode(new ShortCode(command.code));
    if (!link) throw new LinkNotFound(command.code);

    const click = link.visit(
      { referrer: command.referrer, userAgent: command.userAgent, ip: command.ip },
      this.now(),
    );
    await this.clicks.record(click);

    return { originalUrl: link.target.value };
  }
}
