# Baseline decisions and their defence

Each row: what was chosen, why, what was rejected, and what would make me flip.

| Decision | Why | Rejected | Flip when |
| --- | --- | --- | --- |
| **Deno 2** runtime | Zero-config TS, built-in fmt/lint/test/check, single binary, permissions explicit (`--allow-net`), `deno.json` is the whole toolchain. | Node + tsx/vitest/eslint/prettier (5 tools to align), Bun (younger test/compat story). | Team standard is Node; a required npm dep breaks under Deno (rare since npm: specifiers). |
| **Hono** as HTTP framework | Web-standard `Request/Response`, runs on Deno/Node/Bun/edge unchanged, `app.request()` gives network-free tests, tiny API surface to explain. | Oak (Deno-only, larger), Express (Node-centric, callback-era), raw `Deno.serve` routing (hand-rolled router = time). | Need OpenAPI-first codegen (then Hono + `@hono/zod-openapi`, still Hono). |
| **zod** for validation | Schema is the contract: one source for parsing, types (`z.infer`) and error details. Same lib front/back if a UI appears. | Hand-written guards (drift), valibot (smaller but less known), JSON Schema + ajv (no static types). | Payload schemas must be shared with non-TS consumers → publish JSON Schema from zod. |
| **Single error envelope** `{ error: { code, message, details? } }` | Clients switch on `code`, not on prose; validation `details` carry zod issues; 500 never leaks internals. | Framework default HTML/text errors, RFC 7807 problem+json (fine, more fields to explain). | API must follow an org-wide standard (then adopt it, same handler). |
| **Tests via `app.request`** | Whole stack from routing to JSON without sockets: fast, deterministic, no port conflicts, works in CI unchanged. | Spin the server + fetch (slow, flaky ports), unit-test handlers only (misses routing/validation). | Need to test streaming/websockets → add a server-level test just for that. |
| **UUID ids from `crypto.randomUUID()`** | Zero deps, collision-free, opaque. | Auto-increment (needs a store), ULID (sortable, but one more dep). | Ordering by id matters → ULID. |
| **Composition root `dependencies.ts`** (DI/bootstrap) | One file answers "what talks to what"; tests build the same graph with memory adapters; no DI container to explain. | DI container/decorators (magic, reflection under Deno). | >30 handlers: split the root per bounded context, still no container. |
| **Conventional Commits per slice** | Diff per slice is the interview narrative; `git log` becomes the demo script. | One commit at the end. | Never. |
| **No auth, no pagination, no persistence by default** | Explicit non-goals in the spec; each is a 10-minute slice when asked. Scope discipline is graded. | Speculatively adding them. | The prompt lists them as MUST. |

## Sentences that travel well

- "Boring decisions were made before the clock started; the hour goes to the
  domain."
- "Tests hit `app.request`, so the suite proves routing, validation and the
  handler in one shot, with no network."
- "Every cut is written in the WON'T list with the reason, so scope is a
  decision and not an accident."
