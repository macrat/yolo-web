#!/bin/bash

# brand-image-gate.sh (Stop hook)
# B-583(印/店メタファーの是非=ブランドイメージの判断)を扱うサイクルが、
# 「来訪者にどんなイメージを持ってほしいか」を定義・レビュー通過させる前に
# 「完了」することを構造的にブロックする。
#
# 目的: B-583 は 8 サイクル閉じられず、毎回同じ形で失敗した——charter の問い
# 「どんなイメージを持ってほしいか(ブランドイメージ)」を、「認識・識別可能性・
# 一貫性」等の代理指標にすり替えて決着と偽る(AP-P02 / 唯一の根 / cycle-310/incident-1.md)。
# 申し送り(note)は毎回読まれた上で無視された。よって note でなく順序をハーネスで強制する。
#
# ゲート条件: 最新サイクルの index.md がこのサイクルの作業として B-583 を扱っている場合、
# completed_at を設定して完了扱いにするには、
#   docs/cycles/<cycle>/brand-image.md が存在し、
#   その中に「brand-image-review: PASS」で始まる行がある
# ことを要求する。この PASS 行は、独立 reviewer が次の二値軸で承認した記録である:
#   「これは来訪者に喚起したい印象(=イメージ)か、それとも認識/識別可能性/一貫性の
#    ような仕組み・性質か。仕組みなら却下」。
# 無ければブロックする。

INPUT=$(cat)

# 既にこのフックで差し戻した後の再ストップは許可(無限ループ回避)。
STOP_ACTIVE=$(echo "$INPUT" | jq -r '.stop_hook_active // false')
[ "$STOP_ACTIVE" = "true" ] && exit 0

cd "${CLAUDE_PROJECT_DIR:-.}" || exit 0

LATEST_CYCLE=$(ls -d docs/cycles/cycle-*/ 2>/dev/null |
  grep -oE 'cycle-[0-9]+' | sort -t- -k2 -n | uniq | tail -1)
[ -z "$LATEST_CYCLE" ] && exit 0

CYCLE_DIR="docs/cycles/$LATEST_CYCLE"
CYCLE_DOC="$CYCLE_DIR/index.md"
[ -f "$CYCLE_DOC" ] || exit 0

# このサイクルが B-583(ブランドイメージの本丸)を扱っていなければ対象外。
grep -q 'B-583' "$CYCLE_DOC" || exit 0

# 未完了(completed_at 未設定/null)なら stop-cycle-guard が扱うのでここは素通り。
COMPLETED=$(grep -m1 '^completed_at:' "$CYCLE_DOC" | sed 's/^completed_at:[[:space:]]*//; s/"//g')
if [ -z "$COMPLETED" ] || [ "$COMPLETED" = "null" ]; then
  exit 0
fi

# 完了扱い。ブランドイメージ成果物とレビュー通過(PASS)を要求。
BRAND_DOC="$CYCLE_DIR/brand-image.md"
if [ -f "$BRAND_DOC" ] && grep -qE '^brand-image-review:[[:space:]]*PASS' "$BRAND_DOC"; then
  exit 0
fi

cat >&2 << EOF
[BLOCKED] $LATEST_CYCLE は B-583(印/店メタファー=ブランドイメージの判断)を扱っていますが、
ブランドイメージの定義とレビュー通過なしに完了しようとしています。

B-583 の charter は「来訪者にどんなイメージを持ってほしいか」を定めること。過去 8 サイクルは
この問いを「認識・識別可能性・一貫性」等の代理指標にすり替えて決着と偽り、全て失敗した
(AP-P02 / cycle-310/incident-1.md)。順序を構造で強制する:

1. $BRAND_DOC を作り、来訪者に喚起したい印象(イメージ)を constitution + site-concept だけ
   から定義する(既存マーク・DESIGN.md・§0.1 等の自分の構築物は入力にしない=容疑者)。
2. 独立 reviewer に一つの軸だけで審査させる:「これは喚起したい印象(イメージ)か、それとも
   認識/識別可能性/一貫性のような仕組み・性質か。仕組みなら却下」。
3. 通過したら $BRAND_DOC に「brand-image-review: PASS (reviewer名/日付)」の行を記録する。
4. マークの keep/remove/change は、このイメージから飛躍なく導く。

このゲートは cycle-310/incident-1.md の申し送りを構造で強制するもの。回避(空の PASS 行の
自己記入等)は AP-WF23(完了偽装)であり、reviewer 承認の実体を伴うこと。
EOF
exit 2
