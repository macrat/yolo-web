#!/usr/bin/env bash
# Install pre-commit hooks: prettier format check + eslint + tsc.
# If a pre-commit hook already exists, replaces the managed section.
# Safe to run multiple times (idempotent).

set -euo pipefail

HOOK_FILE=".git/hooks/pre-commit"
MARKER="# yolo-web-hooks-v4"

# Ensure hooks directory exists
mkdir -p .git/hooks

# Check if our v4 hook is already installed
if [ -f "$HOOK_FILE" ] && grep -qF "$MARKER" "$HOOK_FILE"; then
  echo "pre-commit hooks already installed (v4) in $HOOK_FILE"
  exit 0
fi

# Write the full hook (overwrite any previous version)
cat > "$HOOK_FILE" << 'EOF'
#!/usr/bin/env bash
# yolo-web-hooks-v4
# Pre-commit hook: prettier format check + eslint + tsc type check

# --- 1. Prettier format check on staged files ---
PRETTIER_FILES=()
while IFS= read -r -d '' file; do
  PRETTIER_FILES+=("$file")
done < <(git -c core.quotePath=false diff -z --cached --name-only --diff-filter=ACM -- '*.ts' '*.tsx' '*.js' '*.jsx' '*.css' '*.json' '*.md' '*.yaml' '*.yml' || true)

if [ ${#PRETTIER_FILES[@]} -gt 0 ]; then
  echo "Running prettier format check on staged files..."
  if ! printf '%s\n' "${PRETTIER_FILES[@]}" | xargs -d '\n' npx prettier --check 2>/dev/null; then
    echo ""
    echo "ERROR: Prettier format check failed on staged files."
    echo "Run 'npx prettier --write <file>' to fix, then re-stage."
    exit 1
  fi
fi

# --- 2. ESLint check on staged JS/TS files ---
ESLINT_FILES=()
while IFS= read -r -d '' file; do
  ESLINT_FILES+=("$file")
done < <(git -c core.quotePath=false diff -z --cached --name-only --diff-filter=ACM -- '*.ts' '*.tsx' '*.js' '*.jsx' || true)

if [ ${#ESLINT_FILES[@]} -gt 0 ]; then
  echo "Running eslint on staged files..."
  if ! printf '%s\n' "${ESLINT_FILES[@]}" | xargs -d '\n' npx eslint --max-warnings 0; then
    echo ""
    echo "ERROR: ESLint check failed on staged files."
    echo "Run 'npm run lint:fix' to auto-fix, then re-stage."
    exit 1
  fi
fi

# --- 3. TypeScript type check (project-wide) ---
echo "Running TypeScript type check..."
if ! npx tsc --noEmit; then
  echo ""
  echo "ERROR: TypeScript type check failed."
  echo "Fix the type errors above, then re-stage."
  exit 1
fi
EOF

chmod +x "$HOOK_FILE"
echo "pre-commit hooks installed (v4) in $HOOK_FILE"
