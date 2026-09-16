# SPEC-003 — Redirecionar e registrar clique

| Field | Value |
| --- | --- |
| Status | In review |
| Kind | feature |
| Directives | domain, persistence, command, inbound/wiring |
| Skill coverage | Complete list in section 3 |
| Requirements | R-004, R-005, R-006 |
| TDD | [../PLAN.md#tdd](../PLAN.md#tdd), context `links` |
| Depends on | SPEC-002 |
| Branch | local `main`; commits só com autorização |
| Created | 2026-09-16 |

## 1. Complete feature scope
O visitante acessa `GET /:code` e, para um link ativo, recebe
`301 Location: <original>` com `Cache-Control: no-store`. Nesse caso é gravado um
clique com referrer, user-agent, IP (primeiro valor de `X-Forwarded-For`, senão o
endereço da conexão) e instante. Casos de erro:
- código inexistente → `404 LINK_NOT_FOUND`;
- link expirado → `410 LINK_EXPIRED`;
- código com formato inválido → `404`.

Nenhum desses erros grava clique (A5). Reusa `Link`, `Links` e `SqliteLinks` da
SPEC-002. A aceitação passa por `app.request` com SQLite `:memory:`.

## 2. Out of scope for this spec
Agregação/estatísticas, detecção de bot, deduplicação de clique, geo-IP.

## 3. Skills and references for the complete slice

| Skill / rule | Exact file / reference | Why this slice needs it | Tasks |
| --- | --- | --- | --- |
| low-level-design | `~/.harness/skills/low-level-design/references/domain.md`, `command.md`, `persistence.md`, `hexagonal.md` | Regra de expiração, write path, porta `Clicks` | T1–T3 |
| lld-typescript | `~/.harness/skills/lld-typescript/references/domain.md`, `command.md`, `persistence.md`, `hexagonal.md`, `naming.md`, `rest-example.md` | Forma concreta | T1–T3 |
| kickstart-ts-deno | `.agents/skills/kickstart-ts-deno/SKILL.md` §2–4 | Rota, mapeamento de erro, testes | T3 |
| Hono conninfo | `@hono/hono/deno` → `getConnInfo` (parte do Hono já fixado; sem dependência nova) | IP da conexão | T3 |
| tests (gap) | kickstart §4 + `rest-example.md` tests | `Deno.test` + Gherkin | T1–T3 |

## 4. Tasks (typed by layer)
### T1 — Regra de visita e modelo `Click`
- Type: Domain
- Requirement IDs: R-005, R-006
- Depends on: —
- Files: `src/links/domain/models/{link,click}.ts`, `src/links/domain/errors.ts`, `src/links/domain/ports/outbound/clicks.ts`, `tests/links/domain/link.test.ts`
- Loads: low-level-design/domain, lld-typescript/domain, tests
- What: `link.visit(visitor, now)` lança `LinkExpired` quando `now >= expiresAt`; caso contrário devolve um `Click` (código, referrer|null, userAgent|null, ip|null, clickedAt). Porta `Clicks { record(click) }`.
- Verify: `deno test tests/links/domain/`
Done when
- [x] antes/no/depois do instante de expiração se comporta como o esperado

### T2 — `SqliteClicks` + `VisitLink`
- Type: Application
- Requirement IDs: R-004, R-005, R-006
- Depends on: T1
- Files: `src/links/outbound/persistence/sqlite-clicks.ts`, `src/links/application/commands/visit-link.ts`, `src/links/application/handlers/visit-link-handler.ts`, `tests/links/outbound/sqlite-clicks.test.ts`, `tests/links/application/visit-link-handler.test.ts`
- Loads: low-level-design/persistence, lld-typescript/persistence, low-level-design/command, lld-typescript/command, tests
- What: o handler busca por código (código inválido ou ausente → `LinkNotFound`), chama `visit`, grava o clique e devolve `{ originalUrl }`.
- Verify: `deno test tests/links/`
Done when
- [x] clique persistido com os 4 campos; nada gravado em not found ou expirado

### T3 — `GET /:code` e wiring
- Type: Inbound
- Requirement IDs: R-004, R-005, R-006
- Depends on: T2
- Files: `src/links/inbound/http/redirect-routes.ts`, `src/dependencies.ts`, `src/app.ts`, `tests/http/redirect.test.ts`
- Loads: low-level-design/hexagonal, lld-typescript/hexagonal, kickstart-ts-deno, tests
- What: a rota é montada por último, para não capturar `/api` e `/analytics`. Extrai `Referer`, `User-Agent` e o IP; `LinkNotFound` vira 404 e `LinkExpired` vira 410.
- Verify: `deno test tests/http/redirect.test.ts`
Done when
- [x] 301 + Location + no-store; 3 acessos geram 3 cliques no banco
- [x] 404 e 410 no envelope, sem clique gravado

## 5. Tests that prove the requirements
| Requirement | Test | Kind |
| --- | --- | --- |
| R-004 | 301 com Location e no-store | integration |
| R-005 | inexistente 404; expirado 410 (relógio injetado); sem clique | unit + integration |
| R-006 | referrer/UA/IP/timestamp persistidos | integration |

## 6. Acceptance (what the reviewer runs)
- [x] `deno task check` verde
- [x] `curl -i localhost:8000/<code>` devolve 301 com `Location` correto

## 7. Decisions taken during this spec
| # | Decision | Why | Rejected |
| --- | --- | --- | --- |
| 1 | 301 + `Cache-Control: no-store` | o enunciado pede 301 e o tracking precisa ver cliques repetidos | 302 (fere o contrato sugerido); 301 puro (o browser cacheia e o clique se perde) |
| 2 | Gravação de clique síncrona | simples e consistente no escopo local | fila/assíncrona (vale com volume alto) |

## 8. Review
- [ ] diff revisado pelo usuário
- Commit: pendente (autorização do usuário)
