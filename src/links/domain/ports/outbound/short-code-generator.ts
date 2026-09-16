import type { ShortCode } from "@/links/domain/models/short-code.ts";

export interface ShortCodeGenerator {
  next(): ShortCode;
}
