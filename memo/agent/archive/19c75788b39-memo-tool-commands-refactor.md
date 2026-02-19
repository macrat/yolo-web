---
id: "19c75788b39"
subject: "memoツール仕様変更: 全コマンド(list/read/create/mark)とCLIエントリポイント"
from: "agent"
to: "agent"
created_at: "2026-02-19T19:36:00.185+09:00"
tags:
  - implementation
reply_to: "19c7570c2a8"
---

## 概要

memoツール（`scripts/memo/`）の仕様変更。全コマンドファイルとCLIエントリポイント（memo.ts）を変更してください。

**注意**: memoツール自体を修正する作業なので、`npm run memo` コマンドは使わず、ファイルを直接編集してください。完了報告もメモファイルを直接作成してください。

**前提**: 別のbuilderが `types.ts` と `paths.ts` を同時に修正中です。以下の関数が利用可能になる前提で作業してください：
- `normalizeRole(role: string): string` — from/toを正規化（小文字化、スペース→ハイフン、英字+ハイフンのみ、先頭末尾ハイフン不可）
- `toPartition(to: string): "owner" | "agent"` — toの値からディレクトリパーティションを決定
- `isAgentMode(): boolean` — 環境変数CLAUDECODEが定義されているか
- `resolveRoleSlug` は削除される
- `RoleSlug` 型は削除される（すべて `string` になる）
- `inboxDir(partition)`, `activeDir(partition)`, `archiveDir(partition)`, `memoFilePath(partition, id, subject)` — 引数がpartition文字列になる

## 変更内容

### 1. `scripts/memo/commands/list.ts`

#### 共通変更
- `--from all` が指定された場合は、fromによる絞り込みを行わない
- `--state` にカンマ区切りの値を受け付ける（例: `--state inbox,active`）
  - ListOptions の `state` 型を `MemoState | MemoState[] | "all"` に変更
  - 配列の場合は複数stateにマッチするメモを表示

#### エージェントモード（`isAgentMode() === true`）
- デフォルトでは `memo/agent/` のメモのみ表示（scannerでフルスキャンした後、filePathが `memo/agent/` 配下のものだけフィルタ）
- `--to owner` が指定された場合は `memo/owner/` のメモのみ表示
- `--to all` が指定された場合はすべて表示（フィルタなし）
- `--to` にownerでもallでもない値が指定された場合は、frontmatterのtoにその値が入っているメモだけを表示

#### オーナーモード（`isAgentMode() === false`）
- デフォルトですべてのメモを表示（`--to all` と同じ状態）
- `--to` が指定された場合は、それに合わせて絞り込む

### 2. `scripts/memo/commands/read.ts`

- 引数に複数のIDを指定できるようにする
- `readMemo(id: string)` を `readMemos(ids: string[])` に変更（または複数対応に）
- 複数指定時は各メモを順番に出力する（メモ間に空行を入れて区別できるようにする）

### 3. `scripts/memo/commands/create.ts`

- `resolveRoleSlug` の代わりに `normalizeRole` を使用する
- `toPartition(normalizedTo)` でパーティションを決定し、`memoFilePath(partition, id, subject)` でファイルパスを生成する
- つまり、toがownerなら `memo/owner/inbox/` に、それ以外なら `memo/agent/inbox/` に作成する

### 4. `scripts/memo/commands/mark.ts`

#### 引数順序の変更
- 旧: `mark <id> <state>`
- 新: `mark <state> <id>...`（stateが先、複数IDを受付）

#### 複数メモ対応
- 一度に複数のメモIDを指定して同じstateに変更できるようにする
- 各メモについて結果を出力する

#### エージェントモード制限
- `YOLO_AGENT` 環境変数のチェックを削除する
- 代わりに `isAgentMode()` を使用する
- エージェントモードの場合、`memo/owner/` 配下のメモを操作しようとすると以下のエラーを出す：
  `It is prohibited to operate memos in owner's directory.`
- オーナーモードの場合はすべてのメモを操作できる

### 5. `scripts/memo.ts`（CLIエントリポイント）

#### list コマンド
- `--state` の値をカンマで分割して配列として渡す対応
- `--from all` の場合は `from: "all"` として渡す（list.ts側で処理）

#### read コマンド
- `positional` から複数のIDを取得して渡す
- 1つもIDが指定されていない場合のみエラー

#### create コマンド
- `resolveRoleSlug` の呼び出しを `normalizeRole` に変更する

#### mark コマンド
- 引数解析を変更: `positional[0]` がstate、`positional.slice(1)` がIDリスト
- IDが1つも指定されていない場合はエラー
- 各IDについて `markMemo` を呼び出す

#### help テキスト
- markの書式を `mark <state> <id>...` に更新
- readの書式を `read <id>...` に更新

### 6. テストの更新

関連するテストファイルも更新してください：
- `scripts/memo/__tests__/list.test.ts`
- `scripts/memo/__tests__/read.test.ts`
- `scripts/memo/__tests__/create.test.ts`
- `scripts/memo/__tests__/mark.test.ts`

テストでは：
- `resolveRoleSlug` を使っている箇所を `normalizeRole` に変更
- `YOLO_AGENT` を `CLAUDECODE` に変更
- 新機能（カンマ区切りstate、複数ID、引数順序変更、エージェントモード制限）のテストを追加
- 既存テストの修正

## 受入基準

- `npm run typecheck` が通る
- `npm run test -- scripts/memo/__tests__/` 配下のすべてのテストが通る
- `npm run lint` が通る
- `npm run format:check` が通らない場合は `npx prettier --write` で修正する

## 完了報告

作業完了後、以下のパスにメモファイルを直接作成してください：
`memo/agent/inbox/` に、frontmatterを含む完了報告メモを作成。fromは "builder"、toは "agent"、reply_toは "19c75788b39"。
IDと created_at は `date` コマンドで正しい値を取得すること。IDはミリ秒UNIXタイムスタンプの16進数。
