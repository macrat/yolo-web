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
# 後で /proc/PID/cwd と文字列比較するので、実体パスに正規化しておく。
CWD=$(pwd -P)

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
# 孫の next-server が生き残り、ポートを掴んだままになる。
#
# グループを特定するのに `setsid` の `$!` は使えない。`setsid` が fork するか
# どうかは呼び出し文脈で変わり、fork した場合の `$!` はセッションリーダーでは
# ない (cycle-302 で両方の挙動を実測した)。子自身に `echo $$` で名乗らせる。
SERVER_PGID=""
SERVER_LAUNCHER_PID=""
E2E_PID_FILE=""
E2E_SERVER_LOG=""
E2E_STATE_FILE=""
E2E_PORT=""

# 取り残したサーバを次の実行で回収するための記録置き場。
# `kill -KILL` で落とされる経路は trap では原理的に塞げないので、
# 「落ちた後に取り戻す」側で塞ぐ。
E2E_STATE_DIR="$CWD/tmp/pre-push-e2e"

# --- /proc を読むだけのプロセス照会 -------------------------------------
# この環境には ss / lsof / fuser が無く、ポートから持ち主を引く手段がないため、
# すべて /proc で解決する (awk は mawk なので strtonum は使えない。16進のまま比べる)。
# /proc/PID/stat の comm は括弧で囲まれ空白を含みうるので、最後の ") " より
# 後ろを読む。そこから先は state(1) ppid(2) pgrp(3) session(4) ... starttime(20)。

proc_stat_rest() {
  local line
  line=$(cat "/proc/$1/stat" 2>/dev/null) || return 1
  printf '%s' "${line##*) }"
}

proc_ppid() {
  local rest
  rest=$(proc_stat_rest "$1") || return 1
  set -- $rest
  printf '%s' "$2"
}

proc_pgid() {
  local rest
  rest=$(proc_stat_rest "$1") || return 1
  set -- $rest
  printf '%s' "$3"
}

proc_sid() {
  local rest
  rest=$(proc_stat_rest "$1") || return 1
  set -- $rest
  printf '%s' "$4"
}

proc_starttime() {
  local rest
  rest=$(proc_stat_rest "$1") || return 1
  set -- $rest
  printf '%s' "${20}"
}

