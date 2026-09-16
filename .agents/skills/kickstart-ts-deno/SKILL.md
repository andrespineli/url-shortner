---
name: kickstart-ts-deno
description: TypeScript + Deno 2 implementation of the project-kickstart `stack` contract — Hono for HTTP, zod at the edge, a single error envelope, a composition root for dependency injection and network-free tests via app.request. Infrastructure only, code layout comes from the bound low-level-design skill (ask the user when none is bound). Use when starting a new TypeScript/Deno HTTP service from zero or when a timeboxed challenge needs a working API in minutes. Do NOT use for CLIs, front-ends, or Node/Express projects.
metadata:
  category: development
  author: andrespineli
  version: "0.4.0"
implements: project-kickstart
provides:
  - stack
stack: typescript
---

# Kickstart — TypeScript + Deno 2 (Hono)

Concrete capability of `project-kickstart` for TypeScript on Deno 2. It owns
the infrastructure: runtime, framework, versions, how an endpoint is
declared, how dependencies are wired, how errors and validation reach the
wire, how tests run. **It does not decide code layout.** Before scaffolding,
find the bound `low-level-design` skill (hexagonal via `lld-typescript`, or
whatever the project binds); if none is bound, ask the user which design to
follow and record it in the spec.

## Toolchain (pinned in `deno.json`)

| Piece | Choice | Version |
| --- | --- | --- |
| Runtime | Deno | 2.x (`deno fmt`/`lint`/`check`/`test` built in) |
| HTTP | `@hono/hono` | ^4.13 |
| Validation | `@zod/zod` | ^4.6 |
| Tests | `@std/assert`, `@std/testing` | ^1.0 |

Nothing else. A new dependency is a decision line in the spec.

## 1. Create the thin baseline

The agent may create the files directly by following this skill. A generator
is optional, never a prerequisite. Preserve existing planning and harness
files. The optional helper below requires an empty target; do not run it over
an initialized project or delete its files to satisfy that restriction.


```sh
<path-to-skill>/scripts/scaffold.sh <dir>
```

Creates the files below, formats, caches dependencies, runs `deno task check`
(fmt + lint + types + tests) without initializing Git, staging or committing. Cached dependencies support
subsequent offline runs. Leave all changes for the user’s final review and commit.

```
main.ts                      entrypoint — the only file that binds a port
src/app.ts                   createApp(deps): Hono — middleware, /health, error handling,
                             and the documented hook where feature routers mount
src/dependencies.ts          composition root — the only place implementations are built
src/shared/http/errors.ts    AppError + errorHandler → { error: { code, message, details? } }
src/shared/http/validate.ts  parseBody / parseQuery with zod → 400 / 422
tests/http/health.test.ts    app.request(...) against createApp(buildDependencies())
requests.http, README.md, .gitignore
```

## 2. Declaring an endpoint

A feature exposes a `Hono` router and `app.ts` mounts it:
`app.route("/", casesRoutes(deps))`. Inside a route: `parseBody`/`parseQuery`
→ dispatch a command handler or query → `c.json(dto, status)`. Translate typed
domain/application errors to `AppError` only in the inbound HTTP adapter.
Domain/application modules never import Hono, zod or shared HTTP helpers.
Unknown errors reach the logged 500 envelope.
Where the router module and its collaborators live is the LLD's decision;
for hexagonal + CQS see `lld-typescript/references/rest-example.md`.

## 3. Dependency injection

`buildDependencies()` in `src/dependencies.ts` constructs every concrete
implementation and returns the `Dependencies` object `createApp` receives.
Use explicit wiring unless the project already has a container. Tests call the
same assembly with disposable instances of the chosen infrastructure; the
kickstart does not select persistence. Add entries as approved specs need them.
No business rules, aggregate construction, serialization, persistence selection
or application orchestration belongs in the bootstrap. For the house Deno/TS
baseline bind `lld-typescript` and use its DevStation domain/command/query/
persistence patterns; an HTTP example never overrides those contracts.

## 4. Tests

Use DevStation-style `describe`/`it` and English Given/When/Then comments from
`lld-typescript/tests`. Through `app.request`: routing, validation and the
handler in one shot, no socket. Minimum per resource: one happy path, one validation error, one
not-found.

## 5. Finish line

`deno task check` green, README run/test/check, spec open questions list the
cuts. Present the complete diff for user review; no automatic commits, staging,
pushes or PRs. When the user owns the final commit, leave that operation to them.

## When asked "why X?"

Load [references/decisions.md](references/decisions.md).
