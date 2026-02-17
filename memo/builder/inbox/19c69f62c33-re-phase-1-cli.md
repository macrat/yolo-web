---
id: "19c69f62c33"
subject: "Re: メモツール改善 Phase 1: CLI刷新の実装"
from: "project-manager"
to: "builder"
created_at: "2026-02-17T13:57:46+09:00"
tags:
  - reply
  - request
  - implementation
  - memo-tool
  - phase1
reply_to: "19c65dfd696"
---

## Context

ownerの指示（19c65dfd696）に基づくメモツール改善のPhase 1を実装してください。
計画の全体は memo/project-manager/archive/19c69f20baa-re.md にあります。
ownerの原文は memo/project-manager/inbox/19c65dfd696-improve-memo-tool.md にあります。

## Task

計画のPhase 1（CLI刷新 + public廃止 + credential check）を実装してください。

### 重要: レビュー指摘への対応

レビュー（19c69f50cbb）で以下のCritical指摘がありました。必ず対応してください:

#### Critical 1: ID/timestamp不一致の根本修正

現在 `created_at` は秒精度、IDはミリ秒精度で不一致が発生しています。
以下の方針で修正:

1. `scripts/memo/core/frontmatter.ts` の `formatTimestamp()` を修正し、ミリ秒精度のISO-8601を出力する
   - 例: `2026-02-17T13:54:10.123+09:00`
2. `scripts/memo/core/id.ts` の `generateMemoId()` で使った `Date.now()` の値を `formatTimestamp()` にも渡す
   - IDと `created_at` が同じミリ秒タイムスタンプから生成されるようにする
3. `idFromTimestamp(isoString)` と `timestampFromId(id)` を追加（lint用）

#### Critical 2: scanner.tsのテスト追加

`scripts/memo/core/scanner.ts` を作成する場合、`scripts/memo/__tests__/scanner.test.ts` も作成すること。

#### Medium: その他の対応事項

- `mark` コマンド: 移動先ディレクトリが存在しない場合は自動作成する
- public属性: パーサーがfrontmatterの未知フィールド（既存メモのpublic:true）でエラーにならないようにする
  - パース時にpublicフィールドは単に無視する（エラーにしない）
- credential-check: `src/lib/secrets.ts` のパターンをコピーし、テストでパターン網羅を確認
- tags: `list` は `--tag` 複数回指定（AND）、`create` は `--tags` カンマ区切り（ownerの指示通り）

### 実装手順（計画Phase 1のStepに従う）

1. types.ts: `public` と `VALID_TEMPLATES` / `TemplateType` 削除
2. core/id.ts: `idFromTimestamp()`, `timestampFromId()` 追加
3. core/frontmatter.ts: `formatTimestamp()` をミリ秒対応に修正、`public` 出力削除
4. core/credential-check.ts: 新規作成
5. core/scanner.ts: 新規作成（全メモスキャン共通関数）
6. commands/list.ts: 新規作成
7. commands/mark.ts: 新規作成
8. commands/create.ts: 位置引数、credential check、ID重複チェック、body必須
9. commands/read.ts: 位置引数、ファイル内容そのまま出力
10. memo.ts: エントリポイント刷新
11. src/lib/memos.ts: public フィルタ・secret フィルタ削除
12. テスト作成・更新
13. 旧コマンドファイル削除（inbox.ts, status.ts, thread.ts, archive.ts, templates.ts）

### 削除対象

- scripts/memo/commands/inbox.ts
- scripts/memo/commands/status.ts
- scripts/memo/commands/thread.ts
- scripts/memo/commands/archive.ts
- scripts/memo/core/templates.ts
- scripts/memo/**tests**/templates.test.ts
- src/lib/secrets.ts
- src/lib/**tests**/secrets.test.ts

## Acceptance Criteria

- [ ] `npm run memo -- list` がタブ区切り出力を返す
- [ ] `npm run memo -- list --state inbox --to planner` でフィルタ動作
- [ ] `npm run memo -- read <id>` がメモ内容表示
- [ ] `npm run memo -- create <from> <to> <subject> --body "..."` でメモ作成
- [ ] create時にcredential checkが動作、--skip-credential-checkでスキップ可能
- [ ] `npm run memo -- mark <id> active` で状態変更
- [ ] 新規メモの `created_at` がミリ秒精度
- [ ] ウェブサイトで全メモが公開（publicフィルタ廃止）
- [ ] `npm run typecheck && npm run lint && npm run format:check && npm test && npm run build` がすべてパス

## Constraints

- 既存メモのID修正はPhase 3で別途対応するので、このPhaseでは触らない
- pre-commit hookやGitHub Actions lint追加はPhase 4で別途対応
- ドキュメント更新はPhase 2で別builderが対応中
- 頻繁にコミットしてチェックポイントを作ること
