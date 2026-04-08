#!/usr/bin/env bash
# 日別検索パフォーマンス推移（クリック数・表示回数）
# Usage: ./search-daily.sh [--weeks N] [--from YYYY-MM-DD] [--to YYYY-MM-DD]
# デフォルト: 過去4週間分を表示

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

WEEKS=4
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
  CAST(data_date AS STRING) AS date,
  SUM(clicks) AS clicks,
  SUM(impressions) AS impressions,
  ROUND(SAFE_DIVIDE(SUM(clicks), SUM(impressions)) * 100, 1) AS ctr
FROM \`searchconsole.searchdata_url_impression\`
WHERE data_date BETWEEN '${FROM}' AND '${TO}'
GROUP BY date
ORDER BY date
"

npx tsx "${SCRIPT_DIR}/query.ts" "$QUERY"
