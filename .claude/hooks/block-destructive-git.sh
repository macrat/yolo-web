#!/bin/bash

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command')

if [[ "$COMMAND" == ALLOW_UNSAFE_GIT_COMMANDS=1\ * ]]; then
  exit 0
fi

# Only intercept git commands
if ! echo "$COMMAND" | grep -q "git "; then
  exit 0
fi

# Check for destructive git command patterns
IS_DESTRUCTIVE=0

# git reset --hard
if echo "$COMMAND" | grep -qE "git\s+reset\s+--hard"; then
  IS_DESTRUCTIVE=1
fi

# git clean with -f flag (e.g., -f, -fd, -fx, -fxd, etc.)
if echo "$COMMAND" | grep -qE "git\s+clean\s+.*-[a-z]*f"; then
  IS_DESTRUCTIVE=1
fi

# git checkout -- <path> (destructive: discards working tree changes)
# This pattern specifically targets "checkout" followed by "--" and then a path.
# It does NOT block "git checkout <branch>" which is a normal branch switch.
if echo "$COMMAND" | grep -qE "git\s+checkout\s+--\s+"; then
  IS_DESTRUCTIVE=1
fi

# git checkout . (discard all changes in working tree)
if echo "$COMMAND" | grep -qE "git\s+checkout\s+\.$"; then
  IS_DESTRUCTIVE=1
fi

# git stash drop
if echo "$COMMAND" | grep -qE "git\s+stash\s+drop"; then
  IS_DESTRUCTIVE=1
fi

# git stash clear
if echo "$COMMAND" | grep -qE "git\s+stash\s+clear"; then
  IS_DESTRUCTIVE=1
fi

# git restore (discarding changes from worktree or staging area)
# Allow "git restore --staged <path>" alone (just unstages, no data loss)
# Block everything else (worktree restore, --source, etc.)
if echo "$COMMAND" | grep -qE "git\s+restore\s+"; then
  if ! echo "$COMMAND" | grep -qE "git\s+restore\s+--staged\s+" || echo "$COMMAND" | grep -qE "git\s+restore\s+--staged\s+--worktree|git\s+restore\s+--worktree"; then
    IS_DESTRUCTIVE=1
  fi
fi

# If not a destructive command, allow it
if [ $IS_DESTRUCTIVE -eq 0 ]; then
  exit 0
fi

echo "このgitコマンドを実行すると、本来は保持しておくべき変更が失われる可能性があります。" >&2
echo "このコマンドを実行する前に、必ず git status や git diff を使用して、本当にこのコマンドを実行しても問題ないか確認してください。" >&2
echo "もしこのコマンドを実行しても問題ないと判断した場合は、環境変数 ALLOW_UNSAFE_GIT_COMMANDS を設定してから再度実行してください。" >&2
echo "例: ALLOW_UNSAFE_GIT_COMMANDS=1 $COMMAND" >&2
exit 2
