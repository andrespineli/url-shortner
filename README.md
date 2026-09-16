# URL Shortener

Encurtador de URLs com tracking de cliques e página de analytics compartilhável.
TypeScript no Deno 2 + Hono, SQLite embutido. Planejamento spec-driven em
[`.agents/specs/`](.agents/specs/README.md) (PRD, TDD e specs SPEC-001..005).

## Setup e execução

Requisito: [Deno 2.9+](https://docs.deno.com/runtime/getting_started/installation/).
Não há `install` separado: as dependências são baixadas e cacheadas no primeiro comando.

```sh
deno task dev      # http://localhost:8000 (SQLite em data/shortener.db)
deno task test     # todos os testes
deno task check    # gate: fmt → lint → type check → testes
```

Variáveis opcionais: `PORT` (8000), `BASE_URL` (`http://localhost:$PORT`),
`DATABASE_PATH` (`data/shortener.db`).

## Demo

```sh
curl -s -XPOST localhost:8000/api/shorten -H 'content-type: application/json' \
  -d '{"url":"https://www.jusbrasil.com.br"}'
# → { "shortCode": "Ab3dE9z", "shortUrl": "http://localhost:8000/Ab3dE9z", ... }

curl -i localhost:8000/Ab3dE9z -H 'referer: https://google.com'   # 301
open http://localhost:8000/analytics/Ab3dE9z                      # página visual
```

Mais exemplos em [`requests.http`](requests.http).

## API

| Método e rota | Resposta |
| --- | --- |
| `POST /api/shorten` `{ url, expiresAt? }` | `201 { shortCode, shortUrl, originalUrl, createdAt, expiresAt }`; `400` URL não-http(s)/inválida ou expiração passada |
| `GET /:code` | `301` para a URL original (`Cache-Control: no-store`) e registra o clique; `404` inexistente; `410` expirado |
| `GET /api/urls` | links do mais recente ao mais antigo, com `clicks` |
| `GET /api/stats/:code` | `{ totalClicks, clicksByDay (30 dias UTC), topReferrers (top 10) }`; `404` |
| `GET /analytics/:code` | página HTML com total, gráfico diário e top referrers |
| `GET /health` | `{ status: "ok" }` |

Erros usam um envelope único: `{ "error": { "code", "message", "details?" } }`.

## Por que essa stack

- **Deno 2 + TypeScript**: tipagem forte e toolchain completa embutida
  (fmt, lint, type check, test). Evita alinhar cinco ferramentas numa hora.
- **Hono**: API web-standard pequena. `app.request()` permite testes de
  integração da app montada (roteamento → validação → handler → SQLite) sem abrir porta.
- **zod** na borda HTTP: o schema é o contrato de entrada.
- **SQLite via `node:sqlite`** (embutido no Deno): zero dependências, os dados
  sobrevivem a restart, e as agregações (`GROUP BY` por dia/referrer) são SQL real.
  Os testes usam `:memory:`, que é storage real e descartável. *Rejeitados:* memória
  (perde dados e simula agregação) e Postgres (docker/setup). *Trocaria* por
  Postgres com múltiplas instâncias ou volume alto de cliques, com a gravação de
  clique movida para uma fila.
- **Arquitetura hexagonal + CQS**, com contexto `src/links/`:
  - domínio puro: `Link` e os value objects;
  - comandos: `CreateLink`, `VisitLink`;
  - queries SQL diretas: `ListLinks`, `LinkStats`;
  - adapters SQLite atrás de portas;
  - composição única em `src/dependencies.ts`.
- **Página de analytics renderizada no servidor** (`hono/html` + SVG): sem build,
  sem JS, link compartilhável, conteúdo escapado.

## Decisões de produto

- **301 com `no-store`**: o browser não guarda o redirect em cache, então cliques repetidos continuam sendo contados.
- **Cliques contados**: só redirects bem-sucedidos. Um 404 ou 410 não conta.
- **Mesma URL encurtada duas vezes**: gera dois códigos, para cada criador ter seu próprio analytics.
- **Dias**: em UTC. O referrer ausente aparece como `direct`.
- **Privacidade na página**: mostra só agregados, sem IP nem user-agent crus.
- **Fora do escopo**: auth, edição/remoção, alias customizado, paginação, rate limiting.

## Testes

Testes em `Deno.test` nativo com `t.step`, documentados em Gherkin
(`Feature` / `Scenario` / `Given` / `When` / `Then`):

- `tests/links/domain`: regras puras (formato do código, esquemas de URL, expiração);
- `tests/links/application`: handlers com dublês e queries sobre SQLite semeado;
- `tests/links/outbound`: adapters SQLite reais e o gerador de códigos;
- `tests/http`: app montada ponta a ponta, com caminhos de sucesso e de erro.
