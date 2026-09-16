import type { Link } from "@/links/domain/models/link.ts";
import { ShortCode } from "@/links/domain/models/short-code.ts";
import type { Links } from "@/links/domain/ports/outbound/links.ts";
import type { ShortCodeGenerator } from "@/links/domain/ports/outbound/short-code-generator.ts";

/** In-memory Links double for handler tests. */
export class InMemoryLinks implements Links {
  readonly rows = new Map<string, Link>();

  save(link: Link): Promise<void> {
    this.rows.set(link.code.value, link);
    return Promise.resolve();
  }

  byCode(code: ShortCode): Promise<Link | undefined> {
    return Promise.resolve(this.rows.get(code.value));
  }

  exists(code: ShortCode): Promise<boolean> {
    return Promise.resolve(this.rows.has(code.value));
  }
}

/** Generator that replays a fixed sequence of codes. */
export class SequenceShortCodes implements ShortCodeGenerator {
  private index = 0;

  constructor(private readonly values: string[]) {}

  next(): ShortCode {
    const value = this.values[this.index++ % this.values.length]!;
    return new ShortCode(value);
  }
}

export const fixedClock = (iso: string) => () => new Date(iso);
