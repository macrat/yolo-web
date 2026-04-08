#!/usr/bin/env bash
# 日別PV数の推移
# Usage: ./pageview-daily.sh [--weeks N] [--from YYYYMMDD] [--to YYYYMMDD]
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
  FROM=$(date -d "${WEEKS} weeks ago" +%Y%m%d)
fi
if [[ -z "$TO" ]]; then
  TO=$(date +%Y%m%d)
fi

QUERY="
SELECT
  event_date AS date,
  COUNT(*) AS pageviews
FROM \`analytics_524708437.events_*\`
WHERE _TABLE_SUFFIX BETWEEN '${FROM}' AND '${TO}'
  AND event_name = 'page_view'
GROUP BY date
ORDER BY date
"

npx tsx "${SCRIPT_DIR}/query.ts" "$QUERY"
