#!/usr/bin/env bash
# push したコミットの GitHub Actions CI 結果を確認する。
# cycle-completion の push 後に実行し、CI が緑になったことを確認してから完了報告する。
# 「環境起因なので完了扱い」という逃げ道を塞ぐための機械ゲート (AP-WF23 対策の一部)。
#
# Usage: scripts/wait-for-ci.sh [commit-sha]
#   デフォルトは HEAD。
#
# Exit code:
#   0 = 本体ワークフローの成功を確認した (サイクルを完了してよいのはこれだけ)
#   1 = CI の失敗を確認した (赤・確定)
#   2 = 未確定 — まだ判定がついていない。「失敗」ではない。時間を置いて再実行する
#   3 = gh CLI が無い
#
# ■ なぜ 1回では判定しきれないのか (この設計の中心)
#   push から run が GitHub 側に登録されるまでには時間がかかる。cycle-302 の実測で
#   11分かかった。一方このスクリプトは Bash ツールから呼ばれ、そのツールのタイムアウト
#   上限は10分である。つまり「1回の実行で 11分待つ」ことは原理的にできない。
#
#   この衝突は「1回で決着をつける」のをやめることで解いてある:
#     - 1回の実行は既定 480秒 (8分) 待つ。ツール上限10分に対し、ポーリング間隔 20秒の
#       オーバーラン (最大 +20秒) と gh 呼び出しの時間を足しても余裕がある。
#     - 8分で決着しなければ exit 2 = 「未確定」で戻る。これは赤ではない。
#       同じコマンドをもう一度実行すれば、続きから判定できる。
#     - 何分待ったかは commit ごとに ./tmp/wait-for-ci/ に記録され、再実行をまたいで
#       通算される。通算が WAIT_FOR_CI_SUSPECT_SEC (既定 1500秒 = 25分。実測11分の
#       倍以上) を超えて初めて、メッセージが「Actions の設定を疑え」に切り替わる。
#   これにより「まだ登録されていないだけ」と「そもそも起動しない」が混ざらない。
#
# ■ 環境変数
#   WAIT_FOR_CI_TIMEOUT      1回の実行の待ち秒数 (既定 480)。呼び出し側が Bash ツールの
#                            timeout を延ばせるなら、ここも一緒に延ばしてよい。
#                            ツール上限10分を超える値を入れても、ツール側で切られる。
#   WAIT_FOR_CI_SUSPECT_SEC  「設定を疑ってよい」通算秒数 (既定 1500 = 25分)。
#   REQUIRED_WORKFLOW        本体ワークフロー名 (既定 "CI / Deploy")。
#                            .github/workflows/deploy.yml の `name:` と一致させること。
#
# ■ なぜ本体ワークフローの成功を必須にしているか
#   このコミットに紐づく run が全部成功した、だけでは足りない。Dependabot Updates や
#   CodeQL は push とは無関係に動くので、本体 (deploy.yml) がまだ登録されていなくても
#   「すべて成功」になってしまう。cycle-302 で実際にそうなった——push 直後に Dependabot
#   と CodeQL だけが見えている状態で、このスクリプトは緑を返した。
#
# ■ 実測 (2026-08-07・3経路すべてを既定値のまま実際に走らせて計測した)
#   本体が成功済み (現 HEAD fa1a5898)
#     → 1秒 / exit 0 /「CI はすべて成功しています (本体「CI / Deploy」の成功を確認)」
#   run が1件も無い (存在しない SHA 000...0 を渡す)
#     → 497秒 (20秒間隔で24回ポーリング) / exit 2 /「未確定 …まだ 1件も登録されていません」
#   本体が見つからない (REQUIRED_WORKFLOW="No Such Workflow")
#     → 485秒 (23回ポーリング) / exit 2 /「未確定 …本体がまだ現れていません」
#   通算が SUSPECT_SEC を超えた場合 (状態ファイルを30分前に偽装して確認)
#     → exit 2 のままメッセージだけが「ここで初めて設定側を確認してください」に変わる
#   いずれも Bash ツール上限の 600秒に収まっている (最長 497秒)。
#
#   ※ 以前の実装はここが DISCOVERY_GRACE_SEC=180 で、run が1件も無い場合に 3分で
#     「push が成功しているか、Actions が起動しているかを確認してください」と出して
#     いた。cycle-302 の事故 (実際は11分後に run が現れて成功した) と全く同じ状況で
#     誤報する実装だった。DISCOVERY_GRACE_SEC は廃止した——run が 0件なのと本体が
#     まだ現れないのは「本体の成功が未確認」という同じ状態であり、待ち方を変える
#     理由が無い。

