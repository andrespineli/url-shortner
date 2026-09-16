# Spec kinds and implementation directives

The work unit is a **complete feature**, not an architectural layer.
The TDD assigns a kind, requirement IDs and actual dependencies to each spec:

- `domain-structure`: establish/verify a domain app's thin baseline, bound LLD,
  runtime/config, composition root, health, gate and CI when in scope.
- `channel-structure`: establish/verify a channel's tooling, renderer,
  published-contract client/provider, smoke and gate.
- `feature`: one complete observable capability, such as create, delete, update
  or list. Include every necessary layer and test in the same spec. A feature
  may include server and UI work when both are part of its agreed acceptance.

SPEC-001 establishes the first base. Add another structure spec only for a new
application/channel base. Do not create domain-only or adapter-only specs as a
precondition for a feature; put that work in its tasks. Split oversized features
by independently useful behaviour, never merely by command/domain/adapter.

## Directives within each spec

This is the only table mapping implementation concerns to loads and proof.
Select all rows the feature actually needs. Every task also loads
`low-level-design/tests`, its stack's `tests` reference and project rules.
For TypeScript, use `lld-typescript` with the matching reference per row.

| Directive | Task scope | LLD loads | Required proof |
| --- | --- | --- | --- |
| Structure | Necessary toolchain/config, app/channel assembly and thin bootstrap | `project-kickstart` + compatible capability; `hexagonal`, `naming`; `ui` for channels | Real health/smoke, local gate, CI if remote publication is in scope |
| Domain | Aggregate behaviour, VOs/entities, invariants/exceptions/events and ports | `domain`, `naming` | Pure unit tests for invariants, validation and transitions |
| Persistence / external adapter | Port and outbound implementation, serialization, config and applicable failure/consistency policy | `persistence` for storage; `hexagonal`; relevant published external contract | Real disposable storage round-trip/errors or real provider/contract checks |
| Command | Primitive DTO, handler orchestration and minimal result | `command`, `domain` | Handler behaviour with port doubles, relevant rejection paths |
| Query | Record types, direct storage read, filtering/pagination when required | `query` | Seeded real-storage queries, empty/filter cases; no aggregate or write-port imports |
| Inbound / wiring | HTTP/RPC request decoding, dispatch, error mapping, dependency assembly | `hexagonal` | Real app endpoint integration proving the feature and its error paths |
| Context integration | Event contracts, producers/consumers and event-to-command policy when needed | `domain`, `hexagonal`, actual event conventions | Policy behaviour, dispatcher round-trip and compatibility |
| UI | Client/provider/screen/form/navigation and visible states | `ui`; React web or Ink variant | Component/flow checks plus separate real-client consumed-contract evidence |

## Boundaries and ordering

- A create spec owns the domain, port, adapter, handler and endpoint it needs.
  A later delete spec reuses them and owns deletion behaviour through all
  affected layers. Neither waits on an artificial adapter spec.
- Task dependencies remain explicit inside the spec: port before adapter,
  invariant before orchestration, working dependencies before endpoint proof.
  Keep commands and queries as separate code paths and appropriately typed
  tasks, even when both support one feature's acceptance.
- Specify feature-level acceptance through its real entrypoint. Passing
  disconnected layer tests alone does not establish a complete feature.
- Only add infrastructure and layers needed by the feature. The bootstrap owns
  runtime/assembly, never business behaviour or speculative persistence.
- Compact mode reduces prose and can group approval; it keeps LLD boundaries
  and relevant checks. Local publication can defer remote CI explicitly, never
  report unrun CI as green.
- Load real references. TypeScript UI uses `lld-typescript/ui` and the selected
  renderer; Deno/Hono HTTP bootstrap is not a web/Ink channel bootstrap.
  Missing BFF/other channel design is a declared gap, not an invented path.
