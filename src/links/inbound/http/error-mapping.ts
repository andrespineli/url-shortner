import {
  InvalidExpiration,
  InvalidShortCode,
  InvalidTargetUrl,
  LinkExpired,
  LinkNotFound,
} from "@/links/domain/errors.ts";
import { AppError } from "@/shared/http/errors.ts";

/** Translates typed errors of the links context into the HTTP error envelope. */
export function mapLinkError(err: Error): Error {
  if (err instanceof InvalidTargetUrl) return new AppError(400, "INVALID_URL", err.message);
  if (err instanceof InvalidExpiration) return new AppError(400, "INVALID_EXPIRATION", err.message);
  if (err instanceof InvalidShortCode) return new AppError(404, "LINK_NOT_FOUND", "link not found");
  if (err instanceof LinkNotFound) return new AppError(404, "LINK_NOT_FOUND", err.message);
  if (err instanceof LinkExpired) return new AppError(410, "LINK_EXPIRED", err.message);
  return err;
}
