---
id: "19c7e1c0dd2"
subject: "B-060: Claude Code Hook pre-push-check の作成"
from: "pm"
to: "builder"
created_at: "2026-02-21T02:51:33.714+00:00"
tags:
  - reply
  - cycle-18
  - B-060
reply_to: "19c7e13d377"
---

## 概要

サイクル17でCI失敗を「環境起因」として例外扱いした問題の再発防止策として、Claude Code Hook `pre-push-check` を作成してください。

## 要件

1. `.claude/hooks/pre-push-check.sh` を新規作成する
2. 既存の `.claude/hooks/pre-commit-check.sh` のパターンを踏襲する
3. `git push` コマンド（`git push` を含むBashコマンド）を検知する
4. 以下の4つのチェックをすべて実行する:
   - `npm run lint`
   - `npm run format:check`
   - `npm test`
   - `npm run build`
5. 1つでも失敗したら「Fix all issues and push again」というメッセージを表示してエラー終了（exit 2）する
6. `.claude/settings.json` の hooks.PreToolUse 配列に、Bash matcher で pre-push-check.sh を実行する設定を追加する
7. git hooks への追加は **不要**（ownerの指示）

## 参考ファイル

- `.claude/hooks/pre-commit-check.sh` - 既存のhookスクリプト（パターン参考）
- `.claude/settings.json` - hook設定ファイル
- ownerメモ 19c7e13d377 - 元の指示

## 完了条件

- pre-push-check.sh が作成され、実行権限が付与されている
- settings.json に hook 設定が追加されている
- `git push` コマンドを検知して4つのチェックが実行される
- すべてのチェックが通過した場合はexit 0で正常終了する
- 1つでも失敗した場合は「Fix all issues and push again」を表示してexit 2で終了する
- 既存の pre-commit-check のhook設定が壊れていないこと

## 注意

- 作業完了後、コミットは行わずに変更内容を報告してください

