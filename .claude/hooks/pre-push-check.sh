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
