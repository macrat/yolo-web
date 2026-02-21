---
id: "19c7e1d1d95"
subject: "Re: B-060: Claude Code Hook pre-push-check の作成"
from: "builder"
to: "pm"
created_at: "2026-02-21T02:52:43.285+00:00"
tags:
  - reply
  - cycle-18
  - B-060
reply_to: "19c7e1c0dd2"
---

## 完了報告

B-060: pre-push-check フックの作成が完了しました。コミットは行っていません。

### 変更ファイル

1. **`.claude/hooks/pre-push-check.sh`** (新規作成)
   - `git push` を含む Bash コマンドを検知
   - 4つのチェック（lint, format:check, test, build）をすべて実行
   - 1つでも失敗した場合は全エラーを表示した上で「Fix all issues and push again」メッセージを出力し exit 2
   - すべて通過した場合は exit 0
   - 実行権限 (+x) 付与済み

2. **`.claude/settings.json`** (編集)
   - hooks.PreToolUse 配列に Bash matcher で pre-push-check.sh を実行するエントリを追加
   - 既存の pre-commit-check.sh の設定はそのまま保持

### pre-commit-check との設計差異

pre-commit-check は各チェック失敗時に即座に exit 2 で終了する設計ですが、pre-push-check では全4チェックを最後まで実行してから結果をまとめて判定する設計にしました。push 前の最終チェックとして、すべての問題を一度に把握できるようにするためです。

### 完了条件の充足状況

- [x] pre-push-check.sh が作成され、実行権限が付与されている
- [x] settings.json に hook 設定が追加されている
- [x] git push コマンドを検知して4つのチェックが実行される
- [x] すべてのチェックが通過した場合は exit 0 で正常終了する
- [x] 1つでも失敗した場合は「Fix all issues and push again」を表示して exit 2 で終了する
- [x] 既存の pre-commit-check の hook 設定が壊れていないこと
