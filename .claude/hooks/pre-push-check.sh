#!/bin/bash

# pre-push-check.sh (PreToolUse hook / matcher: Bash)
# push 前にフルスイート (format:check / lint / typecheck / test / build) と
# e2e (本番ビルドを実際に配信して実ブラウザで測る) を独立に再実行する。
# 実測で通しの所要時間は約7分。
# コミット時のチェック (pre-commit-check.sh) は変更ファイル限定の高速版なので、
# リポジトリ全体の整合はここで保証する。
#
# このフックはサブエージェントの「全チェックPASS」という自己申告を信用しない。
# 実際にコマンドを再実行して exit code で判定する (旧AP-WF16をフックへ移管・強制化)。

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command')

# push だけを傍受する。素朴な `grep -q "git push"` は両側に外れていた:
#   - 素通り: `git  push` (空白2つ) / `git -C /path push` — チェックなしで push できてしまう
#   - 誤爆:   `echo "remember to git push"` — 無関係なコマンドで全チェック (約7分) を回す
#
# 一発の正規表現では直せない。複数行のコマンド (`cd x` 改行 `git push`) や
# `for ... do git push; done` を数えると、区切りの列挙がすぐ破綻する。
# 隣の block-destructive-git.sh が同じ問題 (複合コマンドの中の git を見つける) を
# 分解で解いているので、同じ手順を踏む: heredoc を除く → 区切りと改行で
# サブコマンドに割る → 各サブコマンドの先頭が git か見る。
#
# まず安いふるいで落とす (本判定は下の is_git_push)。push という語が無ければ
# 確実に対象外なので、大多数の Bash 呼び出しはここで抜ける。
if ! printf '%s' "$COMMAND" | grep -q "push"; then
  exit 0
fi

