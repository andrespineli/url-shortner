# SPEC-005 — Listar links

| Field | Value |
| --- | --- |
| Status | In review |
| Kind | feature |
| Directives | query, inbound/wiring |
| Skill coverage | Complete list in section 3 |
| Requirements | R-007 |
| TDD | [../PLAN.md#tdd](../PLAN.md#tdd), context `links` |
| Depends on | SPEC-003 |
| Branch | local `main`; commits só com autorização |
| Created | 2026-09-16 |

## 1. Complete feature scope
Qualquer pessoa chama `GET /api/urls` e recebe `200` com um array de
`{ shortCode, shortUrl, originalUrl, createdAt, expiresAt, clicks }`, do mais
recente para o mais antigo. Lista vazia devolve `[]`. A query lê o SQLite direto
(`LEFT JOIN` + `COUNT`). A aceitação passa por `app.request`.

## 2. Out of scope for this spec
Paginação, filtros, busca, links por criador.

## 3. Skills and references for the complete slice

| Skill / rule | Exact file / reference | Why this slice needs it | Tasks |
| --- | --- | --- | --- |
| low-level-design | `~/.harness/skills/low-level-design/references/query.md`, `hexagonal.md` | Read path | T1, T2 |
| lld-typescript | `~/.harness/skills/lld-typescript/references/query.md`, `hexagonal.md`, `naming.md` | `Query` + `LinkRecord` | T1, T2 |
| kickstart-ts-deno | `.agents/skills/kickstart-ts-deno/SKILL.md` §2, §4 | Rota e testes | T2 |
| tests (gap) | kickstart §4 + `rest-example.md` tests | `Deno.test` + Gherkin | T1, T2 |

## 4. Tasks (typed by layer)
### T1 — Query `ListLinks`
- Type: Read
- Requirement IDs: R-007
- Depends on: —
- Files: `src/links/application/queries/list-links/query.ts`, `tests/links/application/list-links-query.test.ts`
- Loads: low-level-design/query, lld-typescript/query, tests
- What: `SELECT … LEFT JOIN clicks … GROUP BY code ORDER BY created_at DESC, rowid DESC` → `LinkRecord[]`.
- Verify: `deno test tests/links/application/list-links-query.test.ts`
Done when
- [x] ordem decrescente; links sem clique aparecem com 0; vazio → `[]`

### T2 — `GET /api/urls`
- Type: Inbound
- Requirement IDs: R-007
- Depends on: T1
- Files: `src/links/inbound/http/api-routes.ts`, `src/dependencies.ts`, `tests/http/list-links.test.ts`
- Loads: low-level-design/hexagonal, lld-typescript/hexagonal, kickstart-ts-deno, tests
- What: despacha a query e acrescenta `shortUrl` com `BASE_URL`.
- Verify: `deno test tests/http/list-links.test.ts`
Done when
- [x] dois links criados, um deles clicado 2×: a lista mostra o mais recente primeiro com as contagens corretas

## 5. Tests that prove the requirements
| Requirement | Test | Kind |
| --- | --- | --- |
| R-007 | ordem + contagem + vazio | integration |

## 6. Acceptance (what the reviewer runs)
- [x] `deno task check` verde
- [x] `curl localhost:8000/api/urls` lista os links do demo com cliques

## 7. Decisions taken during this spec
| # | Decision | Why | Rejected |
| --- | --- | --- | --- |
| 1 | Array puro como resposta, sem paginação | contrato do enunciado; paginação é não-objetivo | `{ items, cursor }` |

## 8. Review
- [ ] diff revisado pelo usuário
- Commit: pendente (autorização do usuário)
