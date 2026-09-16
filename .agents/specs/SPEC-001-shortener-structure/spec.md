# SPEC-001: URL shortener structure

| Field | Value |
| --- | --- |
| Status | Done |
| Kind | domain-structure |
| TDD | [../PLAN.md#tdd](../PLAN.md#tdd) |
| Requirements | Baseline (roda com um comando, testes com um comando, README) |
| Branch | local `main`; commits só com autorização do usuário |
| Created | 2026-09-16 |

## 1. Goal and baseline choices

Base HTTP rodando com `/health`, conexão SQLite com schema aplicado, gate verde e
README. Nenhum comportamento de produto.

- Stack / kickstart: `kickstart-ts-deno`: Deno 2.9.6, `@hono/hono` ^4.13, `@zod/zod` ^4.6, `@std/assert` ^1.0 (sem `@std/testing`: testes em `Deno.test` nativo). Os arquivos são criados à mão porque o `scaffold.sh` exige diretório vazio (ver D-2).
- LLD: `lld-typescript` (hexagonal + CQS), contexto `src/links/`, `src/shared/`, alias `@/` → `src/`.
- Infra necessária: SQLite via `node:sqlite`, arquivo `data/shortener.db` (env `DATABASE_PATH`) e `:memory:` nos testes. Tabelas `links(code PK, original_url, created_at, expires_at)` e `clicks(id, code FK, referrer, user_agent, ip, clicked_at)` + índice `(code, clicked_at)`.
- Config: `PORT` (8000), `BASE_URL` (`http://localhost:8000`), `DATABASE_PATH`.
- SCM: remoto (https://github.com/andrespineli/url-shortner); CI GitHub Actions rodando `deno task check`.

## 2. Skills and references for the entire baseline

| Skill / rule | Exact installed file / reference | Purpose | Tasks |
| --- | --- | --- | --- |
| custom-spec-kit | `.agents/skills/custom-spec-kit/SKILL.md`, `references/spec-categories.md` | Gates, directive Structure | T1, T2 |
| dev-workflow | `.agents/skills/dev-workflow/SKILL.md` | Revisão do diff antes do commit | T2 |
| kickstart-ts-deno | `.agents/skills/kickstart-ts-deno/SKILL.md`, `references/decisions.md`, `scripts/scaffold.sh` (fonte do conteúdo dos arquivos) | Toolchain, app/dependencies, envelope de erro, validação, gate, README | T1, T2 |
| low-level-design | `~/.harness/skills/low-level-design/references/hexagonal.md`, `naming.md`, `persistence.md` | Raiz de composição, layout, persistência atrás de porta | T1 |
| lld-typescript | `~/.harness/skills/lld-typescript/references/hexagonal.md`, `naming.md`, `persistence.md` | Casing, `dependencies.ts`, forma do adapter | T1 |
| tests (gap) | `lld-typescript/tests` **não existe**; usa `kickstart-ts-deno/SKILL.md` §4 + testes de `rest-example.md` | `Deno.test` + `t.step` documentados em Gherkin (Feature/Scenario/Given/When/Then) via `app.request` | T1, T2 |
| project rules | nenhuma selecionada em `AGENTS.md` | — | — |

## 3. Tasks

### T1: Baseline Deno/Hono + SQLite
- Type: Shared
- Requirement IDs: Baseline
- Depends on: —
- Files: `deno.json`, `main.ts`, `src/app.ts`, `src/config.ts`, `src/dependencies.ts`, `src/shared/http/errors.ts`, `src/shared/http/validate.ts`, `src/shared/sqlite/database.ts`, `tests/http/health.test.ts`, `tests/shared/sqlite/database.test.ts`, `.gitignore`
- Loads: kickstart-ts-deno, low-level-design/hexagonal, lld-typescript/hexagonal, lld-typescript/naming, lld-typescript/persistence, tests (kickstart §4)
- What: `createApp(deps)` com `/health` e error handler do envelope. `buildDependencies(config)` abre o banco e aplica o schema idempotente (`CREATE TABLE IF NOT EXISTS`). `main.ts` é o único ponto que chama `Deno.serve`. Tasks `dev`, `start`, `test`, `check`.
- Verify: `deno test tests/` ; `curl localhost:8000/health`
Done when
- [x] `GET /health` → 200 `{ status: "ok" }` via `app.request`
- [x] abrir o banco duas vezes não falha, e as tabelas existem
- [x] rota desconhecida → 404 no envelope

### T2: Gate e documentação
- Type: Docs Sync
- Requirement IDs: Baseline
- Depends on: T1
- Files: `README.md`, `requests.http`, `.agents/specs/README.md`, `.agents/specs/STATE.md`
- Loads: kickstart-ts-deno (§5, decisions.md), dev-workflow
- What: README com setup, `deno task dev`, `deno task test`, `deno task check` e a justificativa da stack/persistência. Sincroniza índice e state.
- Verify: `deno task check`
Done when
- [x] gate verde localmente; CI verde no GitHub Actions

## 4. Acceptance

- [x] `deno task dev` sobe e `/health` responde 200 com SQLite em arquivo
- [x] `deno task check` verde
- [x] diff apresentado para revisão antes de qualquer commit

## 5. Decisions and review

| Decision | Reason | Rejected alternative |
| --- | --- | --- |
| D-1 `node:sqlite` embutido | zero deps, SQL real, `:memory:` nos testes | `jsr:@db/sqlite` (FFI + download), memória, Postgres |
| D-2 arquivos criados à mão | `scaffold.sh` exige diretório vazio e o repo já tem `.agents/` | apagar arquivos para rodar o script |
| D-3 schema idempotente no boot | um comando para rodar; sem ferramenta de migração | migrator dedicado (exagero para 2 tabelas) |

- Planning approval: usuário, 2026-09-16, bundle SPEC-001..005 com ajustes (testes Deno.test + Gherkin; sem eventos/base Aggregate; IP apenas registrado)
- Diff approval: usuário, 2026-09-16
- Commit: `6693cc5` em `main`, push para https://github.com/andrespineli/url-shortner; CI verde (https://github.com/andrespineli/url-shortner/actions/runs/35119655066)
