#!/bin/bash

INPUT=$(cat)
EVENT=$(echo "$INPUT" | jq -r '.hook_event_name')

FRONTMATTER_END='---'

case "$EVENT" in
	"UserPromptSubmit")
		FROM="owner"
		TO="pm"
		DIR="agent"
		BODY=$(echo "$INPUT" | jq -r '.prompt')
		SUBJECT=$(echo "$BODY" | head -n 1)
		;;
	"Stop")
		FROM="pm"
		TO="owner"
		DIR="owner"
		BODY=$(echo "$INPUT" | jq -r '.last_assistant_message')
		SUBJECT=$(echo "$BODY" | head -n 1)
		;;
	"PreToolUse")
		FROM="pm"
		TO=$(echo "$INPUT" | jq -r '.tool_input.subagent_type')
		DIR="agent"
		BODY=$(echo "$INPUT" | jq -r '.tool_input.prompt')
		SUBJECT=$(echo "$INPUT" | jq -r '.tool_input.description')
		FRONTMATTER_END=$(echo "$INPUT" | jq -r '"tool_use_id: \"" + .tool_use_id + "\"\n---"')
		;;
	"PostToolUse")
		FROM=$(echo "$INPUT" | jq -r '.tool_input.subagent_type')
		TO="pm"
		DIR="agent"
		BODY=$(echo "$INPUT" | jq -r '.tool_response.content[0].text')
		SUBJECT=$(echo "$INPUT" | jq -r '"Re: " + .tool_input.description')
		TOOL_USE_ID=$(echo "$INPUT" | jq -r '.tool_use_id')
		REPLY_TO=$(rg "tool_use_id: \"${TOOL_USE_ID}\"" "${CLAUDE_PROJECT_DIR}/memo/agent/archive/" --files-with-matches | head -n 1 | sed -e 's/.*\/\([0-9a-f]\+\)-.*\.md/"\1"/' || true)
		;;
	*)
		exit 0
		;;
esac

CREATED_AT=$(date '+%Y-%m-%dT%H:%M:%S.%3N%z')
ID=$(printf '%x' $(date '+%s%3N' -d "$CREATED_AT"))
FILE="${CLAUDE_PROJECT_DIR}/memo/$DIR/archive/$ID-$(echo "$SUBJECT" | sed -e 's/[ :/\\!?#*+_<>]/-/g' | jq -rR '.[:30]').md"

cat <<EOF > "$FILE"
---
id: "${ID}"
subject: "${SUBJECT}"
from: "${FROM}"
to: "${TO}"
created_at: "${CREATED_AT}"
reply_to: ${REPLY_TO:-null}
${FRONTMATTER_END}

${BODY}
EOF

echo "メッセージはメモID ${ID} として記録されました。"
echo "あとから読みたくなったら \`npm run memo read ${ID}\` で確認できます。"
echo "サブエージェントにこのメモを見せたいときは、上記のコマンドを伝えてください。"
