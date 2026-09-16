# SPEC-004 — Estatísticas e página de analytics

| Field | Value |
| --- | --- |
| Status | In review |
| Kind | feature |
| Directives | query, inbound/wiring, UI (HTML renderizado no servidor) |
| Skill coverage | Complete list in section 3 |
| Requirements | R-008, R-009 |
| TDD | [../PLAN.md#tdd](../PLAN.md#tdd), context `links` |
| Depends on | SPEC-003 |
| Branch | local `main`; commits só com autorização |
| Created | 2026-09-16 |

## 1. Complete feature scope
Dois pontos de entrada, ambos lendo os cliques gravados na SPEC-003 e ambos com
404 para código inexistente:
- **`GET /api/stats/:code`** devolve `{ shortCode, originalUrl, totalClicks, clicksByDay, topReferrers }`.
  - `clicksByDay`: 30 itens em UTC, terminando hoje, com zero nos dias sem clique (A2).
  - `topReferrers`: até 10, ordenados por contagem; o referrer nulo aparece como `direct` (A3).
- **`GET /analytics/:code`** renderiza HTML compartilhável com total, gráfico de barras dos 30 dias (SVG inline) e tabela de top referrers. Não mostra IP nem UA crus (A4). Para código inexistente, mostra uma página HTML de não encontrado.

A query lê o SQLite direto, sem agregado. A aceitação passa por `app.request` com
cliques semeados.

## 2. Out of scope for this spec
Filtro de período customizável, atualização em tempo real, breakdown por UA/país,
autenticação do analytics.

## 3. Skills and references for the complete slice

| Skill / rule | Exact file / reference | Why this slice needs it | Tasks |
| --- | --- | --- | --- |
| low-level-design | `~/.harness/skills/low-level-design/references/query.md`, `hexagonal.md` | Read path isolado do write side | T1, T2 |
| lld-typescript | `~/.harness/skills/lld-typescript/references/query.md`, `hexagonal.md`, `naming.md` | Classe `Query` + `…Record` | T1, T2 |
| kickstart-ts-deno | `.agents/skills/kickstart-ts-deno/SKILL.md` §2, §4 | Rota e testes | T2 |
| ui (gap) | `lld-typescript/ui` **não existe**; decisão D-1: `hono/html` (já no Hono, escapa interpolações), sem React | Página visual | T3 |
| dataviz skill | skill `dataviz` do Claude Code (paleta/marcas acessíveis) | Gráfico legível em claro/escuro | T3 |
| tests (gap) | kickstart §4 + `rest-example.md` tests | `Deno.test` + Gherkin | T1–T3 |

## 4. Tasks (typed by layer)
### T1 — Query `LinkStats`
- Type: Read
- Requirement IDs: R-008
- Depends on: —
- Files: `src/links/application/queries/link-stats/query.ts`, `tests/links/application/link-stats-query.test.ts`
- Loads: low-level-design/query, lld-typescript/query, tests
- What: `execute(code, now)` → `LinkStatsRecord | undefined`. Usa `COUNT` total, `GROUP BY substr(clicked_at,1,10)` restrito aos últimos 30 dias (zero-fill em TS) e `GROUP BY COALESCE(referrer,'direct') … LIMIT 10`. Não importa nada do write side.
- Verify: `deno test tests/links/application/link-stats-query.test.ts`
Done when
- [x] cliques semeados em dias distintos aparecem nos dias certos; clique de 31 dias atrás fica fora do gráfico e conta no total
- [x] link sem cliques → total 0, 30 zeros e referrers vazios

### T2 — `GET /api/stats/:code`
- Type: Inbound
- Requirement IDs: R-008
- Depends on: T1
- Files: `src/links/inbound/http/api-routes.ts`, `src/dependencies.ts`, `tests/http/stats.test.ts`
- Loads: low-level-design/hexagonal, lld-typescript/hexagonal, kickstart-ts-deno, tests
- What: despacha a query; `undefined` vira `404 LINK_NOT_FOUND`.
- Verify: `deno test tests/http/stats.test.ts`
Done when
- [x] criar → clicar 3× com referrers → stats reflete 3, o dia de hoje e os referrers

### T3 — Página `/analytics/:code`
- Type: UI
- Requirement IDs: R-009
- Depends on: T1
- Files: `src/links/inbound/http/analytics-page.ts`, `src/links/inbound/http/analytics-routes.ts`, `src/app.ts`, `tests/http/analytics-page.test.ts`
- Loads: ui decisão D-1, dataviz, lld-typescript/hexagonal, tests
- What: HTML autocontido (CSS inline, tokens claro/escuro, responsivo), barras em SVG com rótulos, tabela de referrers, link curto e URL original. Todo conteúdo dinâmico passa por escape.
- Verify: `deno test tests/http/analytics-page.test.ts` + abrir no browser
Done when
- [x] 200 `text/html` contendo o total e os referrers; 404 HTML para código inexistente
- [x] URL original com `<script>` aparece escapada

## 5. Tests that prove the requirements
| Requirement | Test | Kind |
| --- | --- | --- |
| R-008 | query com SQLite semeado; endpoint ponta a ponta | integration |
| R-009 | página renderiza total/referrers, escapa HTML, 404 | integration (HTTP) + verificação manual no browser |

## 6. Acceptance (what the reviewer runs)
- [x] `deno task check` verde
- [x] demo: criar link, clicar algumas vezes e abrir `/analytics/<code>` no browser

## 7. Decisions taken during this spec
| # | Decision | Why | Rejected |
| --- | --- | --- | --- |
| 1 | HTML server-side com `hono/html` + SVG | sem build/deps, link compartilhável, o tempo vai para o domínio | React SPA (build + referência `ui` inexistente), Chart.js via CDN (dependência externa em runtime) |
| 2 | Janela de 30 dias em UTC com zero-fill | gráfico contínuo e sem ambiguidade de fuso | fuso do navegador |

## 8. Review
- [ ] diff revisado pelo usuário
- Commit: pendente (autorização do usuário)
