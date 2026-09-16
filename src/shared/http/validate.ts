import type { Context } from "@hono/hono";
import type { z } from "@zod/zod";
import { AppError } from "@/shared/http/errors.ts";

/** Parses the JSON body against a zod schema; any bad input is a 400 with field details. */
export async function parseBody<S extends z.ZodType>(c: Context, schema: S): Promise<z.infer<S>> {
  const raw = await c.req.json().catch(() => {
    throw new AppError(400, "INVALID_JSON", "request body must be valid JSON");
  });
  const result = schema.safeParse(raw);
  if (!result.success) {
    throw new AppError(400, "VALIDATION_ERROR", "invalid request body", result.error.issues);
  }
  return result.data;
}