# 指定ポートを LISTEN しているプロセスの PID を列挙する。
# /proc/net/tcp{,6} の st=0A が LISTEN。inode を /proc/PID/fd の
# socket:[inode] と突き合わせる。
listening_pids() {
  local port_hex inodes pid fd target inode
  port_hex=$(printf '%04X' "$1")
  inodes=$(awk -v ph="$port_hex" '$4=="0A" {split($2,a,":"); if (a[2]==ph) print $10}' \
    /proc/net/tcp /proc/net/tcp6 2>/dev/null)
  [ -n "$inodes" ] || return 0
  for pid in /proc/[0-9]*; do
    pid=${pid#/proc/}
    for fd in /proc/"$pid"/fd/*; do
      target=$(readlink "$fd" 2>/dev/null) || continue
      case "$target" in
        socket:\[*\]) inode=${target#socket:[}; inode=${inode%]} ;;
        *) continue ;;
      esac
      if printf '%s\n' "$inodes" | grep -qx "$inode"; then
        printf '%s\n' "$pid"
        break
      fi
    done
  done
}

# 枯渇時や横取り時の診断。「ps -ef | grep next-server を見ろ」だと、
# 居座っているのが next 以外のとき (例: python3 -m http.server) に外れるので、
# 実際に掴んでいるプロセスを直接出す。
describe_port_holders() {
  local port="$1" pid found=0
  for pid in $(listening_pids "$port"); do
    found=1
    echo "  pid=$pid pgid=$(proc_pgid "$pid") sid=$(proc_sid "$pid")" \
      "cwd=$(readlink -f "/proc/$pid/cwd" 2>/dev/null)" \
      "cmd=$(tr '\0' ' ' <"/proc/$pid/cmdline" 2>/dev/null)" >&2
  done
  if [ "$found" = 0 ]; then
    echo "  (ポート $port を LISTEN しているプロセスは見つかりませんでした)" >&2
  fi
}

# --- ポートの確保 -------------------------------------------------------
# 固定5ポートのプールはやめた。`kill -KILL` でフックが落ちるとそのポートは
# 取り戻せず、5回強制終了されればプールが尽きて push そのものが止まる
# ——「回復不能な資源」になってしまう。無作為なポートなら1つ漏れても枯れない。
# 20000-29999 はカーネルの ephemeral 範囲 (既定 32768-60999) の外なので、
# 他プロセスの outgoing socket に横取りされることもない。
#
# 採らなかった案: 「固定プールのままポートごとに PGID ファイルを置いて回収する」。
# 回収の仕組みとしては成立するが、資源が有限であることは変わらず、記録が壊れた
# 一回で枯渇に戻る (記録の書き込み前に SIGKILL されればそのポートは永久に失われる)。
# 「枯れない」ほうが「丁寧に回収する」より強いので、無作為ポートを土台にした。
# ただし PGID の記録自体は有用なので、枯渇対策ではなく孤児の回収用に併用する
# (reap_orphan_servers)。記録を失っても次の実行は別のポートを取れるだけで、詰まない。
find_free_port() {
  local attempt port
  for attempt in $(seq 1 50); do
    port=$((20000 + RANDOM % 10000))
    if ! (exec 3<>"/dev/tcp/127.0.0.1/$port") 2>/dev/null; then
      printf '%s' "$port"
      return 0
    fi
  done
  return 1
}

# --- 後片付け -----------------------------------------------------------

kill_group() {
  local pgid="$1" i
  [ -n "$pgid" ] || return 0
  kill -TERM -- "-$pgid" 2>/dev/null
  for i in $(seq 1 20); do
    kill -0 -- "-$pgid" 2>/dev/null || return 0
    sleep 0.5
  done
  kill -KILL -- "-$pgid" 2>/dev/null
}

# PGID が分からないときのフォールバック。/proc の ppid を辿って子孫を集める。
descendant_pids() {
  local parent="$1" f rest child
  for f in /proc/[0-9]*/stat; do
    rest=$(cat "$f" 2>/dev/null) || continue
    rest=${rest##*) }
    set -- $rest
    if [ "$2" = "$parent" ]; then
      child=${f#/proc/}
      child=${child%/stat}
      printf '%s\n' "$child"
      descendant_pids "$child"
    fi
  done
}

kill_tree() {
  local pid="$1" targets p
  [ -n "$pid" ] || return 0
  targets="$pid $(descendant_pids "$pid" | tr '\n' ' ')"
  for p in $targets; do kill -TERM "$p" 2>/dev/null; done
  sleep 1
  for p in $targets; do kill -KILL "$p" 2>/dev/null; done
}

# このフックが立てたサーバか。無作為に選んだポートを掴んでいて、かつ作業
# ディレクトリがこのリポジトリなら、それは我々のもの。
is_our_process() {
  [ "$(readlink -f "/proc/$1/cwd" 2>/dev/null)" = "$CWD" ]
}

stop_e2e_server() {
  if [ -n "$SERVER_PGID" ]; then
    kill_group "$SERVER_PGID"
    SERVER_PGID=""
  else
    # PGID を特定できないまま抜ける経路。ここを空振りさせると、起動した
    # ばかりのサーバがポートを掴んだまま残る (以前の exit 2 がまさにそれ)。
    # 起動側の子孫を辿り、さらにポートを掴んでいるプロセスのうち
    # このリポジトリのものを、そのグループごと落とす。
    if [ -n "$SERVER_LAUNCHER_PID" ]; then
      kill_tree "$SERVER_LAUNCHER_PID"
    fi
    if [ -n "$E2E_PORT" ]; then
      local pid
      for pid in $(listening_pids "$E2E_PORT"); do
        if is_our_process "$pid"; then
          kill_group "$(proc_pgid "$pid")"
        fi
      done
    fi
  fi
  SERVER_LAUNCHER_PID=""
  E2E_PORT=""
  [ -n "$E2E_PID_FILE" ] && rm -f "$E2E_PID_FILE"
  E2E_PID_FILE=""
  [ -n "$E2E_SERVER_LOG" ] && rm -f "$E2E_SERVER_LOG"
  E2E_SERVER_LOG=""
  [ -n "$E2E_STATE_FILE" ] && rm -f "$E2E_STATE_FILE"
  E2E_STATE_FILE=""
  return 0
}

# EXIT はどの経路で抜けても後片付けする。
# INT / TERM は別に張る。bash の trap ハンドラは戻ると中断地点の続きを実行して
# しまうので、ハンドラの中で exit まで書かないと (a) 外から止められず、
# (b) 待ち合わせループを最後まで回してから「サーバが起動しませんでした」と、
# 利用者の中断を起動失敗にすり替えて報告する。
trap 'stop_e2e_server' EXIT
trap 'stop_e2e_server; echo "中断されました (SIGINT)。" >&2; exit 130' INT
trap 'stop_e2e_server; echo "中断されました (SIGTERM)。" >&2; exit 143' TERM

# 前回の実行が SIGKILL などで落ちて残したサーバを回収する。
# 走っているフック自身のものは殺さない (同時 push を壊さないため)。記録した
# PID が生きていて starttime も一致するなら、そのフックは現役とみなす。
reap_orphan_servers() {
  local f hook_pid hook_start pgid port old_pid_file old_log
  for f in "$E2E_STATE_DIR"/*.server; do
    [ -f "$f" ] || continue
    {
      read -r hook_pid hook_start pgid port
      read -r old_pid_file
      read -r old_log
    } <"$f" || continue
    if [ -n "$hook_pid" ] && [ "$(proc_starttime "$hook_pid" 2>/dev/null)" = "$hook_start" ]; then
      continue
    fi
    # PID が再利用されている可能性があるので、グループリーダーが本当に
    # このリポジトリのプロセスかを確かめてから落とす。
    if [ -n "$pgid" ] && kill -0 -- "-$pgid" 2>/dev/null && is_our_process "$pgid"; then
      echo "前回の実行が残したサーバを回収します (pgid $pgid / port $port)。" >&2
      kill_group "$pgid"
    fi
    # SIGKILL では trap が走らないので mktemp も残る。記録から辿って消す。
    # 壊れた記録で無関係なファイルを消さないよう、mktemp の名前だけを対象にする。
    remove_if_mktemp "$old_pid_file"
    remove_if_mktemp "$old_log"
    rm -f "$f"
  done
}

remove_if_mktemp() {
  case "${1##*/}" in
    tmp.??????????) [ -f "$1" ] && rm -f "$1" ;;
  esac
  return 0
}

run_e2e() {
  mkdir -p "$E2E_STATE_DIR"
  reap_orphan_servers

  local port
  port=$(find_free_port)
  if [ -z "$port" ]; then
    echo "e2e failed: 空きポートを確保できませんでした (20000-29999 を50回試行)。" >&2
    exit 2
  fi

  echo "Running e2e (port $port)..." >&2
  E2E_PID_FILE=$(mktemp)
  # ログは固定パスにしない。固定だと同時実行で互いに上書きし、消し忘れも残る。
  E2E_SERVER_LOG=$(mktemp)
  E2E_PORT=$port
  # 子が自分のセッションリーダー PID を名乗る。これがプロセスグループ ID になる。
  setsid bash -c 'echo $$ >"$1"; exec npx next start -p "$2"' _ \
    "$E2E_PID_FILE" "$port" >"$E2E_SERVER_LOG" 2>&1 &
  SERVER_LAUNCHER_PID=$!

  local i
  for i in $(seq 1 75); do
    SERVER_PGID=$(cat "$E2E_PID_FILE" 2>/dev/null)
    [ -n "$SERVER_PGID" ] && break
    sleep 0.2
  done
  if [ -z "$SERVER_PGID" ]; then
    echo "e2e failed: サーバのプロセスグループを特定できませんでした。" >&2
    echo "起動側 (pid $SERVER_LAUNCHER_PID) の子孫とポート $port の占有プロセスを落とします:" >&2
    describe_port_holders "$port"
    tail -20 "$E2E_SERVER_LOG" >&2
    # SERVER_PGID が空でも EXIT trap のフォールバックが落とす。
    exit 2
  fi

  # 回収用の記録。SIGKILL で落ちても次の実行がこれを見て取り戻す。
  E2E_STATE_FILE="$E2E_STATE_DIR/$$.server"
  printf '%s %s %s %s\n%s\n%s\n' "$$" "$(proc_starttime $$)" "$SERVER_PGID" "$port" \
    "$E2E_PID_FILE" "$E2E_SERVER_LOG" >"$E2E_STATE_FILE"

  for i in $(seq 1 60); do
    curl -sf -o /dev/null "http://localhost:$port/" && break
    sleep 1
  done
  if ! curl -sf -o /dev/null "http://localhost:$port/"; then
    echo "e2e failed: サーバが起動しませんでした。" >&2
    describe_port_holders "$port"
    tail -20 "$E2E_SERVER_LOG" >&2
    exit 2
  fi

  # 空きポートの探索から bind までには窓がある (実測 約3秒)。その窓に別の push が
  # 重なると、敗者の curl は勝者のビルドに通り、無関係な PASS / FAIL を返す。
  # 起動ログの EADDRINUSE と、実際にポートを掴んでいるのが自分のセッションかで塞ぐ。
  if grep -q "EADDRINUSE" "$E2E_SERVER_LOG"; then
    echo "e2e failed: ポート $port は別のプロセスに先に取られました (EADDRINUSE)。" >&2
    describe_port_holders "$port"
    exit 2
  fi
  local holder owned=0
  for holder in $(listening_pids "$port"); do
    # setsid で作った新セッションなので、子孫はプロセスグループを変えても
    # セッション ID は SERVER_PGID のまま。どちらかが一致すれば自分のもの。
    if [ "$(proc_pgid "$holder")" = "$SERVER_PGID" ] ||
      [ "$(proc_sid "$holder")" = "$SERVER_PGID" ]; then
      owned=1
    fi
  done
  if [ "$owned" != 1 ]; then
    echo "e2e failed: ポート $port を掴んでいるのは、このフックが起動したサーバではありません。" >&2
    describe_port_holders "$port"
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
