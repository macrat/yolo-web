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

# e2e は本番ビルドを実際に配信して実ブラウザで測る。
# ここに置くのは、CSS だけで成り立つ挙動 (ブログ本文の表の列ごとの床・
# シェアボタンの物理サイズ) が vitest では原理的に見えないため。
# vitest.config.mts は tests/e2e を除外しているので npm test では走らない。
#
# 空きポートを探してから起動すること。使用中のポートで起動に失敗すると、
# そこに居座っている別の (古い) ビルドに対して測定が走り、
# 無関係な PASS / FAIL を返す (cycle-302 で実際に起きた)。
#
# サーバは必ずプロセスグループごと落とすこと。`npx next start` は
# npx -> sh -c -> next-server の3段になるので、`$!` (= npx) を kill しても
# 孫の next-server が生き残り、ポートを掴んだままになる。実行のたびに
# ポートが1つ失われ、5回目には空きが尽きて push そのものが止まる。
#
# グループを特定するのに `setsid` の `$!` は使えない。`setsid` が fork するか
# どうかは呼び出し文脈で変わり、fork した場合の `$!` はセッションリーダーでは
# ない (cycle-302 で両方の挙動を実測した)。子自身に `echo $$` で名乗らせる。
SERVER_PGID=""
E2E_PID_FILE=""

stop_e2e_server() {
  if [ -n "$SERVER_PGID" ]; then
    kill -TERM -- "-$SERVER_PGID" 2>/dev/null
    local i
    for i in $(seq 1 20); do
      kill -0 -- "-$SERVER_PGID" 2>/dev/null || break
      sleep 0.5
    done
    kill -KILL -- "-$SERVER_PGID" 2>/dev/null
    SERVER_PGID=""
  fi
  [ -n "$E2E_PID_FILE" ] && rm -f "$E2E_PID_FILE"
  E2E_PID_FILE=""
}

# どの経路で抜けても後片付けする (途中の exit・失敗・中断を含む)。
trap stop_e2e_server EXIT INT TERM

run_e2e() {
  local port
  for port in 3901 3902 3903 3904 3905; do
    if ! (exec 3<>"/dev/tcp/127.0.0.1/$port") 2>/dev/null; then break; fi
    port=""
  done
  if [ -z "$port" ]; then
    echo "e2e failed: 3901-3905 がすべて使用中で、空きポートを確保できません。" >&2
    echo "ポートを掴んだままのサーバが残っている可能性があります: ps -ef | grep next-server" >&2
    exit 2
  fi

  echo "Running e2e (port $port)..." >&2
  E2E_PID_FILE=$(mktemp)
  # 子が自分のセッションリーダー PID を名乗る。これがプロセスグループ ID になる。
  setsid bash -c 'echo $$ >"$1"; exec npx next start -p "$2"' _ \
    "$E2E_PID_FILE" "$port" >/tmp/pre-push-e2e-server.log 2>&1 &

  local i
  for i in $(seq 1 30); do
    SERVER_PGID=$(cat "$E2E_PID_FILE" 2>/dev/null)
    [ -n "$SERVER_PGID" ] && break
    sleep 0.2
  done
  if [ -z "$SERVER_PGID" ]; then
    echo "e2e failed: サーバのプロセスグループを特定できませんでした。" >&2
    exit 2
  fi

  for i in $(seq 1 60); do
    curl -sf -o /dev/null "http://localhost:$port/" && break
    sleep 1
  done
  if ! curl -sf -o /dev/null "http://localhost:$port/"; then
    echo "e2e failed: サーバが起動しませんでした。" >&2
    tail -20 /tmp/pre-push-e2e-server.log >&2
    exit 2
  fi

  local output
  output=$(E2E_BASE_URL="http://localhost:$port" npm run test:e2e 2>&1)
  local code=$?
  stop_e2e_server

  if [ $code -ne 0 ]; then
    echo "e2e failed." >&2
    echo "$output" >&2
    echo "Fix all issues and push again" >&2
    exit 2
  fi
}

run_e2e

exit 0
