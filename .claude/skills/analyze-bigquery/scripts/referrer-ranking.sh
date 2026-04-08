#!/usr/bin/env bash
# リファラー別PV数ランキング
# Usage: ./referrer-ranking.sh [--weeks N] [--from YYYYMMDD] [--to YYYYMMDD]
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
  FROM=$(date -d "${WEEKS} weeks ago" +%Y%m%d)
fi
if [[ -z "$TO" ]]; then
  TO=$(date +%Y%m%d)
fi

QUERY="
SELECT
  IFNULL(
    (SELECT ep.value.string_value FROM UNNEST(event_params) ep WHERE ep.key = 'source'),
    '(direct)'
  ) AS source,
  IFNULL(
    (SELECT ep.value.string_value FROM UNNEST(event_params) ep WHERE ep.key = 'medium'),
    '(none)'
  ) AS medium,
  COUNT(*) AS pageviews
FROM \`analytics_524708437.events_*\`
WHERE _TABLE_SUFFIX BETWEEN '${FROM}' AND '${TO}'
  AND event_name = 'page_view'
GROUP BY source, medium
ORDER BY pageviews DESC
"

npx tsx "${SCRIPT_DIR}/query.ts" "$QUERY"
