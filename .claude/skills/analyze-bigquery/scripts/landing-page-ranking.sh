#!/usr/bin/env bash
# ランディングページ別セッション数ランキング（オーガニック検索のみ）
# Usage: ./landing-page-ranking.sh [--weeks N] [--from YYYYMMDD] [--to YYYYMMDD] [--all-channels]
# デフォルト: 過去12週間分、オーガニック検索のみ

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

WEEKS=12
FROM=""
TO=""
CHANNEL_FILTER="AND session_traffic_source_last_click.cross_channel_campaign.default_channel_group = 'Organic Search'"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --weeks)        WEEKS="$2"; shift 2 ;;
    --from)         FROM="$2"; shift 2 ;;
    --to)           TO="$2"; shift 2 ;;
    --all-channels) CHANNEL_FILTER=""; shift ;;
    *)              echo "Unknown option: $1" >&2; exit 1 ;;
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
  REGEXP_REPLACE(
    REGEXP_REPLACE(
      (SELECT ep.value.string_value FROM UNNEST(event_params) ep WHERE ep.key = 'page_location'),
      r'https?://[^/]+', ''
    ),
    r'\?.*$', ''
  ) AS landing_page,
  COUNT(DISTINCT CONCAT(user_pseudo_id, '.', (SELECT ep.value.int_value FROM UNNEST(event_params) ep WHERE ep.key = 'ga_session_id'))) AS sessions,
  COUNTIF(event_name = 'page_view') AS pageviews
FROM \`analytics_524708437.events_*\`
WHERE _TABLE_SUFFIX BETWEEN '${FROM}' AND '${TO}'
  AND event_name IN ('session_start', 'page_view')
  ${CHANNEL_FILTER}
GROUP BY landing_page
ORDER BY sessions DESC
"

npx tsx "${SCRIPT_DIR}/query.ts" "$QUERY"
