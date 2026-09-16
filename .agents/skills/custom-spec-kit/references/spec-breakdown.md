# Building a feature spec from the TDD

[spec-categories.md](spec-categories.md) owns the implementation directives,
loads and required proof. This guide owns the procedure and task block.

1. Take the next dependency-ready feature: actor, trigger, complete outcome,
   requirement IDs and rejection paths. A request to create/delete/update/list
   is a complete feature work unit, not a request for a single architectural layer.
2. Select the directives needed to deliver that feature. Include required
   domain, adapter, command/query, endpoint, wiring and UI work in this spec;
   reuse what already exists. Do not spin off a persistence spec.
   Build a consolidated skill/reference inventory covering the entire slice:
   workflow/spec-kit, relevant LLD contracts and TypeScript concretes, tests,
   UI/transport/client contracts, infrastructure when changed, and project
   rules. Record exact installed paths, purpose and consuming task IDs.
   Check that every necessary reference exists; resolve gaps before implementing
   dependent work. Do not list only the command skill for a feature that also
   needs domain, adapter and endpoint work. A compact spec retains this inventory.
3. Order cohesive tasks by actual dependencies. Keep code in its LLD layer and
   name the nearest sibling/reference. Domain behaviour + unit tests, port +
   adapter + integration, command + handler tests, query + records + checks,
   endpoint + error mapping, and UI + component checks may all belong to this
   spec. A task may touch several related files; do not impose a file quota.
4. For each task record Type, Requirement IDs, Depends on, Files, Loads, What,
   Verify and Done when. Tests accompany the behaviour they prove. The final
   acceptance must exercise the assembled feature, including persistence and
   relevant failure paths. Fake-client component tests alone do not prove API
   integration.
   Each task's Loads selects from the spec inventory. Load progressively per
   task; a complete inventory does not require loading every document at once.
5. Synchronize index/state and present scope, acceptance and cuts. Use the
   selected approval policy: per-spec normally, or one explicitly approved
   compact bundle. A broad spec still needs a bounded, demonstrable outcome;
   split by useful behaviour if it cannot fit the agreed scope/timebox.

## Task block

```text
### T3 — Persist contracts behind the port
- Type: Persistence
- Requirement IDs: R-002
- Depends on: T1
- Files: src/contracts/domain/ports/outbound/contracts.ts, src/contracts/outbound/memory/adapter.ts, tests/contracts/outbound/memory/adapter.test.ts
- Loads: low-level-design/persistence, low-level-design/hexagonal, low-level-design/tests, lld-typescript/persistence, lld-typescript/hexagonal, lld-typescript/tests, project rules
- What: implement of/save behind the existing Contracts port; Map of detached raw snapshots is the approved baseline
- Verify: deno test tests/contracts/outbound/memory/
Done when
- [ ] a stored contract round-trips by ID
- [ ] an update preserves the ID and changes the stored state
```

UI tasks use `Type: UI`, load `low-level-design/ui` and `lld-typescript/ui`
plus the selected React web/Ink reference and tests, and name the actual
channel test command. Replace sample paths and commands with project values.