# heredoc の中身は実行されない。`cat > doc.md <<EOF ... git push ... EOF` を
# 傍受しないよう先に落とす (block-destructive-git.sh と同じ perl)。
# あわせて行継続 (バックスラッシュ + 改行) を繋ぐ。繋がないと `git \` の直後で
# 語が切れ、`git \`+改行+`push` を取りこぼす。
remove_heredocs() {
  perl -0777 -pe '
    while (s/<<[-~]?\s*'\''?"?(\w+)"?'\''?[^\n]*\n.*?\n\s*\1\s*$//ms) {}
    s/\\\n\s*/ /g;
  '
}

# 区切り (; && || | &) を改行に均す。元からの改行はそのまま行の区切りになる。
# `&&` を先に潰してから単独の `&` を見る (順序が逆だと `&&` が二重に割れる)。
# block-destructive-git.sh の区切り集合 (|| && ; |) に `&` を足したもの。
#
# `$(` も区切りに入れる (`out=$(git push)` を捕まえるため)。ただし「$( は必ず
# コマンド文脈を開くから正しい」ではない——単一引用符の中や `\$(` では開かない。
# つまりこれは意図的な過剰傍受で、代償は下の `&` と同じクラス:
#   `git commit -m 'TODO: $(git push) を実行'` は誤爆する。
#
# 裸の `(` とバッククォートは区切りに入れない。こちらを入れると
# `git commit -m "hook: \`git push\` を直した"` のような日常のコミットメッセージ
# まで誤爆するので、頻度が釣り合わない。サブシェルの `( git push )` は区切り
# ではなく語の端の括弧を落とすことで捕まえる (下の is_git_push)。
#
# 取りこぼすと分かっている形 (いずれも main の `grep -q "git push"` でも
# 取りこぼしていたので後退ではない。検体は tmp の試験集に入れてある):
#   - `` `git push` `` (バッククォート)
#   - 置換が push より前に来る形。`$(` で割ると語の途中で切れるため。
#     `git -C $(pwd) push` / `git --git-dir=$(pwd)/.git push` /
#     `GIT_SSH_COMMAND=$(which ssh) git push`
#
# `&` を区切りに足したぶん `git commit -m "wip & git push も直す"` も誤爆する。
# 誤爆の代償は「空振り7分」では済まない: チェックが赤ければフックは exit 2 で
# その無関係なコマンド (典型的には git commit) 自体を止め、push 前提の文言を出す。
split_commands() {
  printf '%s\n' "$1" | sed -E 's/\$\(/\n/g; s/\s*\|\|\s*/\n/g; s/\s*&&\s*/\n/g; s/\s*;\s*/\n/g; s/\s*\|\s*/\n/g; s/\s*&\s*/\n/g'
}

# 変数代入の値は引用符で囲まれていて空白を含みうる (GIT_SSH_COMMAND="ssh -v")。
# 剥がす前に引用符を外すと値の途中で切れて先頭語を見失うので、剥がす段階では
# 引用符を保ち、引用符の外しは語に割る直前に回す。
ASSIGN_RE='^[A-Za-z_][A-Za-z0-9_]*=("[^"]*"|'"'"'[^'"'"']*'"'"'|[^[:space:]]*)[[:space:]]+'
# ラッパーとシェルのキーワード。開始側 (if/elif/while/until) と継続側 (then/do/
# else) は必ず対で入れること。片側だけだと `if git push; then ...` のような
# ごく普通の形を取りこぼす。
WRAPPER_RE='^(time|timeout|nohup|sudo|env|command|exec|eval|xargs|nice|stdbuf|setsid|bash|sh|zsh|if|elif|while|until|then|do|else|\{|!)[[:space:]]+'
# ラッパー自身のオプション (`env -i` / `sudo -u me` / `xargs -n1` /
# `timeout --foreground` / `bash -lc`)。ラッパーごとに書き分けるとリストが
# 際限なく伸びるので、「先頭がオプションなら捨てる」の一本にまとめる。
# 本物のコマンドがオプションで始まることはないので、これで誤爆は増えない。
OPT_RE='^-[^[:space:]]*[[:space:]]+'
# 値を別語で取る短いオプション (`sudo -u me` / `xargs -n 1` / `timeout -k 30`)。
# 値まで一緒に捨てないと、値のほうが先頭語に見えてしまう。
# 値が引用符で始まる場合は対象外 (`bash -c "git push"` の中身はコマンド本体)。
# 値を捕まえておき、それが git そのものなら消さない (`env -i git push` の -i は
# 値を取らないオプションで、次の語はコマンド本体)。短いオプションが値を取るか
# 取らないかは一般には決められないので、「git なら本体」の一点で切り分ける。
OPTARG_RE='^-[A-Za-z][[:space:]]+([^-"'"'"'[:space:]][^[:space:]]*)[[:space:]]+'
# `timeout 300 git push` の数値引数。
TIMEARG_RE='^[0-9]+[smhd]?[[:space:]]+'
# サブシェル・グループの開き括弧。`( git push )` の先頭を剥がす。
PAREN_RE='^[({][[:space:]]*'

# サブコマンドが git push か。
# 先頭の空白・変数代入 (GIT_TRACE=1)・ラッパー・シェルのキーワードを剥がしてから、
# git のグローバルオプションを読み飛ばし、最初の非オプション語が push かを見る。
# 「どこかに push がある」ではなく「git のサブコマンドが push」で判定する。
# こうしないと `git commit -m "push まで済ませた"` を傍受して7分溶かす。
# なお `git push --dry-run` / `-n` も傍受する (何も push されないのに7分回る)。
# 区別する価値より、オプションの読み分けを増やさないほうを採った。
# この関数自体は外部プロセスを呼ばず bash の組み込みだけで済ませる
# (上の grep/perl/sed は "push" を含むコマンドでのみ走る。実測 約70ms)。
is_git_push() {
  local cmd="$1" prev="" i=1 w
  while [ "$cmd" != "$prev" ]; do
    prev="$cmd"
    cmd=${cmd#"${cmd%%[![:space:]]*}"}
    [[ $cmd =~ $PAREN_RE ]] && cmd=${cmd#"${BASH_REMATCH[0]}"}
    [[ $cmd =~ $ASSIGN_RE ]] && cmd=${cmd#"${BASH_REMATCH[0]}"}
    [[ $cmd =~ $WRAPPER_RE ]] && cmd=${cmd#"${BASH_REMATCH[0]}"}
    if [[ $cmd =~ $OPTARG_RE ]]; then
      case "${BASH_REMATCH[1]}" in
        git | */git) ;;
        *) cmd=${cmd#"${BASH_REMATCH[0]}"} ;;
      esac
    fi
    [[ $cmd =~ $OPT_RE ]] && cmd=${cmd#"${BASH_REMATCH[0]}"}
    [[ $cmd =~ $TIMEARG_RE ]] && cmd=${cmd#"${BASH_REMATCH[0]}"}
  done
  # 引用符を外す (`git "push"`)。外した結果 `git commit -m "do push"` は
  # push が commit の引数の位置に来るので、下の「最初の非オプション語」で落ちる。
  cmd=${cmd//\"/}
  cmd=${cmd//\'/}
  local -a words
  IFS=$' \t' read -r -a words <<<"$cmd"
  # 絶対パス・相対パス指定も git とみなす (`/usr/bin/git push`)。
  case "${words[0]:-}" in
    git | */git) ;;
    *) return 1 ;;
  esac
  while [ "$i" -lt "${#words[@]}" ]; do
    w="${words[$i]}"
    case "$w" in
      # 値を別語で取るグローバルオプションは次の語ごと飛ばす
      -C | -c | --git-dir | --work-tree | --namespace | --exec-path) i=$((i + 2)) ;;
      -*) i=$((i + 1)) ;;
      *) break ;;
    esac
  done
  # 語の端に張り付いた閉じ括弧を落とす (`( cd x && git push )` の `push)`)。
  # パターンの括弧は必ずクォートすること。`${w%%[)}]*}` と書くと括弧内の `}` が
  # 展開の終わりと解釈され、`push]*}` のような値になって一致しなくなる。
  w="${words[$i]:-}"
  w=${w%%')'*}
  w=${w%%'}'*}
  [ "$w" = "push" ]
}

IS_PUSH=0
while IFS= read -r subcmd; do
  [ -z "$subcmd" ] && continue
  if is_git_push "$subcmd"; then
    IS_PUSH=1
    break
  fi
done < <(split_commands "$(printf '%s' "$COMMAND" | remove_heredocs)")
if [ "$IS_PUSH" != 1 ]; then
  exit 0
fi

CWD=$(echo "$INPUT" | jq -r '.cwd')
# ここで黙って通す (exit 0) と、チェックなしの push を許すことになる。
# push と判定したあとの異常系は閉じる側に倒す。
if ! cd "$CWD" 2>/dev/null; then
  echo "作業ディレクトリ ($CWD) に移動できず、push 前のチェックを実行できませんでした。" >&2
  exit 2
fi
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
#
# `kill -KILL` でこのフックが落とされると trap が走らず、サーバが1本残ることが
# ある。無作為ポート (下記) なので次の実行は別のポートを取れて詰まらない。
# 残骸は RSS 100〜300MB を掴んだまま残るので、放っておく費用は手間だけではない。
# 残骸は手で片付ける。`ps -ef | grep next-server` を頼りにしないこと。その行は
# ポートを持たず、親も中間プロセスなので孤児と現役を区別できない。しかも next は
# dev でも process.title を "next-server" にするため、take-screenshot などが
# 立てた dev サーバまで同じ grep に並ぶ。
# 見るのはグループリーダーの行 (実測):
#   $ ps -eo pid,ppid,pgid,args | grep 'next start -p'
#   1603964  1  1603964  npm exec next start -p 21188   ← 孤児 (PPID=1)
# 孤児は PPID=1 かつポートが 20000-29999。走っている別のフックの現役サーバは
# PPID がそのフックの shell になるので、この2条件で区別できる。
# 落とすときはグループごと: kill -TERM -- -<PGID>。
# 同じ経路で mktemp のファイル2本 (PID 置き場・サーバログ) も /tmp に残る。
# 回収の仕組みは持たない。理由は下の valid_target を足したあとも変わらない:
# 記録を tmp/ (全エージェントが書ける共有領域) に置いて、そこから読んだ PGID を
# kill に渡す形になるため、「構文的には妥当だが古い PGID」(PID が再利用された
# 後の値、他エージェントが書き換えた値) で無関係なグループを殺しうる。
# 値が数値かどうかの検証では、この誤りは検出できない。所有を確かめようにも、
# 回収時にはもうプロセスが別物になっており、この環境では cwd も決め手にならない
# (PID 1 にも他エージェントの next にもこのリポジトリの cwd が出る。下の
# holder_is_ours 参照)。検証を足したのだから回収器を戻せる、とはならない。
# 守れるもの (サーバ1本) より失いうるもののほうが大きい。
SERVER_PGID=""
SERVER_LAUNCHER_PID=""
E2E_PID_FILE=""
E2E_SERVER_LOG=""
E2E_PORT=""

# --- /proc を読むだけのプロセス照会 -------------------------------------
# この環境には ss / lsof / fuser が無く、ポートから持ち主を引く手段がないため、
# すべて /proc で解決する (awk は mawk なので strtonum は使えない。16進のまま比べる)。
# /proc/PID/stat の comm は括弧で囲まれ空白を含みうるので、最後の ") " より
# 後ろを読む。そこから先は state(1) ppid(2) pgrp(3) session(4) ...。
# このファイルが使うのは pgrp と session だけ。

proc_stat_rest() {
  local line
  line=$(cat "/proc/$1/stat" 2>/dev/null) || return 1
  printf '%s' "${line##*) }"
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
# cmdline は切り詰める。chromium が掴んでいると1プロセスで数千文字になり、
# 肝心のブロック理由が画面から流れて読めなくなる。
describe_port_holders() {
  local port="$1" pid found=0 cmd
  for pid in $(listening_pids "$port"); do
    found=1
    cmd=$(tr '\0' ' ' <"/proc/$pid/cmdline" 2>/dev/null)
    [ "${#cmd}" -gt 160 ] && cmd="${cmd:0:160}..."
    echo "  pid=$pid pgid=$(proc_pgid "$pid") sid=$(proc_sid "$pid")" \
      "cwd=$(readlink -f "/proc/$pid/cwd" 2>/dev/null)" \
      "cmd=$cmd" >&2
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
# これが効いているので、漏れたサーバの回収は push を守るために必要な機能ではない。
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

# kill に渡す前の入力検証。`kill -- -1` は POSIX 上「シグナルを送れる全プロセス」
# であり、PGID が 1 や空文字や非数値のまま届くと、このセッション自体を巻き込んで
# 落としうる。自分の子から取った PGID にも掛ける (安いので)。
valid_target() {
  case "$1" in
    '' | *[!0-9]*) return 1 ;;
  esac
  [ "$1" -ge 2 ]
}

kill_group() {
  local pgid="$1" i
  valid_target "$pgid" || return 0
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
  valid_target "$pid" || return 0
  targets="$pid $(descendant_pids "$pid" | tr '\n' ' ')"
  for p in $targets; do valid_target "$p" && kill -TERM "$p" 2>/dev/null; done
  sleep 1
  for p in $targets; do valid_target "$p" && kill -KILL "$p" 2>/dev/null; done
}

# 見ているのは cwd だけ。単体で呼ぶと PID 1 にも他エージェントの next にも
# TRUE を返す (この環境ではそれらの cwd もこのリポジトリ) ので、ポートで
# 絞っていない場所からは呼ばない。
#
# これは所有の証明ではない。呼び出し元が絞っているのは「我々が確保しようと
# したポート」であって「我々のサーバが掴んでいるポート」ではなく、ここへ来る
# のは PGID を特定できなかったときだけ——つまり本物の所有判定 (PGID/SID 一致)
# が使えない場面。同時に走る別のフックのサーバは同じ cwd・同じポートで両条件を
# 満たすので、巻き込みうる。最後の手段としての当て推量と割り切っている。
holder_is_ours() {
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
        if holder_is_ours "$pid"; then
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

run_e2e() {
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
    # 採用する前に検証する。ここを [ -n ] だけにすると、壊れた値が
    # SERVER_PGID に居座り、kill_group が valid_target で黙って return する
    # せいで stop_e2e_server は「片付けた」と誤解し、フォールバック経路に
    # 降りずにサーバを取り残す。不正値は空のままにしてフォールバックへ流す。
    # ここで「生きていて、かつ自分がグループリーダーか」まで確かめたくなるが、
    # やらない。EADDRINUSE で即死する経路ではその時点で既に死んでいるため、
    # 生存を条件にすると 15 秒待たされたうえ真因 (EADDRINUSE) を名乗れなくなる。
    valid_target "$SERVER_PGID" && break
    SERVER_PGID=""
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

  # `--max-time` は必須。ポートを掴んだまま応答しないプロセスが相手だと、
  # connect は成功して読み取りで止まるので、付けないと curl が永久に待ち、
  # ループの1回目から返ってこない (= フックごと無限に固まる)。
  # 待ち時間の上限は反復回数ではなく実時間で押さえる。1回が最大6秒 (max-time 5 +
  # sleep 1) 掛かりうるので、回数で数えると遅い環境で試行数が激減する。
  local wait_max=120 up=0
  local deadline=$((SECONDS + wait_max))
  while [ "$SECONDS" -lt "$deadline" ]; do
    if curl -sf --max-time 5 -o /dev/null "http://localhost:$port/"; then
      up=1
      break
    fi
    # サーバが既に死んでいるなら待つ意味がない。満了まで回すと、起動に失敗した
    # だけで毎回 120 秒を捨てることになる。
    kill -0 -- "-$SERVER_PGID" 2>/dev/null || break
    sleep 1
  done
  if [ "$up" != 1 ]; then
    # 「起動しませんでした」で一括りにしない。別プロセスがポートを掴んでいて
    # 応答しないだけ、という別の失敗にすり替えて報告してしまうため。
    # 最も決定的な証拠は自分のログの EADDRINUSE なので、それを最初に見る
    # (相手が去ったあとでも真因を名乗れる)。次に自分のサーバの生死を見る。
    if grep -q "EADDRINUSE" "$E2E_SERVER_LOG"; then
      echo "e2e failed: ポート $port は別のプロセスに先に取られ (EADDRINUSE)、" \
        "こちらのサーバは起動できませんでした。" >&2
    elif kill -0 -- "-$SERVER_PGID" 2>/dev/null; then
      echo "e2e failed: サーバは起動していますが ${wait_max} 秒以内に 200 を返しませんでした。" >&2
    elif [ -n "$(listening_pids "$port")" ]; then
      echo "e2e failed: ポート $port は別のプロセスに掴まれていて、200 を返しません" \
        "(我々のサーバは起動できずに終了しました)。" >&2
    else
      echo "e2e failed: サーバが起動しませんでした。" >&2
    fi
    describe_port_holders "$port"
    tail -20 "$E2E_SERVER_LOG" >&2
    exit 2
  fi

  # 空きポートの探索から bind までには窓がある (実測 約3秒)。その窓に別の push が
  # 重なると、敗者の curl は勝者のビルドに通り、無関係な PASS / FAIL を返す。
  # 塞ぐのは「実際にポートを掴んでいるのが自分のセッションか」の一点だけ。
  #
  # 以前はここに「起動ログに EADDRINUSE が出ていないか」の枝も並べていたが、
  # 下の PGID/SID 一致判定の上位互換なので削った (EADDRINUSE で起動できなければ、
  # ポートを掴んでいるのは必ず他人になり、同じ経路で捕まる)。負けたときの
  # EADDRINUSE はこの枝の tail に出るので、診断としても失っていない。
  # なお EADDRINUSE の検査自体は、起動待ちが尽きたときの真因判定として
  # 上のブロックに移してある (あちらでは相手が去ったあとでも効く)。
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
    tail -20 "$E2E_SERVER_LOG" >&2
    exit 2
  fi

  # e2e 本体にも上限を掛ける。chromium が掴んだまま返らないと、フックは
  # settings.json の hook timeout まで走り続け、その打ち切りが SIGKILL なら
  # trap が走らずサーバも mktemp も残る。自分から有界に終わるほうがよい。
  # `-k 30` は必須。TERM で死なない相手だと、コマンド置換はパイプの書き手が
  # 全員閉じるまで返らないので、timeout が発火しても待ち続けてしまう。
  local output
  output=$(E2E_BASE_URL="http://localhost:$port" timeout -k 30 600 npm run test:e2e 2>&1)
  local code=$?
  stop_e2e_server

  if [ $code -eq 124 ]; then
    echo "e2e failed: e2e が 600 秒以内に終わりませんでした (打ち切り)。" >&2
    echo "$output" >&2
    exit 2
  fi
  if [ $code -ne 0 ]; then
    echo "e2e failed." >&2
    echo "$output" >&2
    echo "Fix all issues and push again" >&2
    exit 2
  fi
}

run_e2e

exit 0
