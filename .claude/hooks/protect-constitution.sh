#!/bin/bash

# protect-constitution.sh (PreToolUse hook / matcher: Bash)
# docs/constitution.md へのシェル経由の書き込み・移動・削除をブロックする。
# constitution は Owner だけが変更できる不変ポリシー。Edit / Write / MultiEdit /
# NotebookEdit の各ツールは settings.json の permissions.deny で個別に拒否してあり、
# このフックは Bash経由 (リダイレクト・sed -i 等) の典型的な抜け道を塞ぐ多層防御の一層である。
# インタプリタ経由 (python -c 等) の書き込みまでは捕捉しない (網羅ではない)。
# 読み取り (cat / grep / diff 等) はブロックしない。

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command')

echo "$COMMAND" | grep -q "constitution" || exit 0

WRITE_PATTERN='(>>?[[:space:]]*[^[:space:]]*constitution\.md)|(\bsed[[:space:]]+[^;|&]*-[a-zA-Z]*i[^;|&]*constitution\.md)|(\bperl[[:space:]]+[^;|&]*-[a-zA-Z]*i[^;|&]*constitution\.md)|(\btee[[:space:]]+[^;|&]*constitution\.md)|(\b(rm|mv|cp|truncate)[[:space:]]+[^;|&]*constitution\.md)|(\bdd\b[^;|&]*of=[^[:space:]]*constitution\.md)'

if echo "$COMMAND" | grep -qE "$WRITE_PATTERN"; then
  cat >&2 << 'EOF'
[BLOCKED] docs/constitution.md への書き込み・移動・削除を検出しました。

constitution.md は Owner だけが変更できる不変ポリシーです。
AIエージェントが内容を変更・移動・削除することは、方法を問わず禁止されています。
読み取りたいだけであれば、リダイレクトや編集系コマンドを含まない形 (cat / grep 等) で実行してください。
EOF
  exit 2
fi

exit 0
