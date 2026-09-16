# State

| Field | Value |
| --- | --- |
| Last updated | 2026-09-16 |
| Mode / SCM target | Compact; remote (https://github.com/andrespineli/url-shortner) |
| PRD / TDD | [PLAN.md#prd](PLAN.md#prd) Approved (usuário, 2026-09-16, escopo R-001..R-010); [PLAN.md#tdd](PLAN.md#tdd) Approved (usuário, 2026-09-16) |
| Current spec / status | Plano encerrado: SPEC-001..005 Done; SPEC-006 Closed sem implementação (2026-09-16) |
| Evidence | `deno task check` verde (18 arquivos, 51 cenários); smoke real: shorten 201, 4 cliques → 301, ftp 400, desconhecido 404, `/api/urls` e `/api/stats` coerentes, `/analytics` inspecionada no Chrome; commits 6693cc5..ce699d8 em `main`, push para https://github.com/andrespineli/url-shortner, CI verde (https://github.com/andrespineli/url-shortner/actions/runs/35119655066) |

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

- [x] CI / publicação remota — `.github/workflows/ci.yml`, CI verde em 2026-09-16
- [ ] R-010 página inicial com formulário (Could) — SPEC-006 fechada sem implementação a pedido do usuário; painel global de analytics também não entrou no escopo
