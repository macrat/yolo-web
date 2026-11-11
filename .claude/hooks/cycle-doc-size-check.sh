#!/bin/bash

# cycle-doc-size-check.sh
# サイクルの index.md・decisions.md・carryover.md の大きさを `git commit` の前に検査する。
# この3本は後続のサイクルとレビュアーが毎回全文を読む文書で、Read 1回で全文が返る量に保つ。
# Read が一度に返すのは 25,000 トークンまでで、返るバイト数は中身で違う。実測では長い1行の
# 文の箇条書き（cycle-316 の decisions.md）が 51,621 バイトで切れた（cycle-317 の b784-design.md）。
#   LIMIT: これを超えたら確実に切れる線。コミットを止める。
#   WARN:  どの中身でも Read 1回に収まると見込む線。超えたら Claude に注意を渡し、そのサイクルの中で分ける。

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command')

# Only intercept git commit commands (run just before committing)
if ! echo "$COMMAND" | grep -q "git commit"; then
  exit 0
fi

CWD=$(echo "$INPUT" | jq -r '.cwd')
cd "$CWD" || exit 0

LIMIT=50000
WARN=40000
TARGET='^docs/cycles/cycle-[0-9]+/(index|decisions|carryover)\.md$'

# staged / unstaged の両方の変更を見る（削除は除く）。-uall で新しいディレクトリの中のファイルも1つずつ出す。
FILES=$(git status --porcelain -uall | grep -vE '^.?D' | sed -E 's/^..[[:space:]]//; s/^"(.*)"$/\1/; s/.* -> //' | grep -E "$TARGET")
[ -z "$FILES" ] && exit 0

OVER=""
NEAR=""
while IFS= read -r f; do
  [ -f "$f" ] || continue
  SIZE=$(wc -c <"$f")
  if [ "$SIZE" -gt "$LIMIT" ]; then
    OVER="${OVER}  ${f}: ${SIZE} バイト"$'\n'
  elif [ "$SIZE" -gt "$WARN" ]; then
    NEAR="${NEAR}  ${f}: ${SIZE} バイト"$'\n'
  fi
done <<<"$FILES"

if [ -n "$OVER" ]; then
  {
    echo "サイクル文書が上限 ${LIMIT} バイトを超えています（コミット中止）。"
    printf '%s' "$OVER"
    echo "index.md・decisions.md・carryover.md は後続のサイクルとレビュアーが毎回全文を読む文書です。"
    echo "上限は Read 1回で全文が返る量です。超えると Read は途中で切れ、残りを読まずに判断されます。"
    echo "直し方: 長い中身を同じディレクトリの別ファイルに移し、元のファイルには1行の要約とリンクだけを残してください。"
    echo "  例) 決定の経緯・レビューの経過 → review-log.md や decisions-t4.md などのタスク別のファイル"
    echo "      元の行: 「- T4 の決定: <一言の要約>。詳細 [decisions-t4.md](./decisions-t4.md)」"
    echo "index.md には計画・チェックリスト・完了サマリだけを書きます（.claude/rules/doc-directory.md）。"
    echo "文を削って字数を詰めること、ほかのサイクルのファイルに移すことはしないでください。"
  } >&2
  exit 2
fi

# 注意はコミットを止めずに Claude の文脈へ届ける。exit 0 の stderr は debug log にしか行かないので、
# stdout の JSON の additionalContext で渡す。
if [ -n "$NEAR" ]; then
  MESSAGE="サイクル文書が ${WARN} バイトを超えました（上限 ${LIMIT}）。このサイクルの中で別ファイルへ分けてください。"$'\n'"${NEAR}"
  jq -n --arg msg "$MESSAGE" '{hookSpecificOutput: {hookEventName: "PreToolUse", additionalContext: $msg}}'
fi

exit 0
