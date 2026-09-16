import { InvalidShortCode } from "@/links/domain/errors.ts";

/** Public identifier of a link: exactly 7 alphanumeric characters. */
export class ShortCode {
  static readonly LENGTH = 7;
  static readonly ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  private static readonly PATTERN = /^[A-Za-z0-9]{7}$/;

  constructor(readonly value: string) {
    if (!ShortCode.PATTERN.test(value)) throw new InvalidShortCode(value);
  }

  static isValid(value: string): boolean {
    return ShortCode.PATTERN.test(value);
  }

  equals(other: ShortCode): boolean {
    return this.value === other.value;
  }
}
