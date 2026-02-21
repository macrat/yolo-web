#!/bin/bash

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command')

# Only intercept git push commands
if ! echo "$COMMAND" | grep -q "git push"; then
  exit 0
fi

CWD=$(echo "$INPUT" | jq -r '.cwd')
cd "$CWD" || exit 0

FAILED=0

# Run lint check
echo "Running lint check..." >&2
LINT_OUTPUT=$(npm run lint 2>&1)
LINT_EXIT=$?

if [ $LINT_EXIT -ne 0 ]; then
  echo "ESLint check failed." >&2
  echo "$LINT_OUTPUT" >&2
  FAILED=1
fi

# Run format check
echo "Running format check..." >&2
FORMAT_OUTPUT=$(npm run format:check 2>&1)
FORMAT_EXIT=$?

if [ $FORMAT_EXIT -ne 0 ]; then
  echo "Prettier format check failed." >&2
  echo "$FORMAT_OUTPUT" >&2
  FAILED=1
fi

# Run tests
echo "Running tests..." >&2
TEST_OUTPUT=$(npm test 2>&1)
TEST_EXIT=$?

if [ $TEST_EXIT -ne 0 ]; then
  echo "Tests failed." >&2
  echo "$TEST_OUTPUT" >&2
  FAILED=1
fi

# Run build
echo "Running build..." >&2
BUILD_OUTPUT=$(npm run build 2>&1)
BUILD_EXIT=$?

if [ $BUILD_EXIT -ne 0 ]; then
  echo "Build failed." >&2
  echo "$BUILD_OUTPUT" >&2
  FAILED=1
fi

if [ $FAILED -ne 0 ]; then
  echo "Fix all issues and push again" >&2
  exit 2
fi

exit 0