set -euo pipefail

SHA=${1:-$(git rev-parse HEAD)}
TIMEOUT_SEC=${WAIT_FOR_CI_TIMEOUT:-480}
SUSPECT_SEC=${WAIT_FOR_CI_SUSPECT_SEC:-1500}
REQUIRED_WORKFLOW=${REQUIRED_WORKFLOW:-"CI / Deploy"}
POLL_INTERVAL=20
STATE_MAX_AGE_SEC=86400 # これより古い記録は別件とみなして捨てる

# 「0分 (1秒)」のような読みにくい表示を避ける
if [ "$TIMEOUT_SEC" -ge 60 ]; then
  TIMEOUT_LABEL="$((TIMEOUT_SEC / 60))分 (${TIMEOUT_SEC}秒)"
else
  TIMEOUT_LABEL="${TIMEOUT_SEC}秒"
fi

if ! command -v gh > /dev/null 2>&1; then
  echo "gh CLI が見つかりません。GitHub の Actions タブで commit ${SHA} の CI 成否を必ず確認してください。" >&2
  exit 3
fi

# --- 再実行をまたいだ通算待ち時間の記録 -------------------------------------
# 「何回再実行しても未確定」を検出できないと、「時間を置いて再実行」が無限ループに
# なり、本当に Actions が壊れている場合に気づけない。commit ごとに最初の試行時刻を
# 残して通算する。
repo_root=$(git rev-parse --show-toplevel 2> /dev/null || echo ".")
state_dir="${repo_root}/tmp/wait-for-ci"
state_file="${state_dir}/${SHA}"
now=$(date +%s)
first_attempt=$now
if [ -f "$state_file" ]; then
  saved=$(cat "$state_file" 2> /dev/null || echo "")
  case "$saved" in
    '' | *[!0-9]*) saved="" ;;
  esac
  if [ -n "$saved" ] && [ "$((now - saved))" -lt "$STATE_MAX_AGE_SEC" ]; then
    first_attempt=$saved
  fi
fi
mkdir -p "$state_dir" 2> /dev/null || true
echo "$first_attempt" > "$state_file" 2> /dev/null || true

runs='[]'

# 未確定 (exit 2) で終わる唯一の出口。「失敗」と読み間違えられないことを最優先に書く。
unresolved() {
  local reason=$1
  local total=$(($(date +%s) - first_attempt))
  local total_min=$((total / 60))
  {
    echo ""
    echo "未確定: commit ${SHA} について、本体「${REQUIRED_WORKFLOW}」が成功したかどうか"
    echo "まだ判定できていません。これは「CI が失敗した」という意味ではありません。"
    echo "現時点で分かっているのは次の一点だけです: ${reason}"
    echo ""
    echo "この commit に現在紐づいている run:"
    if [ "$(echo "$runs" | jq 'length')" -eq 0 ]; then
      echo "  (まだ 1件も登録されていません)"
    else
      echo "$runs" | jq -r '.[] | "  [\(.status)/\(.conclusion // "-")] \(.name)"'
    fi
    echo ""
    if [ "$total" -lt "$SUSPECT_SEC" ]; then
      echo "これは想定内の結果です。push から run が GitHub 側に登録されるまでには時間が"
      echo "かかり、cycle-302 では 11分かかりました。一方このスクリプトは 1回あたり"
      echo "${TIMEOUT_LABEL} しか待てません (Bashツールのタイムアウト上限が10分のため)。"
      echo "つまり「まだ現れていない」は、この時点ではごく普通の状態です。"
      echo ""
      echo "やること: 数分おいてから、同じコマンドをもう一度実行してください。"
      echo "  bash scripts/wait-for-ci.sh ${SHA}"
      echo "待ち時間は再実行をまたいで通算されます (この commit は現在 通算${total_min}分)。"
      echo ""
      echo "やってはいけないこと: この結果を「Actions が起動していない」「デプロイが"
      echo "動いていない」と解釈すること。通算$((SUSPECT_SEC / 60))分を超えるまで、設定を疑う根拠は"
      echo "ありません。cycle-302 ではこの取り違えで Owner に不要な対応を求めました。"
    else
      echo "この commit を待ち始めてから通算${total_min}分が経過しました。実測値の 11分も、"
      echo "疑ってよい目安の $((SUSPECT_SEC / 60))分も超えています。ここで初めて、設定側を確認してください:"
      echo "  git log origin/main -1 --format=%H   # push が GitHub に届いているか"
      echo "  gh workflow list                     # Actions が有効か・名前が一致するか"
      echo "  (ワークフロー名が「${REQUIRED_WORKFLOW}」から変わっていれば REQUIRED_WORKFLOW を指定する)"
      echo ""
      echo "それでも原因が分からない場合に限り、Owner に状況を報告してください。その際は"
      echo "「起動していない」と断定せず、ここまでに実測した通算待ち時間と run 一覧を示すこと。"
    fi
    echo ""
    echo "いずれにせよ、サイクルを完了させてよいのは exit 0 (本体の成功を確認) のときだけです。"
  } >&2
  exit 2
}

