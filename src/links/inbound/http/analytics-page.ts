import { html } from "@hono/hono/html";
import type { HtmlEscapedString } from "@hono/hono/utils/html";
import type { LinkStatsRecord } from "@/links/application/queries/link-stats/query.ts";

type Html = HtmlEscapedString | Promise<HtmlEscapedString>;

const CHART = { width: 720, height: 220, top: 24, bottom: 28, left: 8, right: 8, gap: 2 };

const STYLES = html`<style>
  :root {
    color-scheme: light dark;
    --page: #f9f9f7; --surface: #fcfcfb; --ink: #0b0b0b; --ink-2: #52514e;
    --muted: #898781; --grid: #e1e0d9; --axis: #c3c2b7; --series: #2a78d6;
    --ring: rgba(11, 11, 11, 0.10);
  }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) {
      --page: #0d0d0d; --surface: #1a1a19; --ink: #ffffff; --ink-2: #c3c2b7;
      --muted: #898781; --grid: #2c2c2a; --axis: #383835; --series: #3987e5;
      --ring: rgba(255, 255, 255, 0.10);
    }
  }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--page); color: var(--ink);
    font: 15px/1.5 system-ui, -apple-system, "Segoe UI", sans-serif; }
  main { max-width: 820px; margin: 0 auto; padding: 32px 16px 48px; }
  h1 { font-size: 22px; margin: 0 0 4px; }
  h2 { font-size: 15px; margin: 0 0 12px; }
  a { color: var(--series); }
  .sub { color: var(--ink-2); margin: 0 0 24px; overflow-wrap: anywhere; }
  .card { background: var(--surface); border: 1px solid var(--ring); border-radius: 12px;
    padding: 20px; margin-bottom: 16px; }
  .kpi { font-size: 44px; font-weight: 650; line-height: 1.1; font-variant-numeric: tabular-nums; }
  .label { color: var(--ink-2); font-size: 13px; }
  svg { display: block; width: 100%; height: auto; }
  .bar { fill: var(--series); }
  .hit:hover + .bar, .hit:focus + .bar { opacity: 0.75; }
  .hit { fill: transparent; }
  .grid { stroke: var(--grid); stroke-width: 1; }
  .axis { stroke: var(--axis); stroke-width: 1; }
  .tick, .value { font-size: 11px; fill: var(--muted); font-variant-numeric: tabular-nums; }
  .value { fill: var(--ink-2); font-weight: 600; }
  table { width: 100%; border-collapse: collapse; font-variant-numeric: tabular-nums; }
  th, td { text-align: left; padding: 8px 4px; border-bottom: 1px solid var(--grid); }
  th { color: var(--ink-2); font-weight: 500; font-size: 13px; }
  td.num, th.num { text-align: right; }
  td.ref { overflow-wrap: anywhere; }
  details { margin-top: 12px; }
  summary { cursor: pointer; color: var(--ink-2); font-size: 13px; }
  .empty { color: var(--muted); }
</style>`;

function layout(title: string, body: Html): Html {
  return html`
    <!doctype html>
    <html lang="pt-BR">
      <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${title}</title>
    ${STYLES}
      </head>
      <body>
        <main>${body}</main>
      </body>
    </html>
  `;
}

/** Rectangle with rounded top corners anchored on the baseline. */
function barPath(x: number, y: number, w: number, h: number): string {
  const r = Math.min(4, w / 2, h);
  return `M${x},${y + h}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${
    y + r
  }V${y + h}Z`;
}

const shortDate = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;

