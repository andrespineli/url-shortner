# Contract: stack

## Inputs

- Target directory and project name; preserve existing planning/configuration.
  An optional helper may require an empty target; direct creation does not.
- The bound `low-level-design` skill, or the user's answer when none is bound.

## Required outputs (checked on the resulting baseline)

| # | Deliverable | Check |
| --- | --- | --- |
| 1 | Toolchain pinned | manifest lists runtime/framework/lib versions; cache warm |
| 2 | Entrypoint + application assembly | entrypoint binds the port; `New(deps)`/`createApp(deps)` builds the router |
| 3 | Composition root (DI/bootstrap) | one file wires everything; tests reuse it |
| 4 | Endpoint declaration | `GET /health` → 200 `{status: ok}`; documented hook for feature routes |
| 5 | Error envelope | unknown route → 404 `{error: {code, message}}` |
| 6 | Edge validation | invalid body → 400/422 with details |
| 7 | Network-free tests | example test passes with no port bound |
| 8 | Gate command | one command: fmt check → lint/vet → type check → tests |
| 9 | README and requests file | present; changes remain uncommitted for user review |
| 10 | Decisions reference | choice · why · rejected · flip when |

## Rules

- Scripts are optional. Bootstrap never stages, commits or pushes.
- No folder or file that encodes a code-organization choice (layers, MVC
  directories, module boundaries). Those come from the bound LLD.
- Dependencies are the minimum the stack needs; every extra one is a decision
  in the spec.
- Handlers of any shape plug into the assembly through the composition root
  and the endpoint declaration hook; the kickstart does not care what they are
  internally.

## Handoff — done when

The gate is green on the freshly generated project, offline after the first
run, and the LLD to follow is recorded in the spec.