echo "commit ${SHA} の CI 実行を確認しています... (1回あたり最大 ${TIMEOUT_LABEL})"

start=$(date +%s)
while true; do
  elapsed=$(($(date +%s) - start))

  runs=$(gh run list --commit "$SHA" --json name,status,conclusion,url 2> /dev/null || echo "[]")
  count=$(echo "$runs" | jq 'length')
  incomplete=$(echo "$runs" | jq '[.[] | select(.status != "completed")] | length')
  failed=$(echo "$runs" | jq '[.[] | select(.status == "completed" and .conclusion != "success" and .conclusion != "skipped")] | length')
  required_ok=$(echo "$runs" | jq --arg n "$REQUIRED_WORKFLOW" \
    '[.[] | select(.name == $n and .conclusion == "success")] | length')

  # 失敗だけは確定事実なので、待たずに赤を返す。
  if [ "$failed" -gt 0 ]; then
    rm -f "$state_file" 2> /dev/null || true
    echo "CI が失敗しています。修正して再 push するまでサイクルを完了させてはいけません:" >&2
    echo "$runs" | jq -r '.[] | "  [\(.conclusion // .status)] \(.name) \(.url)"' >&2
    exit 1
  fi

  if [ "$required_ok" -gt 0 ] && [ "$incomplete" -eq 0 ]; then
    rm -f "$state_file" 2> /dev/null || true
    echo "CI はすべて成功しています (本体「${REQUIRED_WORKFLOW}」の成功を確認):"
    echo "$runs" | jq -r '.[] | "  [\(.conclusion)] \(.name)"'
    exit 0
  fi

  # ここから先は「まだ分からない」だけ。run が 1件も無い場合も、本体がまだ現れない
  # 場合も、扱いは同じ——待つ。ここを短く切ると、遅れているだけの CI を
  # 「起動していない」と誤報する (cycle-302 で実際に起きた)。
  if [ "$count" -eq 0 ]; then
    reason="この commit に紐づく run が、まだ 1件も登録されていません"
    progress="  run の登録待ち... (${elapsed}s / ${TIMEOUT_SEC}s)"
  elif [ "$required_ok" -eq 0 ]; then
    reason="他の run は登録されていますが、本体「${REQUIRED_WORKFLOW}」がまだ現れていません"
    progress="  本体「${REQUIRED_WORKFLOW}」を待っています... (${elapsed}s / ${TIMEOUT_SEC}s・他 ${count}件は登録済み)"
  else
    reason="本体「${REQUIRED_WORKFLOW}」は成功しましたが、他の run がまだ実行中です"
    progress="  実行中... (${elapsed}s / ${TIMEOUT_SEC}s)"
  fi

  if [ "$elapsed" -ge "$TIMEOUT_SEC" ]; then
    unresolved "$reason"
  fi

  echo "$progress"
  sleep "$POLL_INTERVAL"
done
