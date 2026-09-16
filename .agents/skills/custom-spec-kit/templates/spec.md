# SPEC-NNN — <Use case>

| Field | Value |
| --- | --- |
| Status | Draft \| Approved \| In progress \| In review \| Done |
| Kind | feature |
| Directives | <domain, persistence, command/query, inbound, UI as needed> |
| Skill coverage | Complete list in section 3; use actual installed paths |
| Requirements | R-…, R-… |
| TDD | <actual document/section; full ../TDD.md or compact ../PLAN.md#tdd>, context <bc> |
| Depends on | SPEC-… |
| Branch | `feature/SPEC-NNN-<slug>` |
| Created | YYYY-MM-DD |

## 1. Complete feature scope
One paragraph: actor, trigger, observable outcome and error paths. Include all necessary layers; name reused components and the real entrypoint used for acceptance.

## 2. Out of scope for this spec

## 3. Skills and references for the complete slice

List every required skill and exact reference path, its purpose and the tasks
that consume it. Include workflow/spec-kit, applicable LLD contracts and stack
concretes, tests, UI renderer/client contracts when needed, infrastructure
changes and project rules. Include kickstart only when baseline work is needed.
Resolve installed paths/bindings; names such as `lld-typescript/domain` are
shorthand, not a file to assume exists. List only relevant references.

| Skill / rule | Exact file / reference | Why this slice needs it | Tasks |
| --- | --- | --- | --- |
| <installed skill> | <actual SKILL.md and relevant references> | <responsibility> | T… |

Coverage: every affected layer, integration boundary and test kind has an
existing contract/concrete or an explicitly resolved design decision. An
unresolved required reference blocks the affected task, not unrelated work.

## 4. Tasks (typed by layer; see spec-breakdown.md)
### T1 — <title>
- Type: Domain | Application | Persistence | Read | Inbound | UI | Shared | Docs Sync
- Requirement IDs: R-…
- Depends on: —
- Files: `src/...`, `tests/...`
- Loads: `low-level-design/<contract>`, `<stack>/<contract>`, `low-level-design/tests`, `<stack>/tests`, <selected renderer reference for UI>, project rules
- What:
- Verify: `<test command>`
Done when
- [ ]

## 5. Tests that prove the requirements (cover the applicable directives)
| Requirement | Test | Kind (unit / integration / component / contract / architecture) |
| --- | --- | --- |

## 6. Acceptance (what the reviewer runs)
- [ ]

## 7. Decisions taken during this spec
| # | Decision | Why | Rejected |
| --- | --- | --- | --- |

## 8. Review
- [ ] diff reviewed by <user> on YYYY-MM-DD
- Commit / PR: <actual evidence when requested; otherwise pending user’s final commit>
