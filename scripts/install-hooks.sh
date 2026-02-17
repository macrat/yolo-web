#!/usr/bin/env bash
# Install pre-commit hooks: prettier format check + memo-lint.
# If a pre-commit hook already exists, replaces the managed section.
# Safe to run multiple times (idempotent).

set -euo pipefail

HOOK_FILE=".git/hooks/pre-commit"
MARKER="# yolo-web-hooks-v2"

# Ensure hooks directory exists
mkdir -p .git/hooks

# Check if our v2 hook is already installed
if [ -f "$HOOK_FILE" ] && grep -qF "$MARKER" "$HOOK_FILE"; then
  echo "pre-commit hooks already installed (v2) in $HOOK_FILE"
  exit 0
fi

# Write the full hook (overwrite any previous version)
cat > "$HOOK_FILE" << 'EOF'
#!/usr/bin/env bash
# yolo-web-hooks-v2
# Pre-commit hook: format check + memo-lint

# Run prettier on staged files (only file types prettier can handle)
STAGED=$(git diff --cached --name-only --diff-filter=ACM -- '*.ts' '*.tsx' '*.js' '*.jsx' '*.css' '*.json' '*.md' '*.yaml' '*.yml' || true)
if [ -n "$STAGED" ]; then
  echo "Running prettier format check on staged files..."
  echo "$STAGED" | xargs npx prettier --check 2>/dev/null
  if [ $? -ne 0 ]; then
    echo ""
    echo "ERROR: Prettier format check failed on staged files."
    echo "Run 'npx prettier --write <file>' to fix, then re-stage."
    exit 1
  fi
fi

# Run memo-lint when memo/ files are staged
MEMO_STAGED=$(git diff --cached --name-only -- 'memo/' || true)
if [ -n "$MEMO_STAGED" ]; then
  echo "memo/ files staged — running memo-lint..."
  npm run memo-lint
fi
EOF

chmod +x "$HOOK_FILE"
echo "pre-commit hooks installed (v2) in $HOOK_FILE"
