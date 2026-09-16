import type { Context } from "@hono/hono";
import { HTTPException } from "@hono/hono/http-exception";

/** HTTP-boundary error. Domain/application code must not import this module. */
export class AppError extends Error {
  constructor(
    readonly status: 400 | 404 | 410,
    readonly code: string,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "AppError";
  }
}

/** Single error envelope: { error: { code, message, details? } }. */
export function errorHandler(err: Error, c: Context): Response {
  if (err instanceof AppError) {
    return c.json(
      { error: { code: err.code, message: err.message, details: err.details } },
      err.status,
    );
  }
  if (err instanceof HTTPException) {
    return c.json({ error: { code: "HTTP_ERROR", message: err.message } }, err.status);
  }
  console.error(err);
  return c.json({ error: { code: "INTERNAL_ERROR", message: "unexpected error" } }, 500);
}

export function notFoundHandler(c: Context): Response {
  return c.json(
    {
      error: {
        code: "ROUTE_NOT_FOUND",
        message: `route ${c.req.method} ${c.req.path} not found`,
      },
    },
    404,
  );
}
