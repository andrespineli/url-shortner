# TDD — <Product / initiative>

| Field | Value |
| --- | --- |
| Status | Draft \| Approved |
| Owner | <tech owner> |
| PRD | `./PRD.md` (approved YYYY-MM-DD) |
| LLD | <bound low-level-design + stack capability> |
| Stack | <kickstart capability> |
| Created | YYYY-MM-DD |
| Updated | YYYY-MM-DD |

## 1. Context and constraints (from the PRD)
## 2. Bounded contexts and scope lines
| Context | Owns (requirements) | Does not own |
| --- | --- | --- |
## 3. Services / deployables and responsibilities
## 4. Code components per context (named, not implemented)
| Context | Aggregates / models | Use cases (commands) | Read models (queries) | Adapters | Endpoints |
| --- | --- | --- | --- | --- | --- |
## 5. Contracts (signature level): APIs, events, schemas, data ownership
## 6. Cross-cutting: persistence, auth, observability, configuration
### Baseline tests and gate
<Selected tests contract/concrete, channel renderer, real boundary evidence and exact gate.>

## 7. Risks and mitigation
## 8. Rollout
## 9. Macro plan — the spec list
| Spec | Kind | Complete outcome | Requirements | Depends on |
| --- | --- | --- | --- | --- |
| SPEC-001 | domain-structure | <app> thin baseline | Baseline | — |
| SPEC-002 | feature | Create <entity>: domain, adapter, command, endpoint and tests | R-… | SPEC-001 |
| SPEC-003 | feature | Delete <entity>: behaviour, persistence, endpoint and tests; reuse create baseline | R-… | SPEC-002 |
| SPEC-004 | feature | List <entities>: direct read, record, endpoint and tests | R-… | SPEC-002 |

<Example only: choose requested behaviours and actual dependencies. Include UI
inside a feature when its acceptance needs it. A separate channel base may need
its own channel-structure spec. Do not split specs by implementation layer.>
## 10. Open questions
## 11. Approval
- [ ] every in-scope must-have owned by one context and covered by at least one planned spec
- [ ] contracts between contexts defined at signature level
- [ ] approved by <owner> on YYYY-MM-DD
