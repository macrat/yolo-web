#!/usr/bin/env bash
# チャネル別セッション・PV数ランキング
# Usage: ./channel-ranking.sh [--weeks N] [--from YYYYMMDD] [--to YYYYMMDD]
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
    session_traffic_source_last_click.cross_channel_campaign.default_channel_group,
    '(not set)'
  ) AS channel_group,
  COUNT(DISTINCT CONCAT(user_pseudo_id, '.', (SELECT ep.value.int_value FROM UNNEST(event_params) ep WHERE ep.key = 'ga_session_id'))) AS sessions,
  COUNTIF(event_name = 'page_view') AS pageviews,
  ROUND(
    SAFE_DIVIDE(
      COUNTIF(event_name = 'user_engagement'),
      COUNT(DISTINCT CONCAT(user_pseudo_id, '.', (SELECT ep.value.int_value FROM UNNEST(event_params) ep WHERE ep.key = 'ga_session_id')))
    ) * 100, 1
  ) AS engagement_rate
FROM \`analytics_524708437.events_*\`
WHERE _TABLE_SUFFIX BETWEEN '${FROM}' AND '${TO}'
GROUP BY channel_group
ORDER BY sessions DESC
"

npx tsx "${SCRIPT_DIR}/query.ts" "$QUERY"
