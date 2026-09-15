#!/bin/bash

# record-review.sh (PostToolUse hook / matcher: Agent)
# reviewer エージェントの起動を記録する。
#
# pre-push-check.sh はこの記録の有無を push の条件にする。記録が無ければ push は通らず、
# push が成功すると記録は消える。したがって「前回の出荷以降に一度もレビューを掛けていない」
# 状態では出荷できない (AP-WF01 をチェックリストからフックへ移管)。
#
# この歯止めが保証するのは実施の有無だけである。レビューの中身が妥当か、指摘に対応したかは
# 機械には測れない。それらは PM が負う。

INPUT=$(cat)
SUBAGENT=$(echo "$INPUT" | jq -r '.tool_input.subagent_type // empty' 2>/dev/null)
[ "$SUBAGENT" = "reviewer" ] || exit 0

ROOT="${CLAUDE_PROJECT_DIR:-$(echo "$INPUT" | jq -r '.cwd' 2>/dev/null)}"
[ -d "$ROOT" ] || exit 0
cd "$ROOT" || exit 0

mkdir -p tmp
date -u '+%Y-%m-%dT%H:%M:%SZ' >tmp/.review-marker
exit 0
