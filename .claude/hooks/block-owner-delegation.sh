#!/bin/bash

# block-owner-delegation.sh (PreToolUse hook / matcher: AskUserQuestion)
# PM権限内の判断をOwnerに委ねる質問 (「進めてよいか」「どちらにしますか」型) をブロックする。
# 目的: AP-WF24 (判断のOwner委譲・駆動源のOwner帰属) を、ルールの再読ではなくツールレベルで強制する。
# 事実の確認や、Ownerにしか決められない事項 (constitutionの変更等) の質問はブロックしない。

INPUT=$(cat)
TEXT=$(echo "$INPUT" | jq -r '.tool_input | tostring' 2>/dev/null)
[ -z "$TEXT" ] && exit 0

# 注意: Cロケールの grep はバイト単位で動くため、「.{0,24}」は日本語約8文字分に相当する。
DELEGATION_PATTERN='進めてよろしい|進めてもよい|進めてよい|進めていい|よろしいでしょうか|よろしいですか|許可をください|許可いただけ|承認をお願い|承認いただけ|どちら.{0,24}にします|どちらが(良い|よい|いい)|どれ.{0,24}にします|どう進めますか|どのように進め|指示をください|指示してください|ご指示|判断をお願い|判断してください|決めてください|お任せします|should I proceed|may I proceed|do you approve|which (option|approach) should'

if echo "$TEXT" | grep -qiE "$DELEGATION_PATTERN"; then
  cat >&2 << 'EOF'
[BLOCKED] PM権限内の判断をOwnerに委譲する質問を検出しました (AP-WF24)。

CLAUDE.md「Roles and Responsibilities」の通り、判断はPMの責務です。Ownerは決定をPMに委任しており、自ら決定しません。

- 情報・根拠・推奨案を自分で整理し、自ら決定して実行し、結果と根拠を報告してください。
- 迷うなら constitution Goal (来訪者価値によるPV最大化) を基準に決めてください。
- Ownerにしか決められない事項 (constitutionの変更・費用の発生など) であれば、選択の丸投げではなく「事実の確認」として質問を組み立て直してください。
EOF
  exit 2
fi

exit 0
