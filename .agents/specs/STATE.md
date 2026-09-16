# State

| Field | Value |
| --- | --- |
| Last updated | 2026-09-16 |
| Mode / SCM target | Compact; local |
| PRD / TDD | [PLAN.md#prd](PLAN.md#prd) Approved (usuário, 2026-09-16, escopo R-001..R-010); [PLAN.md#tdd](PLAN.md#tdd) Approved (usuário, 2026-09-16) |
| Current spec / status | SPEC-001..005 In review (bundle aprovado pelo usuário em 2026-09-16) |
| Evidence | `deno task check` verde (18 arquivos, 51 cenários); smoke real: shorten 201, 4 cliques → 301, ftp 400, desconhecido 404, `/api/urls` e `/api/stats` coerentes, `/analytics` inspecionada no Chrome; nenhum commit |

## Recent decisions

- AD-001: SQLite via `node:sqlite` (zero deps, SQL real, `:memory:` nos testes); troca-se por Postgres com múltiplas instâncias.
- AD-002: `301` + `Cache-Control: no-store` para manter o tracking de cliques repetidos.
- AD-003: erros de domínio tipados, traduzidos só na camada HTTP; o `rest-example.md` do `lld-typescript` conflita com o contrato e não é seguido nesse ponto.
- AD-005: testes em `Deno.test` + `t.step` com nomes/comentários Gherkin; sem eventos de domínio nem base `Aggregate`; IP apenas registrado (pedido do usuário).
- AD-004: analytics em HTML server-side (`hono/html` + SVG), sem React/build.

## Lessons learned

- L-001: `deno fmt` reagrupa imports; edições por substituição de texto precisam considerar o formato pós-fmt (um import de `error-mapping.ts` precisou de correção).

## Active blockers

- Nenhum. Lacunas declaradas: as referências `lld-typescript/tests` e `lld-typescript/ui` não existem; o fallback está registrado nas specs.

## Deferred

- [ ] CI / publicação remota (alvo local) — PLAN.md
- [ ] SPEC-006 página inicial com formulário (R-010, Could) — ainda não redigida
