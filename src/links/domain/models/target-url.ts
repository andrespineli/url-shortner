import { InvalidTargetUrl } from "@/links/domain/errors.ts";

const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);

/** Destination of a link. Only absolute http(s) URLs are accepted. */
export class TargetUrl {
  readonly value: string;

  constructor(raw: string) {
    const value = raw.trim();
    let url: URL;
    try {
      url = new URL(value);
    } catch {
      throw new InvalidTargetUrl(raw);
    }
    if (!ALLOWED_PROTOCOLS.has(url.protocol) || !url.hostname) throw new InvalidTargetUrl(raw);
    this.value = value;
  }

  equals(other: TargetUrl): boolean {
    return this.value === other.value;
  }
}
