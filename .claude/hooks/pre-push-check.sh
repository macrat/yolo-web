#!/bin/bash

# pre-push-check.sh (PreToolUse hook / matcher: Bash)
# push 前にレビューの実施を確認し、フルスイート
# (format:check / lint / typecheck / test / build / test:build) を独立に再実行する。
# test:build はビルド生成物 (.next/) を読むテストなので build の後に置く。
# コミット時のチェック (pre-commit-check.sh) は変更ファイル限定の高速版なので、
# リポジトリ全体の整合はここで保証する。
#
# このフックはサブエージェントの「全チェックPASS」という自己申告を信用しない。
# 実際にコマンドを再実行して exit code で判定する (旧AP-WF16をフックへ移管・強制化)。
# 同じ理由で、レビューを実施したという PM の自己申告も信用しない。record-review.sh が
# 残した reviewer の起動記録を条件にする (AP-WF01 をフックへ移管・強制化)。
# main への push はそのまま公開なので、レビューを経ていないものが来訪者に届く。

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command')

# Only intercept git push commands
if ! echo "$COMMAND" | grep -q "git push"; then
  exit 0
fi

CWD=$(echo "$INPUT" | jq -r '.cwd')
cd "$CWD" || exit 0

REVIEW_MARKER="tmp/.review-marker"

if [ ! -f "$REVIEW_MARKER" ]; then
  cat >&2 << 'EOF'
[BLOCKED] 前回の push 以降、reviewer エージェントが一度も起動されていません (AP-WF01)。

main への push はそのまま公開です。レビューを経ていないものを出荷することはできません。

reviewer エージェントに今回の変更をレビューさせ、指摘に対応してから push しなおしてください。
「元に戻すだけ」「ドキュメントだけ」「ゲートも CI も緑」は、いずれもレビューを省く理由に
なりません。ゲートが見るのは動くかどうかであって、判断の妥当性でも記録の正確性でもありません。
EOF
  exit 2
fi

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
run_check "build output" npm run test:build

# 次の push は、次のレビューを待つ。
rm -f "$REVIEW_MARKER"

exit 0
