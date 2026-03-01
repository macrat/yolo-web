#!/bin/bash
#
# PreToolUse hook: Protect constitution.md from Edit/Write tools
#
# This hook blocks any Edit or Write operation targeting constitution.md.
# It works even when bypassPermissions is enabled, providing a reliable
# protection layer for the project's most important file.
#
# Design note: We intentionally match broadly on any file path containing
# "constitution.md" (not just /docs/constitution.md). This is a deliberate
# safety-side decision to prevent circumvention via path traversal or
# renaming tricks. The trade-off is that files like "my-constitution.md.bak"
# would also be blocked, but this is acceptable given the critical nature
# of the protection target.

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# If no file_path in the input, allow the operation
if [ -z "$FILE_PATH" ]; then
  exit 0
fi

# Check if the file path contains "constitution.md"
# Uses case-insensitive matching for additional safety
if echo "$FILE_PATH" | grep -qi "constitution\.md"; then
  echo "BLOCKED: constitution.md is protected and cannot be modified via Edit/Write tools. This file is the project's highest-priority rule set and must remain unchanged." >&2
  exit 2
fi

# Also check using basename for normalized path comparison
BASENAME=$(basename "$FILE_PATH")
if echo "$BASENAME" | grep -qi "constitution\.md"; then
  echo "BLOCKED: constitution.md is protected and cannot be modified via Edit/Write tools. This file is the project's highest-priority rule set and must remain unchanged." >&2
  exit 2
fi

exit 0
