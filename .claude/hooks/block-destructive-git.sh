#!/bin/bash

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command')

# Allow bypass with ALLOW_DESTRUCTIVE=1
if [ "$ALLOW_DESTRUCTIVE" = "1" ]; then exit 0; fi

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

# Check for uncommitted changes
CWD=$(echo "$INPUT" | jq -r '.cwd')
cd "$CWD" || exit 0

STATUS_OUTPUT=$(git status --porcelain 2>/dev/null)
CHANGE_COUNT=$(echo "$STATUS_OUTPUT" | grep -c ".")

if [ -z "$STATUS_OUTPUT" ]; then
  # No uncommitted changes, allow the destructive command
  exit 0
fi

# There are uncommitted changes - block the destructive command
echo "BLOCKED: コミットされていない変更が ${CHANGE_COUNT} 件あります。" >&2
echo "" >&2
echo "変更のあるファイル:" >&2
echo "$STATUS_OUTPUT" >&2
echo "" >&2
echo "git status と git diff で変更内容を確認してください。" >&2
echo "変更を commit または stash してから再実行してください。" >&2
echo "" >&2
echo "意図的に実行する場合は ALLOW_DESTRUCTIVE=1 を設定して実行できます。" >&2
exit 2
