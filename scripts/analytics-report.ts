#!/usr/bin/env npx tsx
/**
 * GA4 + Search Console の定型分析レポートを一括実行する。
 * サイクルの計画・振り返りで毎回必要になる主要指標を、1コマンドでまとめて出力する。
 *
 * Usage:
 *   npx tsx scripts/analytics-report.ts            # 過去28日
 *   npx tsx scripts/analytics-report.ts --days 56  # 期間指定
 *
 * 前提: GOOGLE_APPLICATION_CREDENTIALS で yolo-web-gcp に認証済みであること。
 * 個別の深掘り分析は .claude/skills/analyze-bigquery/ のショートカット群を使う。
 *
 * 注意 (AP-P26): page_view の生カウントにはボット・プリフェッチ等が混ざる。
 * 人間の行動として解釈するときは engaged 列 (user_engagement を伴うセッション由来) を基準にすること。
 */
import { BigQuery } from "@google-cloud/bigquery";

const GA4_DATASET = "analytics_524708437";
const SC_DATASET = "searchconsole";

function parseArgs(): { days: number } {
  const args = process.argv.slice(2);
  let days = 28;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--days" && args[i + 1]) {
      days = Number(args[i + 1]);
      i++;
    }
  }
  if (!Number.isInteger(days) || days < 1) {
    console.error("Usage: npx tsx scripts/analytics-report.ts [--days N]");
    process.exit(1);
  }
  return { days };
}

function fmtDate(d: Date, sep: string): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return [y, m, day].join(sep);
}

type Row = Record<string, unknown>;

function printTable(rows: Row[]) {
  if (rows.length === 0) {
    console.log("  (データなし)");
    return;
  }
  const keys = Object.keys(rows[0]);
  const widths = keys.map((k) =>
    Math.max(k.length, ...rows.map((r) => String(r[k] ?? "").length)),
  );
  const line = (values: string[]) =>
    "  " + values.map((v, i) => v.padEnd(widths[i])).join("  ");
  console.log(line(keys));
  for (const r of rows) {
    console.log(line(keys.map((k) => String(r[k] ?? ""))));
  }
}

