---
name: project-kickstart
description: Abstract contract for starting a new service from zero — one contract, `stack`, bound to a concrete stack capability (kickstart-ts-deno, kickstart-go-vanilla, later php-laravel, kotlin-ktor…). A kickstart delivers the basic infrastructure only (runtime, framework and library versions, how endpoints are declared, bootstrap/dependency injection, error envelope, edge validation, test harness, gate command and README for user review). It never decides code layers, the layout comes from the bound low-level-design skill, and when none is bound the kickstart asks the user which LLD to follow before scaffolding. Use when the user says "new project", "scaffold", "kickstart", "start an API", "bootstrap a service".
metadata:
  category: development
  author: andrespineli
  version: "0.3.0"
contracts:
  - stack
---

# Project Kickstart (abstract)

A kickstart turns "new service" into a running, tested baseline for review. It owns the **infrastructure decisions** of a stack and
nothing else; how code is organized is the job of the low-level-design skill
bound in the project.

```
project-kickstart (contract: stack)        low-level-design (contract per concern)
   └── kickstart-<stack>                      └── lld-<stack> | an MVC lld | …
       runtime, framework, versions              layers, folders, naming,
       endpoint declaration, DI/bootstrap        where a handler or a model lives
       error envelope, validation, tests, gate
```

The same kickstart must work with a hexagonal LLD, an MVC LLD or none.

## Granularity: one stack, not language × framework

A capability is a coherent pair `<language>-<runtime or framework>`:
`ts-deno`, `go-vanilla`, `ts-node-express`, `php-laravel`, `kotlin-ktor`.
Separate "language" and "framework" contracts would allow nonsense
combinations. `vanilla` means the standard library carries HTTP, testing and
tooling.

## Before scaffolding: find the LLD

1. Look for a bound `low-level-design` composition in the project
   (`harness.yaml` bindings, or the "Composed designs" section of
   `AGENTS.md`). If present, that skill decides the layout; the kickstart
   only creates the infrastructure files listed below.
2. If no LLD is bound, **ask the user** which design to follow (hexagonal,
   MVC, flat modules, …) and suggest binding the matching skill. Do not
   guess and do not create layer folders on your own.
3. Record the answer in the spec (bound `sdd` capability) as a decision.

## Contract `stack` — see [references/stack.md](references/stack.md)

Every capability delivers:

1. **Toolchain pinned**: runtime, framework and library versions declared in
   the stack's manifest, dependency cache warmed.
2. **Entrypoint** that binds the port, and an **application assembly** that
   builds the router from explicit dependencies so tests never bind a port.
3. **Bootstrap / dependency injection**: one composition root where
   adapters, services and handlers are wired; nothing constructs its own
   dependencies elsewhere.
4. **Endpoint declaration**: the way a route is registered, with a
   `/health` example and a documented hook where feature routes are mounted.
5. **Single error envelope** with stable codes; unknown errors never leak.
6. **Edge validation** turning bad input into the envelope.
7. **Test harness** exercising routing → validation → handler with no
   network, with an example test.
8. **Gate command**: format check, lint/vet, type check and tests in the
   order CI will run.
9. **README** with run/test/gate and a `requests.http` (or equivalent).
   Leave changes uncommitted for the user’s final review. Never initialize,
   stage, commit or push implicitly from a bootstrap.
10. **Decisions reference**: each infrastructure choice, its rejected
    alternative, and the trigger that would flip it.

## What a kickstart never does

- Create domain, application, inbound or outbound folders, models, services
  or controllers: the LLD says where those go, the `sdd` capability says how
  they are broken down.
- Choose the domain or write the spec.
- Add persistence, auth, pagination or observability speculatively.

## Adding a stack

One folder `kickstart-<stack>` with `implements: project-kickstart`,
`provides: [stack]` and `references/decisions.md`. A script is optional;
agent-created files following the skill are sufficient. Validate the resulting
baseline with its gate. Any helper must preserve the same review boundary. Example apps to derive
from: the DevStation CLI (Deno), `harness` (Go vanilla).
