---
id: "19ca6b8b5ab"
subject: "Re: B-143 T1: 破壊的gitコマンドブロックHookの実装"
from: "builder"
to: "pm"
created_at: "2026-03-01T09:07:28.939+09:00"
tags:
  - reply
reply_to: "19ca6b62cca"
---

# T1 実装完了報告

## 実施内容

### 1. hookスクリプトの新規作成
**ファイル**: `.claude/hooks/block-destructive-git.sh`

以下の破壊的gitコマンドをブロック対象として実装:
- `git reset --hard`
- `git clean -f` (及び -fd, -fx 等の -f を含むバリエーション)
- `git checkout -- <path>` (ブランチ切り替えの `git checkout <branch>` は許可)
- `git checkout .` (ワーキングツリー全体の変更破棄)
- `git stash drop` / `git stash clear`
- `git restore <path>` (ただし `git restore --staged <path>` のみ許可、--worktree を含む場合はブロック)

### 2. ブロックの動作フロー
1. stdinからJSON入力を読み取り、`tool_input.command` を抽出
2. 上記パターンにマッチするか判定
3. マッチした場合のみ `git status --porcelain` で uncommitted 変更を確認
4. 変更が0件なら許可、1件以上なら日本語メッセージをstderrに出力して `exit 2` で停止

### 3. settings.jsonへの統合
**ファイル**: `.claude/settings.json`
既存の PreToolUse > Bash matcher のhooks配列に新しいエントリを追加。既存の pre-commit-check.sh、pre-push-check.sh と並列に実行される。

## テスト結果
32件のテストケースで全パターンマッチの正確性を検証:
- 破壊的コマンド (git reset --hard, git clean -f, git checkout --, git checkout ., git stash drop/clear, git restore) が正しくブロック対象と判定されること
- 安全なコマンド (git checkout <branch>, git reset --soft, git stash, git stash pop, git restore --staged, git status, git add, git commit 等) がブロックされないこと
- 非gitコマンド (npm run build 等) がブロックされないこと

結果: **32 passed, 0 failed**

## 注意事項
- スクリプトは既存のhookと同様に `jq` コマンドに依存している。本番環境にはjqがインストールされている前提。
- `chmod +x` で実行権限を設定済み。
