# Spec index

| Field | Value |
| --- | --- |
| Mode / SCM target | Compact; remote ([andrespineli/url-shortner](https://github.com/andrespineli/url-shortner), push direto na `main` a pedido do usuário) |
| PRD | [PLAN.md#prd](PLAN.md#prd); Approved; 2026-09-16, R-001..R-010 |
| TDD | [PLAN.md#tdd](PLAN.md#tdd); Approved; 2026-09-16, plano SPEC-001..006 |
| State | [STATE.md](STATE.md) |
| Updated | 2026-09-16 |

## Plan and progress

| Spec | Kind | Item / actual link when created | Depends on | Status | Evidence |
| --- | --- | --- | --- | --- | --- |
| SPEC-001 | domain-structure | [Baseline Deno/Hono + SQLite, health, gate](SPEC-001-shortener-structure/spec.md) | — | Done | commit `6693cc5`, gate local verde, [CI verde](https://github.com/andrespineli/url-shortner/actions/runs/35119655066) |
| SPEC-002 | feature | [Shorten link (R-001..R-003)](SPEC-002-shorten-link/spec.md) | SPEC-001 | Done | commit `ef584f4`, gate local verde, [CI verde](https://github.com/andrespineli/url-shortner/actions/runs/35119655066) |
| SPEC-003 | feature | [Redirect + click tracking (R-004..R-006)](SPEC-003-redirect-and-track/spec.md) | SPEC-002 | Done | commit `31ab800`, gate local verde, [CI verde](https://github.com/andrespineli/url-shortner/actions/runs/35119655066) |
| SPEC-004 | feature | [Stats API + analytics page (R-008, R-009)](SPEC-004-stats-and-analytics/spec.md) | SPEC-003 | Done | commit `fb43a3d`, gate local verde, [CI verde](https://github.com/andrespineli/url-shortner/actions/runs/35119655066) |
| SPEC-005 | feature | [List links (R-007)](SPEC-005-list-links/spec.md) | SPEC-003 | Done | commit `ce699d8`, gate local verde, [CI verde](https://github.com/andrespineli/url-shortner/actions/runs/35119655066) |
| SPEC-006 | feature | Home page with form (R-010, Could) | SPEC-004, SPEC-005 | Closed (não implementada) | Encerrada pelo usuário em 2026-09-16; R-010 adiado, nunca redigida |

Statuses: Planned, Draft, Approved, In progress, In review, Done, Closed (encerrada sem implementação).

Plano encerrado em 2026-09-16: SPEC-001..005 entregues; SPEC-006 fechada sem implementação.
