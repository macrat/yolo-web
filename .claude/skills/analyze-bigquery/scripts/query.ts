#!/usr/bin/env npx tsx
/**
 * BigQuery GA4 クエリ実行スクリプト
 * 引数で指定されたSQLクエリを実行し、結果をJSON形式で標準出力に出力する。
 *
 * Usage:
 *   npx tsx query.ts "SELECT event_name, COUNT(*) as cnt FROM \`analytics_524708437.events_*\` GROUP BY 1"
 *   npx tsx query.ts --file query.sql
 */
import { BigQuery } from "@google-cloud/bigquery";
import { readFileSync } from "fs";

const args = process.argv.slice(2);

let query: string;

if (args[0] === "--file" && args[1]) {
  query = readFileSync(args[1], "utf-8").trim();
} else if (args[0] && !args[0].startsWith("-")) {
  query = args[0];
} else {
  console.error("Usage: npx tsx query.ts <SQL_QUERY>");
  console.error("       npx tsx query.ts --file <SQL_FILE>");
  process.exit(1);
}

async function main() {
  const bq = new BigQuery();
  const [rows] = await bq.query({ query });
  console.log(JSON.stringify(rows, null, 2));
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
