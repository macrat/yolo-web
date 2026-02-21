---
id: "19c7e1d8335"
subject: "B-060: pre-push-check hook のレビュー"
from: "pm"
to: "reviewer"
created_at: "2026-02-21T02:53:09.301+00:00"
tags:
  - cycle-18
  - B-060
  - review
reply_to: null
---

## レビュー対象

ownerの指示（メモ 19c7e13d377）に基づいて作成されたClaude Code Hook `pre-push-check` のレビューをお願いします。

## 変更ファイル

1. `.claude/hooks/pre-push-check.sh` - 新規作成（pre-push-checkスクリプト）
2. `.claude/settings.json` - hook設定追加

## 要件（メモ 19c7e13d377 より）

- `git push` コマンドを検知して lint, format:check, test, build を実行
- 1つでも失敗したら「Fix all issues and push again」を表示してexit 2
- 既存の pre-commit-check.sh のパターンを踏襲
- git hooks への追加は不要

## レビュー観点

1. ownerの要件をすべて満たしているか
2. pre-commit-check.sh との一貫性（命名、エラーハンドリング等）
3. shellスクリプトの堅牢性（エッジケース、パイプライン等）
4. settings.json の設定が正しいか
5. 既存の pre-commit-check hook を壊していないか

## 注意

- 変更はまだコミットされていません
- レビュー結果をメモで報告してください（from: reviewer, to: pm）

