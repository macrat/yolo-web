#!/usr/bin/env bash
# Install memo-lint as a git pre-commit hook.
# If a pre-commit hook already exists, appends the memo-lint section.
# Safe to run multiple times (idempotent).

set -euo pipefail

HOOK_FILE=".git/hooks/pre-commit"
MARKER="# memo-lint-hook"

# Ensure hooks directory exists
mkdir -p .git/hooks

# Check if our hook is already installed
if [ -f "$HOOK_FILE" ] && grep -qF "$MARKER" "$HOOK_FILE"; then
  echo "memo-lint hook already installed in $HOOK_FILE"
  exit 0
fi

# If the hook file does not exist, create it with a shebang
if [ ! -f "$HOOK_FILE" ]; then
  printf '#!/usr/bin/env bash\n' > "$HOOK_FILE"
fi

# Append memo-lint section
cat >> "$HOOK_FILE" << 'EOF'

# memo-lint-hook
# Run memo-lint when memo/ files are staged
MEMO_STAGED=$(git diff --cached --name-only -- 'memo/' || true)
if [ -n "$MEMO_STAGED" ]; then
  echo "memo/ files staged — running memo-lint..."
  npm run memo-lint
fi
EOF

chmod +x "$HOOK_FILE"
echo "memo-lint hook installed in $HOOK_FILE"
