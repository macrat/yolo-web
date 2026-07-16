#!/bin/bash

# session-start-facts.sh (SessionStart hook)
# セッション開始時に「検証済みの事実」を実測してコンテキストに注入する。
# 目的: PMが記憶や推測でサイト基礎情報を扱う事故(AP-WF06 / AP-WF12)を減らす。
# ここに出力される値はすべてこのスクリプトがコマンドで実測したものであり、
# サブエージェントへの指示にそのまま使ってよい。

cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0

TODAY=$(date +"%Y-%m-%d (%a) %H:%M %Z")

# 最新サイクル (cycle-NNN.md 形式と cycle-NNN/index.md 形式の両方に対応)
LATEST_CYCLE=$(ls -d docs/cycles/cycle-*.md docs/cycles/cycle-*/ 2>/dev/null |
  grep -oE 'cycle-[0-9]+' | sort -t- -k2 -n | uniq | tail -1)

CYCLE_STATUS="サイクルドキュメントなし"
if [ -n "$LATEST_CYCLE" ]; then
  if [ -f "docs/cycles/$LATEST_CYCLE/index.md" ]; then
    CYCLE_DOC="docs/cycles/$LATEST_CYCLE/index.md"
  else
    CYCLE_DOC="docs/cycles/$LATEST_CYCLE.md"
  fi
  STARTED=$(grep -m1 '^started_at:' "$CYCLE_DOC" | sed 's/^started_at:[[:space:]]*//; s/"//g')
  COMPLETED=$(grep -m1 '^completed_at:' "$CYCLE_DOC" | sed 's/^completed_at:[[:space:]]*//; s/"//g')
  if [ -z "$COMPLETED" ] || [ "$COMPLETED" = "null" ]; then
    CYCLE_STATUS="$LATEST_CYCLE は進行中 (started_at: $STARTED / completed_at: 未設定)"
  else
    CYCLE_STATUS="$LATEST_CYCLE は完了済み (completed_at: $COMPLETED)"
  fi
fi

# backlog の各セクションの行数 (表のヘッダ・罫線を除く)
count_section() {
  awk -v section="$1" '
    /^## / { in_section = ($0 ~ "^## " section) }
    in_section && /^\|/ && !/^\| ---/ && !/^\| ID/ { count++ }
    END { print count + 0 }
  ' docs/backlog.md 2>/dev/null
}
ACTIVE_COUNT=$(count_section "Active")
QUEUED_COUNT=$(count_section "Queued")

# 期限が来ているADR (docs/ADR/open/ の先頭日付が今日以前)
TODAY_YMD=$(date +%Y-%m-%d)
DUE_ADRS=""
for d in docs/ADR/open/*/; do
  [ -d "$d" ] || continue
  name=$(basename "$d")
  adr_date=${name:0:10}
  if [[ "$adr_date" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}$ ]] && [[ "$adr_date" < "$TODAY_YMD" || "$adr_date" = "$TODAY_YMD" ]]; then
    DUE_ADRS="$DUE_ADRS  - $name\n"
  fi
done
[ -z "$DUE_ADRS" ] && DUE_ADRS="  (なし)\n"

# コンテンツ実数
# ブログは公開済み (draft: true を除く) を数える。ツールは正典 (generate-toolbox-registry.ts) と
# 同じ基準 = src/tools/{slug}/meta.ts の存在で数える (generated/ 等の非ツールディレクトリを含めない)。
BLOG_TOTAL=$(ls src/blog/content/*.md 2>/dev/null | wc -l | tr -d ' ')
BLOG_DRAFT=$(grep -l '^draft: true' src/blog/content/*.md 2>/dev/null | wc -l | tr -d ' ')
BLOG_COUNT=$((BLOG_TOTAL - BLOG_DRAFT))
TOOL_COUNT=$(ls src/tools/*/meta.ts 2>/dev/null | wc -l | tr -d ' ')

echo "## 検証済みファクト (SessionStart フックが実測。記憶ではなくこの値を使うこと)"
echo ""
echo "- 現在日時: $TODAY (\`date\` 実測)"
echo "- 最新サイクル: $CYCLE_STATUS"
echo "- backlog: Active ${ACTIVE_COUNT}件 / Queued ${QUEUED_COUNT}件 (\`docs/backlog.md\` 実測)"
echo "- 期限到来ADR (docs/ADR/open/ の先頭日付が今日以前):"
printf "%b" "$DUE_ADRS"
echo "- コンテンツ実数: 公開ブログ ${BLOG_COUNT}本 (下書き${BLOG_DRAFT}本を除く・\`src/blog/content/*.md\` の draft 実測) / ツール ${TOOL_COUNT}個 (\`src/tools/*/meta.ts\` 実測)"
echo ""
echo "これ以外の事実情報(過去の経緯・数値・コンテンツ内容)は、使う前に必ずファイルやコマンドで実測すること。"

exit 0
