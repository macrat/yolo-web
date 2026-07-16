#!/bin/bash

# stop-cycle-guard.sh (Stop hook)
# サイクルが進行中 (completed_at 未設定) のままターンを終了しようとしたらブロックする。
# 目的: 「早く完了させたい」バイアスによるレビュー省略・完了偽装 (AP-WF01 / AP-WF23) を、
# 注意力ではなくハーネスで防ぐ。
#
# 正当な中断 (Ownerの入力なしに進められない等) が必要な場合に限り、サイクルドキュメントに
#   <!-- pause-cycle: 理由 -->
# を記載すれば停止できる。この記録は完了処理のアンチパターン点検で監査される。
#
# 保護範囲の注意: completed_at は cycle-completion の手順1で設定されるため、このフックの
# 保護は completed_at 設定まで。それ以降の push / CI 確認フェーズは cycle-completion の
# 手順 (pre-push-check.sh のフルスイートと scripts/wait-for-ci.sh) が担う。

INPUT=$(cat)

# stop_hook_active が true のときは既にこのフックの指示で継続した後なので、
# 無限ループを避けるために許可する (1回のstopにつき1回だけ差し戻す)。
STOP_ACTIVE=$(echo "$INPUT" | jq -r '.stop_hook_active // false')
[ "$STOP_ACTIVE" = "true" ] && exit 0

cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0

LATEST_CYCLE=$(ls -d docs/cycles/cycle-*.md docs/cycles/cycle-*/ 2>/dev/null |
  grep -oE 'cycle-[0-9]+' | sort -t- -k2 -n | uniq | tail -1)
[ -z "$LATEST_CYCLE" ] && exit 0

if [ -f "docs/cycles/$LATEST_CYCLE/index.md" ]; then
  CYCLE_DOC="docs/cycles/$LATEST_CYCLE/index.md"
elif [ -f "docs/cycles/$LATEST_CYCLE.md" ]; then
  CYCLE_DOC="docs/cycles/$LATEST_CYCLE.md"
else
  exit 0
fi

COMPLETED=$(grep -m1 '^completed_at:' "$CYCLE_DOC" | sed 's/^completed_at:[[:space:]]*//; s/"//g')
if [ -n "$COMPLETED" ] && [ "$COMPLETED" != "null" ]; then
  exit 0
fi

# 明示的な中断記録があれば許可する
if grep -q '<!-- pause-cycle:' "$CYCLE_DOC"; then
  exit 0
fi

cat >&2 << EOF
[BLOCKED] $LATEST_CYCLE が進行中のままターンを終了しようとしています (completed_at が未設定)。

- 作業が残っているなら、続けてください。
- すべてのタスクが完了しているなら、/cycle-completion を実行してサイクルを完了させてください。
- Ownerの入力なしに進められない正当な理由がある場合に限り、$CYCLE_DOC に
  <!-- pause-cycle: 理由 --> を記載してから終了してください (完了処理のAP点検で監査されます)。

「あとで完了処理をする」「実質終わっている」は認められません (AP-WF23)。
EOF
exit 2
