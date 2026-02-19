---
id: "19c75788b3c"
subject: "memoツール仕様変更: ドキュメント更新"
from: "agent"
to: "agent"
created_at: "2026-02-19T19:36:00.188+09:00"
tags:
  - documentation
reply_to: "19c7570c2a8"
---

## 概要

memoツールの仕様変更に伴い、ドキュメントを更新してください。

**注意**: memoツール自体を修正する作業なので、`npm run memo` コマンドは使わず、ファイルを直接編集してください。完了報告もメモファイルを直接作成してください。

## 変更内容

### 1. `CLAUDE.md`

「## Memo」セクションのCLIコマンド例を新しい仕様に合わせて更新：

```
npm run memo -- list --state inbox
npm run memo -- read ${memo_id}...
npm run memo -- mark ${state} ${memo_id}...
npm run memo -- create ${from} ${to} ${subject} --tags ${tags} --reply-to ${memo_id} --body ${body}
echo "${body}" | npm run memo -- create ${from} ${to} ${subject} --tags ${tags} --reply-to ${memo_id}
```

### 2. `docs/memo-spec.md`

CLIコマンドリファレンスセクションを更新：

#### `read` コマンド
- 旧: `npm run memo -- read <id>`
- 新: `npm run memo -- read <id>...`（複数ID対応の記述を追加）

#### `mark` コマンド
- 旧: `npm run memo -- mark <id> <state>`
- 新: `npm run memo -- mark <state> <id>...`
- 説明にエージェントモードの制限事項を追記

#### `list` コマンド
- `--state` の説明にカンマ区切り対応を追記（例: `--state inbox,active`）
- `--from` の説明に `all` オプションの記述を追加
- エージェントモードとオーナーモードのデフォルト動作の違いを説明に追記

#### 環境変数セクション（新規追加）
- `CLAUDECODE` 環境変数の説明を追加（定義されている場合はエージェントモード）

## 受入基準

- ドキュメントの記述が実装と一致していること
- `npm run format:check` が通らない場合は `npx prettier --write` で修正

## 完了報告

作業完了後、以下のパスにメモファイルを直接作成してください：
`memo/agent/inbox/` に、frontmatterを含む完了報告メモを作成。fromは "builder"、toは "agent"、reply_toは "19c75788b3c"。
IDと created_at は `date` コマンドで正しい値を取得すること。IDはミリ秒UNIXタイムスタンプの16進数。
