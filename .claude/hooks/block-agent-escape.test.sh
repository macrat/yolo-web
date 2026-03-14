#!/bin/bash

# block-agent-escape.test.sh
# Test suite for block-agent-escape.sh

HOOK="/mnt/data/yolo-web/.claude/hooks/block-agent-escape.sh"
PASS=0
FAIL=0

make_input() {
  local cmd="$1"
  printf '{"tool_input":{"command":%s}}' "$(printf '%s' "$cmd" | jq -Rs .)"
}

expect_blocked() {
  local label="$1"
  local cmd="$2"
  local output
  output=$(make_input "$cmd" | bash "$HOOK" 2>&1)
  local code=$?
  if [ "$code" -eq 2 ]; then
    echo "  PASS [blocked]   $label"
    PASS=$((PASS + 1))
  else
    echo "  FAIL [not blocked] $label (exit=$code)"
    FAIL=$((FAIL + 1))
  fi
}

expect_allowed() {
  local label="$1"
  local cmd="$2"
  local output
  output=$(make_input "$cmd" | bash "$HOOK" 2>&1)
  local code=$?
  if [ "$code" -eq 0 ]; then
    echo "  PASS [allowed]   $label"
    PASS=$((PASS + 1))
  else
    echo "  FAIL [wrongly blocked] $label (exit=$code)"
    echo "    output: $output"
    FAIL=$((FAIL + 1))
  fi
}

echo "=== block-agent-escape.sh test suite ==="
echo ""
echo "--- Should be BLOCKED ---"

expect_blocked "unset CLAUDECODE" "unset CLAUDECODE"
expect_blocked "export CLAUDECODE=" "export CLAUDECODE="
expect_blocked "CLAUDECODE= command" "CLAUDECODE= some_command"
expect_blocked "CLAUDECODE=foo command" "CLAUDECODE=foo some_command"
expect_blocked "env -u CLAUDECODE command" "env -u CLAUDECODE some_command"
expect_blocked "python3 -c with CLAUDECODE" "python3 -c \"import os; os.environ.pop('CLAUDECODE')\""
expect_blocked "python -c with CLAUDECODE" "python -c \"os.environ['CLAUDECODE']=''\""
expect_blocked "perl -e with CLAUDECODE" "perl -e 'delete \$ENV{CLAUDECODE}'"
expect_blocked "node -e with CLAUDECODE" "node -e 'delete process.env.CLAUDECODE'"
expect_blocked "claude --agent" "claude --agent"
expect_blocked "npx claude" "npx claude"
expect_blocked "npm exec claude" "npm exec claude"
expect_blocked "full path /usr/local/bin/claude --agent" "/usr/local/bin/claude --agent"
expect_blocked "dollar(which claude)" '$(which claude) --agent'
expect_blocked "exec claude --agent" "exec claude --agent"
expect_blocked "cmd1 && claude --agent" "cmd1 && claude --agent"
expect_blocked "cmd1 | claude --agent" "cmd1 | claude --agent"

echo ""
echo "--- Should be ALLOWED ---"

expect_allowed "echo CLAUDECODE" "echo CLAUDECODE"
expect_allowed "git commit mentioning CLAUDECODE" "git commit -m 'fix CLAUDECODE issue'"
expect_allowed "npm run build" "npm run build"
expect_allowed "python3 script.py" "python3 script.py"
expect_allowed "grep claude file.txt" "grep claude file.txt"
expect_allowed "echo claude is great" "echo 'claude is great'"
expect_allowed "cat file with claude text" "cat README.md"

echo ""
echo "=== Results: $PASS passed, $FAIL failed ==="

if [ "$FAIL" -gt 0 ]; then
  exit 1
else
  exit 0
fi
