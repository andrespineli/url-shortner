# SPEC-002 — Encurtar link

| Field | Value |
| --- | --- |
| Status | Done |
| Kind | feature |
| Directives | domain, persistence, command, inbound/wiring |
| Skill coverage | Complete list in section 3 |
| Requirements | R-001, R-002, R-003 |
| TDD | [../PLAN.md#tdd](../PLAN.md#tdd), context `links` |
| Depends on | SPEC-001 |
| Branch | local `main`; commits só com autorização |
| Created | 2026-09-16 |

## 1. Complete feature scope
O criador faz `POST /api/shorten` com `{ url, expiresAt? }` e recebe `201` com
`{ shortCode, shortUrl, originalUrl, createdAt, expiresAt }`, e o link fica
persistido no SQLite. Casos de erro, todos com status `400` no envelope e sem
nada persistido:
- corpo não-JSON ou `url` ausente;
- URL malformada ou com esquema diferente de http/https;
- `expiresAt` inválido ou no passado.

A aceitação passa pela app montada (`app.request`) com SQLite `:memory:`.

## 2. Out of scope for this spec
Redirect, clique, listagem, stats, alias customizado, deduplicação (A1).

## 3. Skills and references for the complete slice

| Skill / rule | Exact file / reference | Why this slice needs it | Tasks |
| --- | --- | --- | --- |
| low-level-design | `~/.harness/skills/low-level-design/references/domain.md`, `command.md`, `persistence.md`, `hexagonal.md`, `naming.md` | Contratos de cada camada | T1–T4 |
| lld-typescript | `~/.harness/skills/lld-typescript/references/domain.md`, `command.md`, `persistence.md`, `hexagonal.md`, `naming.md`, `rest-example.md` | Forma concreta (factory estática, handler, adapter, rotas) | T1–T4 |
| kickstart-ts-deno | `.agents/skills/kickstart-ts-deno/SKILL.md` §2–4 | `parseBody`, `AppError`, montagem de rota, testes | T4 |
| tests (gap) | kickstart §4 + `rest-example.md` tests | `Deno.test` + `t.step` documentados em Gherkin (Feature/Scenario/Given/When/Then) | T1–T4 |
| custom-spec-kit | `.agents/skills/custom-spec-kit/references/spec-categories.md` | Provas exigidas por diretiva | todas |

Cobertura: domínio, porta/adapter, comando, rota HTTP e wiring estão cobertos. A
referência de tests é uma lacuna declarada, resolvida pelo kickstart §4.

## 4. Tasks (typed by layer)
### T1 — Modelo `Link` e value objects
- Type: Domain
- Requirement IDs: R-001, R-002, R-003
- Depends on: —
- Files: `src/links/domain/models/{link,short-code,target-url,expiration}.ts`, `src/links/domain/errors.ts`, `tests/links/domain/*.test.ts`
- Loads: low-level-design/domain, lld-typescript/domain, lld-typescript/naming, tests
- What:
  - VOs:
    - `ShortCode`: `^[A-Za-z0-9]{7}$`.
    - `TargetUrl`: `URL` parseável com protocolo `http:`/`https:`.
    - `Expiration`: data válida, posterior a `now` na criação.
  - Agregado: `Link.create(code, url, expiresAt|null, now)` e `Link.rehydrate(props)`, com `isExpiredAt(now)` e `visit(now)` (este último usado na SPEC-003).
  - Erros tipados: `InvalidShortCode`, `InvalidTargetUrl`, `InvalidExpiration`. Sem imports de HTTP.
- Verify: `deno test tests/links/domain/`
Done when
- [x] `ftp:`, `javascript:` e texto solto são rejeitados; `http`/`https` aceitos
- [x] expiração no passado ou inválida é rejeitada; `null` é aceito

### T2 — Porta `Links`, gerador e `SqliteLinks`
- Type: Persistence
- Requirement IDs: R-001
- Depends on: T1
- Files: `src/links/domain/ports/outbound/{links,short-code-generator}.ts`, `src/links/outbound/persistence/sqlite-links.ts`, `src/links/outbound/random-short-code-generator.ts`, `tests/links/outbound/*.test.ts`
- Loads: low-level-design/persistence, lld-typescript/persistence, lld-typescript/hexagonal, tests
- What: `Links { save, byCode, exists }`; o mapeamento `toRaw`/`fromRaw` fica no adapter. O gerador sorteia 7 caracteres base62 com `crypto.getRandomValues`, usando rejection sampling para não enviesar.
- Verify: `deno test tests/links/outbound/`
Done when
- [x] o link faz round-trip por código no SQLite `:memory:` (com e sem expiração)
- [x] o gerador sempre produz um `ShortCode` válido

### T3 — Comando `CreateLink`
- Type: Application
- Requirement IDs: R-001, R-003
- Depends on: T2
- Files: `src/links/application/commands/create-link.ts`, `src/links/application/handlers/create-link-handler.ts`, `tests/links/application/create-link-handler.test.ts`
- Loads: low-level-design/command, lld-typescript/command, tests
- What: o comando só carrega primitivos. O handler monta os VOs, gera o código, tenta de novo se `exists` (até 5 vezes, depois `ShortCodeExhausted`), salva e devolve um snapshot mínimo. O relógio é injetado.
- Verify: `deno test tests/links/application/`
Done when
- [x] uma colisão faz o handler gerar outro código (verificado com gerador dublê)

### T4 — `POST /api/shorten` e wiring
- Type: Inbound
- Requirement IDs: R-001, R-002, R-003
- Depends on: T3
- Files: `src/links/inbound/http/api-routes.ts`, `src/dependencies.ts`, `src/app.ts`, `tests/http/shorten.test.ts`, `requests.http`
- Loads: low-level-design/hexagonal, lld-typescript/hexagonal, lld-typescript/rest-example, kickstart-ts-deno, tests
- What: o zod valida só o formato (`url` string, `expiresAt` datetime ISO opcional). Os erros de domínio viram `400` com código específico (`INVALID_URL`, `INVALID_EXPIRATION`), e `shortUrl` = `BASE_URL/code`.
- Verify: `deno test tests/http/shorten.test.ts`
Done when
- [x] 201 com o contrato completo; 400 para cada caso de rejeição

## 5. Tests that prove the requirements
| Requirement | Test | Kind |
| --- | --- | --- |
| R-001 | shorten 201 + round-trip no SQLite | integration |
| R-002 | URL inválida / esquema proibido → 400 | unit + integration |
| R-003 | expiresAt passado/inválido → 400; válido ecoado | unit + integration |

## 6. Acceptance (what the reviewer runs)
- [x] `deno task check` verde
- [x] um `curl -XPOST localhost:8000/api/shorten` com a URL do Jusbrasil devolve um código de 7 caracteres

## 7. Decisions taken during this spec
| # | Decision | Why | Rejected |
| --- | --- | --- | --- |
| 1 | Erros de domínio tipados, mapeados só na camada HTTP | contrato LLD + kickstart §2 | `rest-example.md` importando `@/shared/http/errors` no domínio (conflita com o contrato) |
| 2 | 400 também para falha de schema (não 422) | enunciado pede 400 para URL inválida; um status só para entrada inválida | 422 padrão do kickstart |
| 3 | Sem classe base `Aggregate` nem eventos de domínio | confirmado pelo usuário em 2026-09-16 | building blocks especulativos |

## 8. Review
- [x] diff revisado e commit autorizado pelo usuário em 2026-09-16
- Commit: `ef584f4` em `main`, push para https://github.com/andrespineli/url-shortner; CI verde (https://github.com/andrespineli/url-shortner/actions/runs/35119655066)
