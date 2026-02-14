#!/bin/bash

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command')

# Only intercept git commit commands
if ! echo "$COMMAND" | grep -q "git commit"; then
  exit 0
fi

CWD=$(echo "$INPUT" | jq -r '.cwd')
cd "$CWD" || exit 0

# Run format check
FORMAT_OUTPUT=$(npm run format:check 2>&1)
FORMAT_EXIT=$?

if [ $FORMAT_EXIT -ne 0 ]; then
  echo "Prettier format check failed. Run 'npx prettier --write .' to fix." >&2
  echo "$FORMAT_OUTPUT" >&2
  exit 2
fi

# Run lint check
LINT_OUTPUT=$(npm run lint 2>&1)
LINT_EXIT=$?

if [ $LINT_EXIT -ne 0 ]; then
  echo "ESLint check failed. Fix lint errors before committing." >&2
  echo "$LINT_OUTPUT" >&2
  exit 2
fi

# Run tests
TEST_OUTPUT=$(npm test 2>&1)
TEST_EXIT=$?

if [ $TEST_EXIT -ne 0 ]; then
  echo "Tests failed. Fix failing tests before committing." >&2
  echo "$TEST_OUTPUT" >&2
  exit 2
fi

exit 0
