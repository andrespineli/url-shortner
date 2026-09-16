# URL Shortener — compact plan

| Field | Value |
| --- | --- |
| Mode / SCM target | Compact; entrevista ao vivo de 1h; remote (https://github.com/andrespineli/url-shortner) |
| PRD status | Approved |
| TDD status | Approved |
| Owner / updated | andrespineli; 2026-09-16 |

## PRD

**Ator:** quem cria o link (criador) e quem clica nele (visitante).
**As-is:** não existe serviço; URLs longas são difíceis de compartilhar e não há
visibilidade de quem acessou. **To-be:** o criador encurta uma URL, compartilha o
código curto e acompanha os acessos numa página de analytics que pode repassar a
outras pessoas. **Sucesso observável:** no demo, criar um link, clicar nele N vezes
e ver N cliques, o dia e os referrers na página de analytics.

| ID | Requisito testável / cenário | Priority |
| --- | --- | --- |
| R-001 | Criador envia uma URL `http`/`https` → recebe código curto de 7 caracteres alfanuméricos, URL curta, URL original, data de criação e expiração. | Must |
| R-002 | URL ausente, malformada ou com outro esquema (`ftp:`, `javascript:`…) é rejeitada como entrada inválida; nada é criado. | Must |
| R-003 | Expiração opcional; se informada, precisa ser uma data válida no futuro, senão é rejeitada como inválida. | Must |
| R-004 | Visitante acessa um código ativo → é redirecionado permanentemente para a URL original. | Must |
| R-005 | Código inexistente → "não encontrado"; código expirado → "expirado" (distinto de não encontrado); nenhum dos dois conta clique. | Must |
| R-006 | Cada redirecionamento bem-sucedido registra um clique com referrer, user-agent, IP e instante. | Must |
| R-007 | Qualquer um lista os links criados, do mais recente para o mais antigo, cada um com seu total de cliques. | Must |
| R-008 | Estatísticas de um código: total de cliques, cliques por dia dos últimos 30 dias (dias sem clique aparecem com 0) e top referrers; código inexistente → não encontrado. | Must |
| R-009 | Página visual acessível no browser por um link compartilhável, com total, cliques por dia e top referrers; código inexistente mostra uma página de não encontrado. | Must |
| R-010 | Página inicial com formulário para encurtar e lista de links com atalho para o analytics. | Could |

- **Não-objetivos:** autenticação/posse de links (o analytics é público por
  código), edição/remoção de links, código customizado (alias), deduplicação de
  URL, paginação da listagem, geolocalização por IP, detecção de bots, rate limiting.
- **Restrições:** 1h ao vivo; roda com um comando; testes com um comando; README
  com setup e justificativa da stack; commits só com autorização do usuário.
- **Termos confirmados (do enunciado):** *código curto*: identificador
  alfanumérico de ~7 caracteres; *clique*: um redirecionamento bem-sucedido;
  *expirado*: instante atual ≥ `expiresAt`.
- **Suposições (aprovadas com o PRD em 2026-09-16):**
  - A1: cada chamada de encurtar gera um código novo, mesmo para URL repetida, para cada criador ter seu próprio analytics.
  - A2: "dia" é o dia em UTC; a janela de 30 dias inclui hoje.
  - A3: top referrers mostra no máximo 10 entradas; referrer ausente aparece como `direct`.
  - A4: a página de analytics não mostra IP nem user-agent crus (privacidade de quem clica), só os agregados.
  - A5: acesso a link expirado não conta como clique.
- **R-010:** não entregue. A SPEC-006 foi fechada sem implementação em
  2026-09-16, a pedido do usuário.

## TDD

**Contexto único `links`**, dono de R-001…R-010: agregado `Link` (VOs
`ShortCode`, `TargetUrl`, `Expiration`; invariante `visit(now)` → `LinkExpired`) e
o registro `Click`, gravado pelo mesmo contexto. Um único deployable HTTP.
**Baseline:** `kickstart-ts-deno` (Deno 2.9, Hono 4, zod 4, `@std/assert`/`@std/testing`)
+ `lld-typescript` (hexagonal + DDD + CQS, raiz de composição em `dependencies.ts`).

**Por que essa stack:** TypeScript tem tipagem forte no domínio. O Deno já traz
fmt/lint/check/test, então não há 5 ferramentas pra alinhar. O Hono responde
`app.request()`, o que dá testes de integração sem abrir porta. O zod valida na
borda e o schema vira o contrato.

**Persistência: SQLite via `node:sqlite`, que já vem no Deno.** Zero
dependências. Arquivo `data/shortener.db` sobrevive a restart durante o demo. As
agregações (`GROUP BY` dia/referrer) ficam em SQL real, e os testes usam
`:memory:`, que é storage real e descartável. *Rejeitados:* memória (perde dados e
simula agregação), Postgres (docker e setup gastam o tempo da hora). *Mudo de
ideia se:* houver múltiplas instâncias ou volume alto de cliques → Postgres, e
gravação de clique assíncrona via fila.

**Componentes:**
- Commands: `CreateLink` (R-001..003) e `VisitLink` (R-004..006: carrega o `Link`,
  valida a expiração, grava o `Click` e devolve o destino).
- Queries: `ListLinks` (R-007), `LinkStats` (R-008).
- Portas: `Links` (`save`, `byCode`, `exists`), `Clicks` (`record`),
  `ShortCodeGenerator`, `Clock`.
- Adapters: `SqliteLinks`, `SqliteClicks`, gerador base62 com
  `crypto.getRandomValues` (tenta de novo se colidir).

**Contratos publicados:**
- `POST /api/shorten` `{ url, expiresAt? }` → `201 { shortCode, shortUrl, originalUrl, createdAt, expiresAt|null }`; `400` com envelope `{ error: { code, message, details? } }`.
- `GET /:code` (`[A-Za-z0-9]{7}`) → `301 Location` + `Cache-Control: no-store`; `404 LINK_NOT_FOUND`; `410 LINK_EXPIRED`.
- `GET /api/urls` → `200 [{ shortCode, shortUrl, originalUrl, createdAt, expiresAt, clicks }]`, do mais recente para o mais antigo.
- `GET /api/stats/:code` → `200 { shortCode, totalClicks, clicksByDay: [{ date: "YYYY-MM-DD", clicks }] (30 itens), topReferrers: [{ referrer, clicks }] }`; `404`.
- `GET /analytics/:code` → HTML; `GET /health` → `200 { status: "ok" }`.

**Decisões transversais:**
- **301 + `no-store`:** o enunciado pede 301, mas o browser guarda 301 em cache
  e cliques repetidos deixariam de passar pelo servidor. O `no-store` evita isso
  e mantém o tracking. Alternativa: 302. Fica registrado.
- **IP:** primeiro valor de `X-Forwarded-For`, senão o endereço da conexão.
- **`BASE_URL`** vem de env, com padrão `http://localhost:8000`.
- **Datas:** ISO-8601 em UTC.

**Canal de UI:** HTML renderizado no servidor pelo Hono (`hono/html`), com
gráfico de barras em SVG/CSS inline. Sem React, sem build, sem dependência nova.
*Lacuna declarada:* o `lld-typescript` não tem as referências `ui` nem `tests`
que o spec-kit cita. A página fica como adapter inbound fino que consome a query
`LinkStats`. Testes em `Deno.test` nativo, documentados em Gherkin.

**Riscos:**
- `node:sqlite` ainda é recente no Deno. Mitigação: validado localmente no Deno
  2.9.6, e o fallback é `jsr:@db/sqlite` atrás da mesma porta.
- A hora é curta. Mitigação: ordem por valor para o demo, com o R-010 por último.

**Testes / gate:** unitários puros para os VOs e para a expiração; handlers com
dublês de porta; integração via `app.request` com SQLite `:memory:` cobrindo cada
endpoint (sucesso, validação, 404/410). O gate é `deno task check`
(fmt → lint → type check → test). A aplicação sobe com `deno task dev`.

| Spec | Kind | Item | Requirements | Depends on |
| --- | --- | --- | --- | --- |
| SPEC-001 | domain-structure | Baseline Deno/Hono, conexão SQLite + schema, `/health`, gate, README | Baseline | — |
| SPEC-002 | feature | Encurtar link (domínio, `CreateLink`, `SqliteLinks`, `POST /api/shorten`) | R-001, R-002, R-003 | SPEC-001 |
| SPEC-003 | feature | Redirecionar + registrar clique (`VisitLink`, `SqliteClicks`, `GET /:code`) | R-004, R-005, R-006 | SPEC-002 |
| SPEC-004 | feature | Estatísticas + página de analytics (`LinkStats`, `/api/stats/:code`, `/analytics/:code`) | R-008, R-009 | SPEC-003 |
| SPEC-005 | feature | Listar links (`ListLinks`, `GET /api/urls`) | R-007 | SPEC-003 |
| SPEC-006 | feature | Página inicial com formulário e lista — **fechada sem implementação** | R-010 | SPEC-004, SPEC-005 |

- **CI:** GitHub Actions roda `deno task check`, adicionado antes da publicação
  remota. SPEC-006 (Could) foi fechada sem implementação.

## Approval

- PRD: aprovado pelo usuário em 2026-09-16 (R-001..R-010, suposições A1–A5)
- TDD: aprovado pelo usuário em 2026-09-16 (baseline, contratos, plano SPEC-001..006)
- Approval scope: planejamento aprovado; bundle SPEC-001…SPEC-005 redigido e aguardando aprovação (SPEC-006 opcional, não redigida)
- Implementation authorization: usuário, 2026-09-16 — bundle SPEC-001..005 (com ajustes AD-005)
- Time allocation / final review: reservar os últimos ~10 min para gate, demo e revisão do diff
- Commit ownership: usuário autorizou em 2026-09-16 criar o repo público, commitar e fazer push (um commit por spec, direto na `main`)
