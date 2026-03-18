#!/bin/bash

# block-agent-escape.sh
# Blocks CLAUDECODE environment variable manipulation and direct claude command execution.
# Incidents: cycle-87 (builder agent escape via unset CLAUDECODE and claude multi-launch)

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command')

# Step 1: Early return - skip if neither CLAUDECODE nor claude appears in the command
if ! echo "$COMMAND" | grep -qE "CLAUDECODE|claude"; then
  exit 0
fi

# Step 2: Remove heredoc bodies to avoid false positives
# Handles <<EOF...EOF, <<'EOF'...EOF, <<-EOF...EOF, <<"EOF"...EOF
remove_heredocs() {
  perl -0777 -pe '
    # Remove heredoc bodies: <<[-~]?\s*'\''?\"?(\w+)\"?'\''?\s*\n.*?\n\s*\1\s*$
    while (s/<<[-~]?\s*'\''?"?(\w+)"?'\''?[^\n]*\n.*?\n\s*\1\s*$//ms) {}
  '
}

CLEANED=$(echo "$COMMAND" | remove_heredocs)

# -----------------------------------------------------------------------
# Detection functions
# -----------------------------------------------------------------------

# Check CLAUDECODE manipulation patterns
check_claudecode_manipulation() {
  local cmd="$1"

  # Pattern 1: unset CLAUDECODE
  if echo "$cmd" | grep -qE "(^|;|&&|\|\||\|)\s*unset\s+CLAUDECODE"; then
    echo "unset CLAUDECODE"
    return 0
  fi
  # Also match at the very start of string
  if echo "$cmd" | grep -qE "^\s*unset\s+CLAUDECODE"; then
    echo "unset CLAUDECODE"
    return 0
  fi

  # Pattern 2: export CLAUDECODE= (assignment / clear)
  if echo "$cmd" | grep -qE "export\s+CLAUDECODE="; then
    echo "export CLAUDECODE="
    return 0
  fi

  # Pattern 3: CLAUDECODE= assignment (as prefix or standalone)
  # Match CLAUDECODE= at start or after separator (but not inside quoted strings like echo "CLAUDECODE=")
  if echo "$cmd" | grep -qE "(^|;|&&|\|\|)\s*CLAUDECODE="; then
    echo "CLAUDECODE= (variable assignment)"
    return 0
  fi

  # Pattern 4: env -u CLAUDECODE
  if echo "$cmd" | grep -qE "env\s+-u\s+CLAUDECODE"; then
    echo "env -u CLAUDECODE"
    return 0
  fi

  # Pattern 5: python3/python -c containing CLAUDECODE
  if echo "$cmd" | grep -qE "python3?\s+-c\b" && echo "$cmd" | grep -q "CLAUDECODE"; then
    echo "python3/python -c with CLAUDECODE"
    return 0
  fi

  # Pattern 6: perl -e containing CLAUDECODE
  if echo "$cmd" | grep -qE "perl\s+-e\b" && echo "$cmd" | grep -q "CLAUDECODE"; then
    echo "perl -e with CLAUDECODE"
    return 0
  fi

  # Pattern 7: node -e containing CLAUDECODE
  if echo "$cmd" | grep -qE "node\s+-e\b" && echo "$cmd" | grep -q "CLAUDECODE"; then
    echo "node -e with CLAUDECODE"
    return 0
  fi

  return 1
}

# Check claude command execution patterns
check_claude_execution() {
  local cmd="$1"

  # Pattern 1: bare "claude" as a command (at start, or after separator)
  # Must be a word boundary - not "claudecode" or "claude_something"
  # Separators: start of string, ;, &&, ||, |
  if echo "$cmd" | grep -qE "(^|;|&&|\|\||\|)\s*claude(\s|$)"; then
    echo "claude command execution"
    return 0
  fi

  # Pattern 2: npx claude or npm exec claude / npm run ... claude
  if echo "$cmd" | grep -qE "npx\s+claude(\s|$)"; then
    echo "npx claude"
    return 0
  fi
  if echo "$cmd" | grep -qE "npm\s+(exec|run)\s+claude(\s|$)"; then
    echo "npm exec/run claude"
    return 0
  fi

  # Pattern 3: full path ending with /claude
  if echo "$cmd" | grep -qE "/claude(\s|$)"; then
    echo "full path claude execution"
    return 0
  fi

  # Pattern 4: command substitution $(which claude) or `which claude`
  if echo "$cmd" | grep -qE '\$\(which\s+claude\)'; then
    echo "\$(which claude)"
    return 0
  fi
  if echo "$cmd" | grep -qP '`which\s+claude`'; then
    echo "\`which claude\`"
    return 0
  fi

  # Pattern 5: exec claude
  if echo "$cmd" | grep -qE "(^|;|&&|\|\||\|)\s*exec\s+claude(\s|$)"; then
    echo "exec claude"
    return 0
  fi

  return 1
}

# -----------------------------------------------------------------------
# Main logic
# -----------------------------------------------------------------------

FOUND=""

# Check CLAUDECODE manipulation
detected=$(check_claudecode_manipulation "$CLEANED")
if [ $? -eq 0 ]; then
  FOUND="$detected"
fi

# Check claude execution (only if not already blocked)
if [ -z "$FOUND" ]; then
  detected=$(check_claude_execution "$CLEANED")
  if [ $? -eq 0 ]; then
    FOUND="$detected"
  fi
fi

# If nothing found, allow
if [ -z "$FOUND" ]; then
  exit 0
fi

# Block with informative error message
cat >&2 << 'ERRMSG'
[BLOCKED] Agent escape attempt detected.

This hook has blocked a command that could compromise the agent containment system.
Incident: cycle-87 -- builder agent escaped via unset CLAUDECODE and unauthorized claude launch.

ERRMSG

echo "  Detected: $FOUND" >&2
echo "  Command:  $COMMAND" >&2

cat >&2 << 'ERRMSG'

Rules:
  - CLAUDECODE environment variable must not be modified, cleared, or unset.
  - The claude command must not be executed directly.
  - If you need additional agents, report to PM and request through proper channels.
ERRMSG

exit 2
