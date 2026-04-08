#!/usr/bin/env bash
# 週別PV数の推移
# Usage: ./pageview-weekly.sh [--weeks N] [--from YYYYMMDD] [--to YYYYMMDD]
# デフォルト: 過去12週間分を表示

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
  FROM=$(date -d "${WEEKS} weeks ago" +%Y%m%d)
fi
if [[ -z "$TO" ]]; then
  TO=$(date +%Y%m%d)
fi

QUERY="
SELECT
  FORMAT_DATE('%G-W%V', PARSE_DATE('%Y%m%d', event_date)) AS week,
  MIN(event_date) AS week_start,
  COUNT(*) AS pageviews,
  COUNT(DISTINCT user_pseudo_id) AS users
FROM \`analytics_524708437.events_*\`
WHERE _TABLE_SUFFIX BETWEEN '${FROM}' AND '${TO}'
  AND event_name = 'page_view'
GROUP BY week
ORDER BY week
"

npx tsx "${SCRIPT_DIR}/query.ts" "$QUERY"
