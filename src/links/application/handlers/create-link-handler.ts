import type { CreateLink } from "@/links/application/commands/create-link.ts";
import { ShortCodeExhausted } from "@/links/domain/errors.ts";
import { Expiration } from "@/links/domain/models/expiration.ts";
import { Link } from "@/links/domain/models/link.ts";
import type { ShortCode } from "@/links/domain/models/short-code.ts";
import { TargetUrl } from "@/links/domain/models/target-url.ts";
import type { Links } from "@/links/domain/ports/outbound/links.ts";
import type { ShortCodeGenerator } from "@/links/domain/ports/outbound/short-code-generator.ts";

export interface CreatedLink {
  shortCode: string;
  originalUrl: string;
  createdAt: Date;
  expiresAt: Date | null;
}

const MAX_ATTEMPTS = 5;

export class CreateLinkHandler {
  constructor(
    private readonly links: Links,
    private readonly codes: ShortCodeGenerator,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async handle(command: CreateLink): Promise<CreatedLink> {
    const now = this.now();
    const target = new TargetUrl(command.url);
    const expiration = command.expiresAt === null
      ? null
      : Expiration.schedule(new Date(command.expiresAt), now);

    const link = Link.create(await this.freeCode(), target, expiration, now);
    await this.links.save(link);

    return {
      shortCode: link.code.value,
      originalUrl: link.target.value,
      createdAt: link.createdAt,
      expiresAt: link.expiration?.at ?? null,
    };
  }

  private async freeCode(): Promise<ShortCode> {
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      const code = this.codes.next();
      if (!(await this.links.exists(code))) return code;
    }
    throw new ShortCodeExhausted(MAX_ATTEMPTS);
  }
}
