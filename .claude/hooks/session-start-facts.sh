#!/bin/bash

# session-start-facts.sh (SessionStart hook)
# セッション開始時に、最新サイクルの番号と状態を実測してコンテキストに注入する。
# 目的: PMが記憶や推測でサイクル状態を扱う事故 (AP-WF06 / AP-WF12) を減らす。
# 注入するのはサイクル番号と状態のみ (日付はClaude Codeが提供する。backlog件数や
# コンテンツ実数は使う場面が少ないため注入せず、必要になったときに実測する)。

cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0

# 最新サイクル (cycle-NNN/index.md 形式と旧 cycle-NNN.md 形式の両方に対応)
LATEST_CYCLE=$(ls -d docs/cycles/cycle-*.md docs/cycles/cycle-*/ 2>/dev/null |
  grep -oE 'cycle-[0-9]+' | sort -t- -k2 -n | uniq | tail -1)
[ -z "$LATEST_CYCLE" ] && exit 0

if [ -f "docs/cycles/$LATEST_CYCLE/index.md" ]; then
  CYCLE_DOC="docs/cycles/$LATEST_CYCLE/index.md"
else
  CYCLE_DOC="docs/cycles/$LATEST_CYCLE.md"
fi

STARTED=$(grep -m1 '^started_at:' "$CYCLE_DOC" | sed 's/^started_at:[[:space:]]*//; s/"//g')
COMPLETED=$(grep -m1 '^completed_at:' "$CYCLE_DOC" | sed 's/^completed_at:[[:space:]]*//; s/"//g')
if [ -z "$COMPLETED" ] || [ "$COMPLETED" = "null" ]; then
  echo "最新サイクル (実測): $LATEST_CYCLE は進行中 (started_at: $STARTED / completed_at: 未設定)"
else
  echo "最新サイクル (実測): $LATEST_CYCLE は完了済み (completed_at: $COMPLETED)"
fi

exit 0
