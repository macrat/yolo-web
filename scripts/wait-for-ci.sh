#!/usr/bin/env bash
# push したコミットの GitHub Actions CI 結果を確認する。
# cycle-completion の push 後に実行し、CI が緑になったことを確認してから完了報告する。
# 「環境起因なので完了扱い」という逃げ道を塞ぐための機械ゲート (AP-WF23 対策の一部)。
#
# Usage: scripts/wait-for-ci.sh [commit-sha]
#   デフォルトは HEAD。CI の完了まで最大9分ポーリングする。
#   (Bashツールの最大タイムアウトが10分のため、既定値はそれ未満にしてある。
#    CI が9分を超えて完了しない場合は exit 2 になるので、少し待ってから再実行して
#    完了済みの結果を確認すること。WAIT_FOR_CI_TIMEOUT で秒数を変更できる)
# Exit code: 0 = すべて成功 / 1 = 失敗あり / 2 = タイムアウト・run未発見 / 3 = gh CLI なし

set -euo pipefail

SHA=${1:-$(git rev-parse HEAD)}
TIMEOUT_SEC=${WAIT_FOR_CI_TIMEOUT:-540}
POLL_INTERVAL=20
DISCOVERY_GRACE_SEC=180 # push直後は run 登録まで時間がかかるため待つ

if ! command -v gh > /dev/null 2>&1; then
  echo "gh CLI が見つかりません。GitHub の Actions タブで commit ${SHA} の CI 成否を必ず確認してください。" >&2
  exit 3
fi

echo "commit ${SHA} の CI 実行を確認しています..."

start=$(date +%s)
while true; do
  elapsed=$(($(date +%s) - start))

  runs=$(gh run list --commit "$SHA" --json name,status,conclusion,url 2> /dev/null || echo "[]")
  count=$(echo "$runs" | jq 'length')

  if [ "$count" -eq 0 ]; then
    if [ "$elapsed" -ge "$DISCOVERY_GRACE_SEC" ]; then
      echo "commit ${SHA} に対する CI run が見つかりません。push が成功しているか、Actions が起動しているかを確認してください。" >&2
      exit 2
    fi
    echo "  CI run の登録待ち... (${elapsed}s)"
    sleep "$POLL_INTERVAL"
    continue
  fi

  incomplete=$(echo "$runs" | jq '[.[] | select(.status != "completed")] | length')
  if [ "$incomplete" -gt 0 ]; then
    if [ "$elapsed" -ge "$TIMEOUT_SEC" ]; then
      echo "CI が ${TIMEOUT_SEC}秒以内に完了しませんでした。状態を確認してください:" >&2
      echo "$runs" | jq -r '.[] | "  [\(.status)] \(.name) \(.url)"' >&2
      exit 2
    fi
    echo "  実行中... (${elapsed}s)"
    sleep "$POLL_INTERVAL"
    continue
  fi

  failures=$(echo "$runs" | jq '[.[] | select(.conclusion != "success" and .conclusion != "skipped")] | length')
  if [ "$failures" -gt 0 ]; then
    echo "CI が失敗しています。修正して再 push するまでサイクルを完了させてはいけません:" >&2
    echo "$runs" | jq -r '.[] | "  [\(.conclusion)] \(.name) \(.url)"' >&2
    exit 1
  fi

  # ここまでは「このコミットに紐づく run が全部成功した」しか見ていない。
  # それだけでは足りない。Dependabot Updates や CodeQL は push とは無関係に
  # 動くので、本体のワークフロー (deploy.yml) がまだ登録されていなくても
  # 「すべて成功」になってしまう。cycle-302 で実際にそうなった——push 直後に
  # Dependabot と CodeQL だけが見えている状態で、このスクリプトは緑を返した。
  #
  # したがって REQUIRED_WORKFLOW が実在して成功したことを必須にする。
  # 名前は .github/workflows/deploy.yml の `name:` と一致させること。
  #
  # ただし「まだ見つからない」と「起動しない」は別物である。cycle-302 では
  # push から run 登録まで 11分かかった。見つからないうちは待つこと——
  # ここで即座に赤を返すと、遅れているだけの CI を「起動していない」と
  # 誤報する (実際に PM がそう誤報し、Owner に不要な対応を求めた)。
  REQUIRED_WORKFLOW=${REQUIRED_WORKFLOW:-"CI / Deploy"}
  required_ok=$(echo "$runs" | jq --arg n "$REQUIRED_WORKFLOW" \
    '[.[] | select(.name == $n and .conclusion == "success")] | length')
  if [ "$required_ok" -eq 0 ]; then
    if [ "$elapsed" -lt "$TIMEOUT_SEC" ]; then
      echo "  本体「${REQUIRED_WORKFLOW}」の run を待っています... (${elapsed}s)"
      sleep "$POLL_INTERVAL"
      continue
    fi
    echo "本体のワークフロー「${REQUIRED_WORKFLOW}」が commit ${SHA} で成功しないまま" >&2
    echo "${TIMEOUT_SEC}秒が過ぎました。このコミットに紐づく run は次のとおりです:" >&2
    echo "$runs" | jq -r '.[] | "  [\(.conclusion)] \(.name)"' >&2
    echo "" >&2
    echo "run の登録には時間がかかります (cycle-302 の実測で 11分)。まず時間を置いて" >&2
    echo "再実行してください。それでも現れない場合にだけ、Actions の設定を疑うこと。" >&2
    exit 2
  fi

  echo "CI はすべて成功しています (本体「${REQUIRED_WORKFLOW}」の成功を確認):"
  echo "$runs" | jq -r '.[] | "  [\(.conclusion)] \(.name)"'
  exit 0
done
