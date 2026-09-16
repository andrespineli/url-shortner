# Spec index

| Field | Value |
| --- | --- |
| Mode / SCM target | Compact; local |
| PRD | [PLAN.md#prd](PLAN.md#prd); Approved; 2026-09-16, R-001..R-010 |
| TDD | [PLAN.md#tdd](PLAN.md#tdd); Approved; 2026-09-16, plano SPEC-001..006 |
| State | [STATE.md](STATE.md) |
| Updated | 2026-09-16 |

## Plan and progress

| Spec | Kind | Item / actual link when created | Depends on | Status | Evidence |
| --- | --- | --- | --- | --- | --- |
| SPEC-001 | domain-structure | [Baseline Deno/Hono + SQLite, health, gate](SPEC-001-shortener-structure/spec.md) | — | In review | gate `deno task check` verde (18 arquivos, 51 cenários); smoke com servidor real |
| SPEC-002 | feature | [Shorten link (R-001..R-003)](SPEC-002-shorten-link/spec.md) | SPEC-001 | In review | gate `deno task check` verde (18 arquivos, 51 cenários); smoke com servidor real |
| SPEC-003 | feature | [Redirect + click tracking (R-004..R-006)](SPEC-003-redirect-and-track/spec.md) | SPEC-002 | In review | gate `deno task check` verde (18 arquivos, 51 cenários); smoke com servidor real |
| SPEC-004 | feature | [Stats API + analytics page (R-008, R-009)](SPEC-004-stats-and-analytics/spec.md) | SPEC-003 | In review | gate `deno task check` verde (18 arquivos, 51 cenários); smoke com servidor real |
| SPEC-005 | feature | [List links (R-007)](SPEC-005-list-links/spec.md) | SPEC-003 | In review | gate `deno task check` verde (18 arquivos, 51 cenários); smoke com servidor real |
| SPEC-006 | feature | Home page with form (R-010, Could) | SPEC-004, SPEC-005 | Planned | — |

Statuses: Planned, Draft, Approved, In progress, In review, Done.
