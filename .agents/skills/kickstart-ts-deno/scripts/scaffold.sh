#!/usr/bin/env bash
# Scaffold a Deno 2 + Hono REST API with the kickstart conventions.
# Usage: scaffold.sh <target-dir>
#   target-dir   directory to create (must not exist or be empty)
# Creates infrastructure only; code layout comes from the bound low-level-design skill.
set -euo pipefail

TARGET="${1:?usage: scaffold.sh <target-dir>}"

if [ -e "$TARGET" ] && [ -n "$(ls -A "$TARGET" 2>/dev/null)" ]; then
  echo "error: $TARGET exists and is not empty" >&2
  exit 1
fi

mkdir -p "$TARGET"/{src/shared/http,tests/http}
cd "$TARGET"

cat > deno.json <<EOF
{
  "nodeModulesDir": "none",
  "imports": {
    "@hono/hono": "jsr:@hono/hono@^4.13.8",
    "@std/assert": "jsr:@std/assert@^1.0.19",
    "@std/testing": "jsr:@std/testing@^1.0.20",
    "@zod/zod": "jsr:@zod/zod@^4.6.5",
    "@/": "./src/"
  },
  "tasks": {
    "dev": "deno run --watch --allow-net --allow-env main.ts",
    "start": "deno run --allow-net --allow-env main.ts",
    "test": "deno test --allow-net --allow-env",
    "check": "deno fmt --check && deno lint && deno check main.ts && deno test --allow-net --allow-env",
    "fmt": "deno fmt",
    "lint": "deno lint"
  },
  "fmt": { "lineWidth": 100, "indentWidth": 2, "semiColons": true, "singleQuote": false,
           "exclude": [".agents/", "AGENTS.md", "README.md"] },
  "lint": { "exclude": [".agents/"] },
  "compilerOptions": { "strict": true, "noUncheckedIndexedAccess": true }
}
EOF

cat > .gitignore <<'EOF'
.env
coverage/
reports/
EOF

cat > main.ts <<'EOF'
import { createApp } from "@/app.ts";
import { buildDependencies } from "@/dependencies.ts";

const port = Number(Deno.env.get("PORT") ?? 8000);
const app = createApp(buildDependencies(), { log: true });

Deno.serve({ port }, app.fetch);
EOF

cat > src/app.ts <<'EOF'
import { Hono } from "@hono/hono";
import { logger } from "@hono/hono/logger";
import type { Dependencies } from "@/dependencies.ts";
import { errorHandler, notFoundHandler } from "@/shared/http/errors.ts";

/** Builds the HTTP app from explicit dependencies so tests never touch the network. */
export function createApp(deps: Dependencies, opts: { log?: boolean } = {}): Hono {
  const app = new Hono();

  if (opts.log) app.use(logger());
  app.onError(errorHandler);
  app.notFound(notFoundHandler);

  app.get("/health", (c) => c.json({ status: "ok" }));

  // Feature routes mount here, one router per module; where the router module
  // lives is decided by the bound low-level-design skill, e.g.:
  // app.route("/", casesRoutes(deps));
  void deps;

  return app;
}
EOF

cat > src/dependencies.ts <<'EOF'
/**
 * Composition root (bootstrap / dependency injection) — the only place where
 * concrete infrastructure implementations are constructed and wired. Tests
 * call the same assembly with explicitly selected disposable infrastructure.
 * What the entries are (handlers, services, controllers) is the LLD's call.
 */
// deno-lint-ignore no-empty-interface
export interface Dependencies {
  // Filled by the first feature, e.g.: openCase: OpenCaseHandler;
}

export function buildDependencies(): Dependencies {
  return {};
}
EOF

cat > src/shared/http/errors.ts <<'EOF'
import type { Context } from "@hono/hono";
import { HTTPException } from "@hono/hono/http-exception";

/** HTTP-boundary error. Domain/application code must not import this module. */
export class AppError extends Error {
  constructor(
    readonly status: 400 | 404 | 409 | 422,
    readonly code: string,
    message: string,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const notFound = (what: string, id: string) =>
  new AppError(404, "not_found", `${what} ${id} not found`);

export const conflict = (message: string) => new AppError(409, "conflict", message);

/** Single error envelope: { error: { code, message, details? } }. */
export function errorHandler(err: Error, c: Context): Response {
  if (err instanceof AppError) {
    return c.json({ error: { code: err.code, message: err.message, details: err.details } }, err.status);
  }
  if (err instanceof HTTPException) {
    return c.json({ error: { code: "http_error", message: err.message } }, err.status);
  }
  console.error(err);
  return c.json({ error: { code: "internal_error", message: "unexpected error" } }, 500);
}

export function notFoundHandler(c: Context): Response {
  return c.json({ error: { code: "not_found", message: `route ${c.req.method} ${c.req.path} not found` } }, 404);
}
EOF

cat > src/shared/http/validate.ts <<'EOF'
import type { Context } from "@hono/hono";
import type { z } from "@zod/zod";
import { AppError } from "@/shared/http/errors.ts";

/** Parses the JSON body against a zod schema; throws 422 with field details on failure. */
export async function parseBody<S extends z.ZodType>(c: Context, schema: S): Promise<z.infer<S>> {
  const raw = await c.req.json().catch(() => {
    throw new AppError(400, "invalid_json", "request body must be valid JSON");
  });
  const result = schema.safeParse(raw);
  if (!result.success) {
    throw new AppError(422, "validation_error", "invalid request body", result.error.issues);
  }
  return result.data;
}

/** Parses query params against a zod schema; throws 422 on failure. */
export function parseQuery<S extends z.ZodType>(c: Context, schema: S): z.infer<S> {
  const result = schema.safeParse(c.req.query());
  if (!result.success) {
    throw new AppError(422, "validation_error", "invalid query", result.error.issues);
  }
  return result.data;
}
EOF

cat > tests/http/health.test.ts <<'EOF'
import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";
import { createApp } from "@/app.ts";
import { buildDependencies } from "@/dependencies.ts";

describe("HTTP baseline", () => {
  it("should report a healthy application", async () => {
    /* @Given a running application assembly */
    const app = createApp(buildDependencies());
    /* @When health is requested */
    const res = await app.request("/health");
    /* @Then the application reports that it is ready */
    assertEquals(res.status, 200);
    assertEquals(await res.json(), { status: "ok" });
  });

  it("should reject an unknown route with the error envelope", async () => {
    /* @Given a running application assembly */
    const app = createApp(buildDependencies());
    /* @When an unknown route is requested */
    const res = await app.request("/nope");
    /* @Then the response identifies a missing route */
    assertEquals(res.status, 404);
    const body = await res.json();
    assertEquals(body.error.code, "not_found");
  });
});
EOF

cat > README.md <<'EOF'
# Deno service

Deno 2 + Hono REST API. Specs live under `.agents/specs/` (custom-spec-kit).

```sh
deno task dev      # http://localhost:8000/health
deno task test
deno task check    # fmt + lint + types + tests
```
EOF

cat > requests.http <<'EOF'
### Health
GET http://localhost:8000/health
EOF

deno fmt >/dev/null
deno install --quiet 2>/dev/null || deno cache main.ts tests/**/*.ts
deno task check
echo "scaffolded $TARGET — review the diff and commit manually when finished"
