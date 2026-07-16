#!/bin/bash

# pre-push-check.sh (PreToolUse hook / matcher: Bash)
# push 前にフルスイート (format:check / lint / typecheck / test / build) を独立に再実行する。
# コミット時のチェック (pre-commit-check.sh) は変更ファイル限定の高速版なので、
# リポジトリ全体の整合はここで保証する。
#
# このフックはサブエージェントの「全チェックPASS」という自己申告を信用しない。
# 実際にコマンドを再実行して exit code で判定する (旧AP-WF16をフックへ移管・強制化)。

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command')

# Only intercept git push commands
if ! echo "$COMMAND" | grep -q "git push"; then
  exit 0
fi

CWD=$(echo "$INPUT" | jq -r '.cwd')
cd "$CWD" || exit 0

run_check() {
  local name="$1"
  shift
  echo "Running $name..." >&2
  local output
  output=$("$@" 2>&1)
  if [ $? -ne 0 ]; then
    echo "$name failed." >&2
    echo "$output" >&2
    echo "Fix all issues and push again" >&2
    exit 2
  fi
}

run_check "format check" npm run format:check
run_check "lint" npm run lint
run_check "typecheck" npm run typecheck
run_check "test" npm test
run_check "build" npm run build

exit 0
