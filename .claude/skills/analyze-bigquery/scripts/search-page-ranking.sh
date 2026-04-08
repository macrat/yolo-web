#!/usr/bin/env bash
# ページ別検索クリック数ランキング
# Usage: ./search-page-ranking.sh [--weeks N] [--from YYYY-MM-DD] [--to YYYY-MM-DD]
# デフォルト: 過去12週間分を集計

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

WEEKS=12
FROM=""
TO=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --weeks) WEEKS="$2"; shift 2 ;;
    --from)  FROM="$2"; shift 2 ;;
    --to)    TO="$2"; shift 2 ;;
    *)       echo "Unknown option: $1" >&2; exit 1 ;;
  esac
done

if [[ -z "$FROM" ]]; then
  FROM=$(date -d "${WEEKS} weeks ago" +%Y-%m-%d)
fi
if [[ -z "$TO" ]]; then
  TO=$(date +%Y-%m-%d)
fi

QUERY="
SELECT
  REGEXP_REPLACE(url, r'https?://[^/]+', '') AS page_path,
  SUM(clicks) AS clicks,
  SUM(impressions) AS impressions,
  ROUND(SAFE_DIVIDE(SUM(clicks), SUM(impressions)) * 100, 1) AS ctr,
  ROUND(SAFE_DIVIDE(SUM(sum_position), SUM(impressions)), 1) AS avg_position
FROM \`searchconsole.searchdata_url_impression\`
WHERE data_date BETWEEN '${FROM}' AND '${TO}'
GROUP BY page_path
ORDER BY clicks DESC, impressions DESC
"

npx tsx "${SCRIPT_DIR}/query.ts" "$QUERY"
