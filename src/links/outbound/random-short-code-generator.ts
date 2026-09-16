import { ShortCode } from "@/links/domain/models/short-code.ts";
import type { ShortCodeGenerator } from "@/links/domain/ports/outbound/short-code-generator.ts";

const ALPHABET = ShortCode.ALPHABET;
// Largest multiple of the alphabet size below 256: bytes above it are discarded
// so every character has the same probability (no modulo bias).
const LIMIT = 256 - (256 % ALPHABET.length);

/** Cryptographically random base62 codes. */
export class RandomShortCodeGenerator implements ShortCodeGenerator {
  next(): ShortCode {
    let value = "";
    while (value.length < ShortCode.LENGTH) {
      for (const byte of crypto.getRandomValues(new Uint8Array(16))) {
        if (byte < LIMIT && value.length < ShortCode.LENGTH) {
          value += ALPHABET[byte % ALPHABET.length];
        }
      }
    }
    return new ShortCode(value);
  }
}
