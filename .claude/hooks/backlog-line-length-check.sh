#!/bin/bash

# backlog-line-length-check.sh
# Blocks `git commit` when docs/backlog.md has any line longer than 200 chars.
# backlog.md is a place for one-line summaries + a pointer to where the details
# live (cycle docs etc.). Long prose (history / what-was-done details) is forbidden.

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command')

# Only intercept git commit commands (run just before committing)
if ! echo "$COMMAND" | grep -q "git commit"; then
  exit 0
fi

CWD=$(echo "$INPUT" | jq -r '.cwd')
cd "$CWD" || exit 0

BACKLOG="docs/backlog.md"
[ -f "$BACKLOG" ] || exit 0

LIMIT=200
# 文字数（バイト数ではなく）で判定する。このリポジトリのロケールは C のため
# awk/wc はバイトを数えてしまう。perl -CSD は UTF-8 を文字として正しく数える。
VIOLATIONS=$(LIMIT="$LIMIT" perl -CSD -ne 'chomp; my $n = length($_); if ($n > $ENV{LIMIT}) { printf "  L%d (%d文字): %s...\n", $., $n, substr($_, 0, 40) }' "$BACKLOG")

if [ -n "$VIOLATIONS" ]; then
  {
    echo "backlog.md に1行 ${LIMIT} 文字を超える行があります（コミット中止）。"
    echo "backlog.md は各項目を【一言で要約】し、経緯ややったことの【詳細はサイクルドキュメント等の保存場所を指し示すだけ】の場所です。長文を書くことは禁止されています。"
    echo "詳細は該当する docs/cycles/cycle-XX.md 等に書き、backlog には要約＋参照先のみを残してください。"
    echo "以下の行が ${LIMIT} 文字を超えています:"
    echo "$VIOLATIONS"
  } >&2
  exit 2
fi

exit 0
