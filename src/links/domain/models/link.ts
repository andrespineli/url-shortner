import type { Expiration } from "@/links/domain/models/expiration.ts";
import type { ShortCode } from "@/links/domain/models/short-code.ts";
import type { TargetUrl } from "@/links/domain/models/target-url.ts";

export interface LinkProps {
  code: ShortCode;
  target: TargetUrl;
  createdAt: Date;
  expiration: Expiration | null;
}

/** Aggregate root: a short code pointing to a destination, optionally expiring. */
export class Link {
  private constructor(private readonly props: LinkProps) {}

  static create(
    code: ShortCode,
    target: TargetUrl,
    expiration: Expiration | null,
    now: Date,
  ): Link {
    return new Link({ code, target, expiration, createdAt: new Date(now) });
  }

  static rehydrate(props: LinkProps): Link {
    return new Link({ ...props });
  }

  get code(): ShortCode {
    return this.props.code;
  }

  get target(): TargetUrl {
    return this.props.target;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get expiration(): Expiration | null {
    return this.props.expiration;
  }

  isExpiredAt(now: Date): boolean {
    return this.props.expiration?.hasPassed(now) ?? false;
  }
}
