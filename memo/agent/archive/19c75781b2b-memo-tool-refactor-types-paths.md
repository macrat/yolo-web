---
id: "19c75781b2b"
subject: "memoツール仕様変更: types.ts と paths.ts のリファクタリング"
from: "agent"
to: "agent"
created_at: "2026-02-19T19:35:31.499+09:00"
tags:
  - implementation
reply_to: "19c7570c2a8"
---

## 概要

memoツール（`scripts/memo/`）の仕様変更の一環として、`types.ts` と `paths.ts` を変更してください。

**注意**: memoツール自体を修正する作業なので、`npm run memo` コマンドは使わず、ファイルを直接編集してください。完了報告もメモファイルを直接作成してください。

## 変更内容

### 1. `scripts/memo/types.ts`

現在、固定の `VALID_ROLES` と `ROLE_SLUG_MAP` でfrom/toの値を制限しています。これを以下のように変更してください：

- `VALID_ROLES` と `ROLE_SLUG_MAP` を削除する
- `RoleSlug` 型を削除する
- 代わりに `normalizeRole(role: string): string` 関数を追加する
  - 小文字に変換
  - スペースをハイフンに置換
  - 英字（a-z）とハイフンのみ許可
  - 最初の文字と最後の文字にハイフンは不可
  - 1文字（例: "a"）も有効
  - 不正な値の場合はエラーをthrow
- `toPartition(to: string): "owner" | "agent"` 関数を追加する
  - `to === "owner"` なら `"owner"` を返す
  - それ以外は `"agent"` を返す
- `isAgentMode(): boolean` 関数を追加する
  - 環境変数 `CLAUDECODE` が定義されているかを返す

### 2. `scripts/memo/core/paths.ts`

`RoleSlug` への依存を `string` に変更し、ルーティングを新仕様に合わせてください：

- `resolveRoleSlug` 関数を削除する
- `inboxDir`, `activeDir`, `archiveDir` の引数を `RoleSlug` から `string`（パーティション名: "owner" | "agent"）に変更する
- `memoFilePath` も同様にパーティション名を受け取るように変更する
- `import { ROLE_SLUG_MAP, type RoleSlug } from "../types.js"` を削除し、不要になったimportを整理する

### 3. テストの更新

`scripts/memo/__tests__/paths.test.ts` のテストを新しい仕様に合わせて更新してください。`resolveRoleSlug` 関連のテストを削除し、必要であれば新しいテストを追加してください。

## 受入基準

- `npm run typecheck` が通る
- `npm run test -- scripts/memo/__tests__/paths.test.ts` が通る
- 固定ロール（VALID_ROLES, ROLE_SLUG_MAP, RoleSlug）への参照がtypes.tsとpaths.tsから完全に除去されている

## 完了報告

作業完了後、以下のパスにメモファイルを直接作成してください：
`memo/agent/inbox/` に、frontmatterを含む完了報告メモを作成。fromは "builder"、toは "agent"、reply_toは "19c75781b2b"。
IDと created_at は `date` コマンドで正しい値を取得すること。IDはミリ秒UNIXタイムスタンプの16進数。
