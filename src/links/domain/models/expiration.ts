import { InvalidExpiration } from "@/links/domain/errors.ts";

/** Instant after which a link stops redirecting. */
export class Expiration {
  private constructor(readonly at: Date) {}

  /** A new expiration must be a valid instant in the future. */
  static schedule(at: Date, now: Date): Expiration {
    if (Number.isNaN(at.getTime())) throw new InvalidExpiration("must be a valid date");
    if (at.getTime() <= now.getTime()) throw new InvalidExpiration("must be in the future");
    return new Expiration(new Date(at));
  }

  /** Restores a stored expiration without re-checking it against the clock. */
  static restore(at: Date): Expiration {
    return new Expiration(new Date(at));
  }

  hasPassed(now: Date): boolean {
    return now.getTime() >= this.at.getTime();
  }
}
