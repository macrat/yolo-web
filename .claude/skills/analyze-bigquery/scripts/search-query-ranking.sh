#!/usr/bin/env bash
# 検索クエリ別ランキング
# Usage: ./search-query-ranking.sh [--weeks N] [--from YYYY-MM-DD] [--to YYYY-MM-DD] [--sort clicks|impressions|ctr|position]
# デフォルト: 過去12週間分を集計、クリック数順

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

WEEKS=12
FROM=""
TO=""
SORT="clicks"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --weeks) WEEKS="$2"; shift 2 ;;
    --from)  FROM="$2"; shift 2 ;;
    --to)    TO="$2"; shift 2 ;;
    --sort)  SORT="$2"; shift 2 ;;
    *)       echo "Unknown option: $1" >&2; exit 1 ;;
  esac
done

case "$SORT" in
  clicks)      ORDER_CLAUSE="clicks DESC, impressions DESC" ;;
  impressions) ORDER_CLAUSE="impressions DESC, clicks DESC" ;;
  ctr)         ORDER_CLAUSE="ctr DESC, impressions DESC" ;;
  position)    ORDER_CLAUSE="avg_position ASC, impressions DESC" ;;
  *)           echo "Unknown sort: $SORT (use clicks|impressions|ctr|position)" >&2; exit 1 ;;
esac

if [[ -z "$FROM" ]]; then
  FROM=$(date -d "${WEEKS} weeks ago" +%Y-%m-%d)
fi
if [[ -z "$TO" ]]; then
  TO=$(date +%Y-%m-%d)
fi

QUERY="
SELECT
  query,
  SUM(clicks) AS clicks,
  SUM(impressions) AS impressions,
  ROUND(SAFE_DIVIDE(SUM(clicks), SUM(impressions)) * 100, 1) AS ctr,
  ROUND(SAFE_DIVIDE(SUM(sum_position), SUM(impressions)), 1) AS avg_position
FROM \`searchconsole.searchdata_url_impression\`
WHERE data_date BETWEEN '${FROM}' AND '${TO}'
  AND NOT is_anonymized_query
GROUP BY query
ORDER BY ${ORDER_CLAUSE}
"

npx tsx "${SCRIPT_DIR}/query.ts" "$QUERY"
