#!/bin/bash

# block-destructive-git.sh
# Blocks destructive git commands to prevent accidental data loss.
# Incidents: cycle-51, cycle-71, cycle-75

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command')

# Step 1: Early return - skip if no "git " anywhere in the command
if ! echo "$COMMAND" | grep -q "git "; then
  exit 0
fi

# Step 2: Remove heredoc bodies to avoid false positives
# Handles <<EOF...EOF, <<'EOF'...EOF, <<-EOF...EOF, <<"EOF"...EOF
# Uses perl for reliable multiline heredoc removal
remove_heredocs() {
  perl -0777 -pe '
    # Remove heredoc bodies: <<[-~]?\s*'\''?\"?(\w+)\"?'\''?\s*\n.*?\n\s*\1\s*$
    while (s/<<[-~]?\s*'\''?"?(\w+)"?'\''?[^\n]*\n.*?\n\s*\1\s*$//ms) {}
  '
}

CLEANED=$(echo "$COMMAND" | remove_heredocs)

# Step 3: Split by command separators (;, &&, ||, |) and process each subcommand
# We use a simple approach: replace separators with newlines, then process line by line
split_commands() {
  # Replace ;, &&, ||, | with newlines
  # Be careful not to break || and && into multiple splits
  echo "$1" | sed -E 's/\s*\|\|\s*/\n/g; s/\s*&&\s*/\n/g; s/\s*;\s*/\n/g; s/\s*\|\s*/\n/g'
}

# Check if a subcommand starts with "git" (after stripping leading whitespace and var assignments)
starts_with_git() {
  local cmd="$1"
  # Strip leading whitespace
  cmd=$(echo "$cmd" | sed 's/^[[:space:]]*//')
  # Skip variable assignments (VAR=val prefix)
  while echo "$cmd" | grep -qE '^[A-Za-z_][A-Za-z0-9_]*=\S*\s'; do
    cmd=$(echo "$cmd" | sed -E 's/^[A-Za-z_][A-Za-z0-9_]*=\S*\s*//')
  done
  # Check if first word is "git"
  local first_word
  first_word=$(echo "$cmd" | awk '{print $1}')
  [ "$first_word" = "git" ]
}

# Strip quote characters (preserve content)
strip_quotes() {
  echo "$1" | tr -d "\"'"
}

# Check destructive patterns against a single unquoted git subcommand
# Returns 0 if destructive pattern found, 1 otherwise
check_destructive() {
  local cmd="$1"

  # Pattern 1: git reset --hard
  if echo "$cmd" | grep -qE "git\s+reset\s+--hard"; then
    echo "git reset --hard"
    return 0
  fi

  # Pattern 2: git clean -f (and variants like -fd, -fxd)
  if echo "$cmd" | grep -qE "git\s+clean\s+.*-[a-z]*f"; then
    echo "git clean -f"
    return 0
  fi

  # Pattern 3: git checkout -- path
  if echo "$cmd" | grep -qE "git\s+checkout\s+--\s+"; then
    echo "git checkout -- <path>"
    return 0
  fi

  # Pattern 4: git checkout . (with optional trailing content like && ...)
  if echo "$cmd" | grep -qE "git\s+checkout\s+\.(\s|$)"; then
    echo "git checkout ."
    return 0
  fi

  # Pattern 6: git checkout --theirs / --ours
  if echo "$cmd" | grep -qE "git\s+checkout\s+--(theirs|ours)"; then
    echo "git checkout --theirs/--ours"
    return 0
  fi

  # Pattern 5: git checkout <file-path> (without --)
  # Detect paths by / or file extensions
  # Exclude: -b/-B flag (branch creation), -- already handled above
  if echo "$cmd" | grep -qE "git\s+checkout\s+"; then
    # Skip if -b or -B flag is present
    if ! echo "$cmd" | grep -qE "git\s+checkout\s+(-b|-B)\s"; then
      # Get the arguments after "git checkout"
      local args
      args=$(echo "$cmd" | sed -E 's/git\s+checkout\s+//')
      # Check if any argument contains / or known file extensions
      if echo "$args" | grep -qE '(/|\.md|\.ts|\.tsx|\.js|\.jsx|\.json|\.yaml|\.yml|\.sh|\.css|\.html|\.svg|\.png)'; then
        echo "git checkout <file-path>"
        return 0
      fi
    fi
  fi

  # Pattern 7: git stash drop
  if echo "$cmd" | grep -qE "git\s+stash\s+drop"; then
    echo "git stash drop"
    return 0
  fi

  # Pattern 8: git stash clear
  if echo "$cmd" | grep -qE "git\s+stash\s+clear"; then
    echo "git stash clear"
    return 0
  fi

  # Pattern 9: git restore (except --staged alone)
  if echo "$cmd" | grep -qE "git\s+restore\s+"; then
    if ! echo "$cmd" | grep -qE "git\s+restore\s+--staged\s+" || echo "$cmd" | grep -qE "git\s+restore\s+--staged\s+--worktree|git\s+restore\s+--worktree"; then
      echo "git restore"
      return 0
    fi
  fi

  # Pattern 10: git push --force / -f (includes --force-with-lease)
  if echo "$cmd" | grep -qE "git\s+push\s+.*--force"; then
    echo "git push --force"
    return 0
  fi
  if echo "$cmd" | grep -qE "git\s+push\s+.*-f(\s|$)"; then
    echo "git push -f"
    return 0
  fi

  # Pattern 11: git branch -D
  if echo "$cmd" | grep -qE "git\s+branch\s+-D"; then
    echo "git branch -D"
    return 0
  fi

  return 1
}

# Main logic: iterate over subcommands
FOUND_DESTRUCTIVE=""
while IFS= read -r subcmd; do
  # Skip empty lines
  [ -z "$subcmd" ] && continue

  # Step 3a: Check if subcommand starts with git
  if ! starts_with_git "$subcmd"; then
    continue
  fi

  # Step 3b: Strip quote characters (preserve content)
  unquoted=$(strip_quotes "$subcmd")

  # Step 3c: Check destructive patterns
  detected=$(check_destructive "$unquoted")
  if [ $? -eq 0 ]; then
    FOUND_DESTRUCTIVE="$detected"
    break
  fi
done < <(split_commands "$CLEANED")

# If no destructive command found, allow
if [ -z "$FOUND_DESTRUCTIVE" ]; then
  exit 0
fi

# Block with informative error message
cat >&2 << 'ERRMSG'
[BLOCKED] Destructive git command detected.

This hook has blocked a git command that could cause irreversible data loss.
Past incidents: cycle-51, cycle-71, cycle-75 -- all caused by destructive git commands discarding uncommitted work.

ERRMSG

echo "  Detected: $FOUND_DESTRUCTIVE" >&2
echo "  Command:  $COMMAND" >&2

cat >&2 << 'ERRMSG'

Alternative approaches:
  - Use the Edit tool to modify specific parts of a file instead of discarding all changes.
  - If you need to revert an entire file, first run "git diff <file>" to confirm what will be lost,
    then create a wip: commit of your current work before proceeding.
  - As a last resort, a human operator can temporarily remove this hook from .claude/settings.json.
ERRMSG

exit 2
