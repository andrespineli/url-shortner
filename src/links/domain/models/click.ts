import type { ShortCode } from "@/links/domain/models/short-code.ts";

/** Who followed a link, as far as the request tells. */
export interface Visitor {
  referrer: string | null;
  userAgent: string | null;
  ip: string | null;
}

/** One successful redirect of a link. */
export class Click {
  private constructor(
    readonly code: ShortCode,
    readonly visitor: Visitor,
    readonly clickedAt: Date,
  ) {}

  static record(code: ShortCode, visitor: Visitor, at: Date): Click {
    return new Click(code, { ...visitor }, new Date(at));
  }
}
