#!/bin/bash
#
# PreToolUse hook: Protect constitution.md from Bash write commands
#
# This hook blocks Bash commands that would modify constitution.md.
# Read-only operations (cat, head, tail, grep, less, diff, wc, etc.) are allowed.
# Write operations (cp, mv, sed -i, tee, redirects, rm, etc.) are blocked.
#
# This complements protect-constitution.sh (which covers Edit/Write tools)
# to provide multi-layer defense for the project's most important file.

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# If no command, allow
if [ -z "$COMMAND" ]; then
  exit 0
fi

# Only check commands that reference constitution.md
if ! echo "$COMMAND" | grep -qi "constitution\.md"; then
  exit 0
fi

# Allow read-only commands that reference constitution.md
# These patterns match commands that only read the file
# cat, head, tail, less, more, grep, rg, diff, wc, file, stat, md5sum, sha256sum
if echo "$COMMAND" | grep -qiE "^[[:space:]]*(cat|head|tail|less|more|grep|rg|egrep|fgrep|diff|wc|file|stat|md5sum|sha256sum|ls)\b"; then
  # Even for read commands, block if they include redirect operators that could overwrite
  if echo "$COMMAND" | grep -qE ">[^>]|>>"; then
    echo "BLOCKED: constitution.md is protected. Writing to or modifying this file via Bash is not allowed." >&2
    exit 2
  fi
  exit 0
fi

# Block known write/modify patterns targeting constitution.md
# cp, mv, rm, sed -i, tee, chmod, chown, truncate, dd, install
BLOCKED=0

# Redirect operators (> or >>) with constitution.md as target
if echo "$COMMAND" | grep -qiE ">\s*[\"']?[^|]*constitution\.md"; then
  BLOCKED=1
fi

# cp/mv/install with constitution.md as a potential target
if echo "$COMMAND" | grep -qiE "\b(cp|mv|install)\b.*constitution\.md"; then
  BLOCKED=1
fi

# rm targeting constitution.md
if echo "$COMMAND" | grep -qiE "\brm\b.*constitution\.md"; then
  BLOCKED=1
fi

# sed with -i flag (in-place edit) and constitution.md
if echo "$COMMAND" | grep -qiE "\bsed\b.*-[a-z]*i.*constitution\.md|sed\b.*constitution\.md.*-[a-z]*i"; then
  BLOCKED=1
fi

# tee writing to constitution.md
if echo "$COMMAND" | grep -qiE "\btee\b.*constitution\.md"; then
  BLOCKED=1
fi

# chmod/chown on constitution.md
if echo "$COMMAND" | grep -qiE "\b(chmod|chown)\b.*constitution\.md"; then
  BLOCKED=1
fi

# truncate on constitution.md
if echo "$COMMAND" | grep -qiE "\btruncate\b.*constitution\.md"; then
  BLOCKED=1
fi

# dd writing to constitution.md
if echo "$COMMAND" | grep -qiE "\bdd\b.*of=.*constitution\.md"; then
  BLOCKED=1
fi

# echo/printf with redirect to constitution.md
if echo "$COMMAND" | grep -qiE "\b(echo|printf)\b.*>.*constitution\.md"; then
  BLOCKED=1
fi

# python/node/ruby/perl one-liners that might write to constitution.md
if echo "$COMMAND" | grep -qiE "\b(python|python3|node|ruby|perl)\b.*constitution\.md"; then
  # Only block if it looks like a write operation (open with 'w', write, etc.)
  if echo "$COMMAND" | grep -qiE "(open|write|>|>>).*constitution\.md|constitution\.md.*(open|write|>|>>)"; then
    BLOCKED=1
  fi
fi

# Generic redirect to constitution.md (catch-all)
if echo "$COMMAND" | grep -qiE ">\s*\S*constitution\.md"; then
  BLOCKED=1
fi

if [ $BLOCKED -eq 1 ]; then
  echo "BLOCKED: constitution.md is protected. Writing to, modifying, moving, or deleting this file via Bash is not allowed. Read-only operations (cat, grep, diff, etc.) are permitted." >&2
  exit 2
fi

# For any other command referencing constitution.md that we haven't explicitly
# categorized, we allow it but log a warning. This avoids false positives while
# maintaining awareness.
exit 0