async function main() {
  const { days } = parseArgs();
  const to = new Date();
  const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);
  const gaFrom = fmtDate(from, "");
  const gaTo = fmtDate(to, "");
  const scFrom = fmtDate(from, "-");
  const scTo = fmtDate(to, "-");

  const bq = new BigQuery();
  const run = async (query: string): Promise<Row[]> => {
    const [rows] = await bq.query({ query });
    return rows as Row[];
  };

  console.log(`# yolos.net 定型分析レポート (${scFrom} 〜 ${scTo})`);
  console.log(
    `生成: ${new Date().toISOString()} / scripts/analytics-report.ts`,
  );

  console.log("\n## 週別PV (GA4)");
  printTable(
    await run(`
      SELECT
        FORMAT_DATE('%Y-%m-%d', DATE_TRUNC(PARSE_DATE('%Y%m%d', event_date), WEEK(MONDAY))) AS week_start,
        COUNTIF(event_name = 'page_view') AS pageviews,
        COUNT(DISTINCT IF(event_name = 'page_view', user_pseudo_id, NULL)) AS users
      FROM \`${GA4_DATASET}.events_*\`
      WHERE _TABLE_SUFFIX BETWEEN '${gaFrom}' AND '${gaTo}'
      GROUP BY week_start ORDER BY week_start
    `),
  );

  console.log("\n## 日別PV 直近14日 (GA4)");
  printTable(
    await run(`
      SELECT event_date AS date, COUNTIF(event_name = 'page_view') AS pageviews
      FROM \`${GA4_DATASET}.events_*\`
      WHERE _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE('Asia/Tokyo'), INTERVAL 14 DAY)) AND '${gaTo}'
        AND event_name = 'page_view'
      GROUP BY date ORDER BY date
    `),
  );

  console.log(
    "\n## 上位ページ PV Top20 (GA4 / engaged=人間の操作を伴うセッションのPV)",
  );
  printTable(
    await run(`
      WITH pv AS (
        SELECT
          REGEXP_REPLACE(REGEXP_REPLACE(
            (SELECT ep.value.string_value FROM UNNEST(event_params) ep WHERE ep.key = 'page_location'),
            r'https?://[^/]+', ''), r'[?#].*$', '') AS page_path,
          (SELECT ep.value.string_value FROM UNNEST(event_params) ep WHERE ep.key = 'session_engaged') AS engaged
        FROM \`${GA4_DATASET}.events_*\`
        WHERE _TABLE_SUFFIX BETWEEN '${gaFrom}' AND '${gaTo}'
          AND event_name = 'page_view'
      )
      SELECT page_path, COUNT(*) AS pageviews, COUNTIF(engaged = '1') AS engaged_pv
      FROM pv GROUP BY page_path ORDER BY pageviews DESC LIMIT 20
    `),
  );

  console.log("\n## チャネル別セッション (GA4)");
  printTable(
    await run(`
      SELECT
        IFNULL(session_traffic_source_last_click.cross_channel_campaign.default_channel_group, '(not set)') AS channel_group,
        COUNT(DISTINCT CONCAT(user_pseudo_id, '.', (SELECT ep.value.int_value FROM UNNEST(event_params) ep WHERE ep.key = 'ga_session_id'))) AS sessions,
        COUNTIF(event_name = 'page_view') AS pageviews
      FROM \`${GA4_DATASET}.events_*\`
      WHERE _TABLE_SUFFIX BETWEEN '${gaFrom}' AND '${gaTo}'
      GROUP BY channel_group ORDER BY sessions DESC
    `),
  );

  console.log("\n## 週別 検索パフォーマンス (Search Console)");
  printTable(
    await run(`
      SELECT
        FORMAT_DATE('%Y-%m-%d', DATE_TRUNC(data_date, WEEK(MONDAY))) AS week_start,
        SUM(clicks) AS clicks, SUM(impressions) AS impressions,
        ROUND(SAFE_DIVIDE(SUM(clicks), SUM(impressions)) * 100, 2) AS ctr,
        ROUND(SAFE_DIVIDE(SUM(sum_position), SUM(impressions)), 1) AS avg_position
      FROM \`${SC_DATASET}.searchdata_url_impression\`
      WHERE data_date BETWEEN '${scFrom}' AND '${scTo}'
      GROUP BY week_start ORDER BY week_start
    `),
  );

  console.log("\n## 検索クエリ Top20 (Search Console / クリック順)");
  printTable(
    await run(`
      SELECT query, SUM(clicks) AS clicks, SUM(impressions) AS impressions,
        ROUND(SAFE_DIVIDE(SUM(clicks), SUM(impressions)) * 100, 1) AS ctr,
        ROUND(SAFE_DIVIDE(SUM(sum_position), SUM(impressions)), 1) AS avg_position
      FROM \`${SC_DATASET}.searchdata_url_impression\`
      WHERE data_date BETWEEN '${scFrom}' AND '${scTo}' AND NOT is_anonymized_query
      GROUP BY query ORDER BY clicks DESC, impressions DESC LIMIT 20
    `),
  );

  console.log("\n## 検索流入ページ Top15 (Search Console / クリック順)");
  printTable(
    await run(`
      SELECT REGEXP_REPLACE(url, r'https?://[^/]+', '') AS page_path,
        SUM(clicks) AS clicks, SUM(impressions) AS impressions,
        ROUND(SAFE_DIVIDE(SUM(clicks), SUM(impressions)) * 100, 1) AS ctr
      FROM \`${SC_DATASET}.searchdata_url_impression\`
      WHERE data_date BETWEEN '${scFrom}' AND '${scTo}'
      GROUP BY page_path ORDER BY clicks DESC, impressions DESC LIMIT 15
    `),
  );

  console.log(
    "\n(注: PV生カウントにはボット・プリフェッチが混ざりうる。人間の需要として解釈するときは engaged_pv とSearch Consoleのクリックを基準にすること)",
  );
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