function dailyChart(days: LinkStatsRecord["clicksByDay"]): Html {
  const plotW = CHART.width - CHART.left - CHART.right;
  const plotH = CHART.height - CHART.top - CHART.bottom;
  const baseline = CHART.top + plotH;
  const slot = plotW / days.length;
  const barW = slot - CHART.gap;
  const max = Math.max(1, ...days.map((d) => d.clicks));
  const peak = days.reduce((best, d, i) => (d.clicks > (days[best]?.clicks ?? 0) ? i : best), 0);

  const bars = days.map((day, i) => {
    const x = CHART.left + i * slot + CHART.gap / 2;
    const h = (day.clicks / max) * plotH;
    const label = `${shortDate(day.date)}: ${day.clicks} clique${day.clicks === 1 ? "" : "s"}`;
    return html`<g>
      <rect class="hit" x="${
      x - CHART.gap / 2
    }" y="${CHART.top}" width="${slot}" height="${plotH}" tabindex="0"><title>${label}</title></rect>
      ${
      day.clicks > 0
        ? html`
          <path class="bar" d="${barPath(x, baseline - h, barW, h)}" />
        `
        : ""
    }
      ${
      i === peak && day.clicks > 0
        ? html`<text class="value" x="${x + barW / 2}" y="${
          baseline - h - 6
        }" text-anchor="middle">${day.clicks}</text>`
        : ""
    }
      ${
      i % 7 === 1 || i === days.length - 1
        ? html`<text class="tick" x="${x + barW / 2}" y="${baseline + 18}" text-anchor="middle">${
          shortDate(day.date)
        }</text>`
        : ""
    }
    </g>`;
  });

  return html`
    <svg viewBox="0 0 ${CHART.width} ${CHART.height}" role="img"
      aria-label="Cliques por dia nos últimos 30 dias">
        <line class="grid" x1="${CHART.left}" x2="${CHART.width - CHART.right}" y1="${CHART
          .top}" y2="${CHART.top}"/>
        <text class="tick" x="${CHART.left}" y="${CHART.top - 6}">${max}</text>
        ${bars}
        <line class="axis" x1="${CHART.left}" x2="${CHART.width -
          CHART.right}" y1="${baseline}" y2="${baseline}"/>
      </svg>
  `;
}

function referrersTable(stats: LinkStatsRecord): Html {
  if (stats.topReferrers.length === 0) {
    return html`<p class="empty">Nenhum clique registrado ainda.</p>`;
  }
  return html`
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Referrer</th>
          <th class="num">Cliques</th>
          <th class="num">%</th>
        </tr>
      </thead>
      <tbody>${stats.topReferrers.map((r, i) =>
        html`
          <tr>
            <td>${i + 1}</td>
            <td class="ref">${r.referrer}</td>
            <td class="num">${r.clicks}</td>
            <td class="num">${Math.round((r.clicks / stats.totalClicks) * 100)}%</td>
          </tr>
        `
      )}</tbody>
    </table>
  `;
}

export function analyticsPage(stats: LinkStatsRecord, shortUrl: string): Html {
  const windowClicks = stats.clicksByDay.reduce((sum, d) => sum + d.clicks, 0);
  return layout(
    `Analytics ${stats.shortCode}`,
    html`
      <h1>Analytics de <a href="${shortUrl}">${shortUrl}</a></h1>
      <p class="sub">→ <a href="${stats.originalUrl}" rel="noopener noreferrer">${stats
        .originalUrl}</a><br>
        Criado em ${stats.createdAt.slice(0, 10)}${stats.expiresAt
          ? html`
            · expira em ${stats.expiresAt.replace("T", " ").slice(0, 16)} UTC
          `
          : ""}</p>

      <section class="card">
        <div class="label">Total de cliques</div>
        <div class="kpi" data-testid="total-clicks">${stats.totalClicks}</div>
      </section>

      <section class="card">
        <h2>Cliques por dia <span class="label">· últimos 30 dias (UTC) · ${windowClicks} no período</span></h2>
        ${dailyChart(stats.clicksByDay)}
        <details>
          <summary>Ver tabela</summary>
          <table>
            <thead><tr><th>Dia</th><th class="num">Cliques</th></tr></thead>
            <tbody>${stats.clicksByDay.map((d) =>
              html`
                <tr>
                  <td>${d.date}</td>
                  <td class="num">${d.clicks}</td>
                </tr>
              `
            )}</tbody>
          </table>
        </details>
      </section>

      <section class="card">
        <h2>Top referrers</h2>
        ${referrersTable(stats)}
      </section>
    `,
  );
}

export function analyticsNotFoundPage(code: string): Html {
  return layout(
    "Link não encontrado",
    html`
      <section class="card">
        <h1>Link não encontrado</h1>
        <p class="sub">Não existe link curto com o código <strong>${code}</strong>.</p>
      </section>
    `,
  );
}
