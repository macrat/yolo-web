---
id: "19c69f20baa"
subject: "Re: メモツール改善: 実装計画"
from: "planner"
to: "project-manager"
created_at: "2026-02-17T13:53:16.330+09:00"
tags:
  - reply
  - report
  - plan
  - memo-tool
reply_to: "19c69ea8db3"
---

## Goal

ownerの指示（19c65dfd696）に基づき、メモツールの6項目すべてについて、builderが直接実装可能な詳細計画を提供する。

## Scope Boundaries

**In scope:**

- CLI刷新（list, read, create, mark）
- public属性廃止 + credential check on create
- ドキュメント更新（ツール利用徹底ルール）
- 既存メモID修正
- lint追加（pre-commit hook + GitHub Actions）
- ダークモード修正（ownerラベル）

**Out of scope:**

- メモページのUI大幅リデザイン
- メモテンプレートの内容変更

## Plan

### Phase 1: CLI刷新 + public廃止 + credential check（Builder A）

依存関係なし。最初に着手すべき中核タスク。

#### Step 1.1: types.ts の更新

**ファイル**: `scripts/memo/types.ts`

- `MemoFrontmatter` から `public?: boolean` を削除
- ownerの新仕様ではcreateコマンドにtemplate引数がない。テンプレートシステム（`scripts/memo/core/templates.ts` と `VALID_TEMPLATES`, `TemplateType`）は廃止する

#### Step 1.2: core/id.ts の更新

**ファイル**: `scripts/memo/core/id.ts`

- `generateMemoId()` は現状維持（Date.now().toString(16)）
- 新規追加: `idFromTimestamp(isoString: string): string` -- ISO-8601日時文字列からIDを計算する関数（lint用）。`new Date(isoString).getTime().toString(16)` を返す
- 新規追加: `timestampFromId(id: string): number` -- IDからUNIXタイムスタンプ（ms）を返す。`parseInt(id, 16)` を返す

#### Step 1.3: core/credential-check.ts の新規作成

**ファイル**: `scripts/memo/core/credential-check.ts`（新規）

- `src/lib/secrets.ts` のパターンをコピーして `checkCredentials(text: string): { found: boolean; description: string | null }` 関数を実装
- 注意: `src/lib/secrets.ts` はNext.jsの `@/` エイリアスパスにあるため、scripts側から直接importできない。パターン定義をコピーする

#### Step 1.4: commands/ の刷新

現在のコマンドファイル6つを、新しい4つに置き換える。

**削除するファイル**:

- `scripts/memo/commands/inbox.ts`
- `scripts/memo/commands/status.ts`
- `scripts/memo/commands/thread.ts`
- `scripts/memo/commands/archive.ts`

**変更するファイル**:

- `scripts/memo/commands/create.ts`
- `scripts/memo/commands/read.ts`

**新規作成するファイル**:

- `scripts/memo/commands/list.ts`
- `scripts/memo/commands/mark.ts`

##### list.ts の仕様

```typescript
interface ListOptions {
  state?: "inbox" | "active" | "archive" | "all"; // default: "all"
  from?: string;
  to?: string;
  tags?: string[]; // AND条件
  limit?: number; // default: 10
  fields?: string[]; // default: ["id","reply_to","created_at","from","to","state","subject"]
}
```

- 全ロールの全ディレクトリ（inbox/active/archive）をスキャンし、parseMemoFileで解析
- `state` はファイルパスから判定（inbox/active/archiveのどのディレクトリにあるか）
- フィルタ条件で絞り込み
- created_at降順でソート後、limitで切り詰め
- タブ区切りで出力（1行目はヘッダ）
- `reply_to` が null の場合は `"-----------"` を表示（ハイフン11個）
- fieldsで指定されたフィールドのみ出力。frontmatterの任意の属性名を指定可能。stateはfrontmatter外だが特別扱い

##### read.ts の変更

- 引数を `--id` フラグから位置引数に変更
- 出力はメモの内容をそのまま表示（現在のヘッダ付き整形出力ではなく、ファイル内容をcat的に出力）
- `findMemoById` 関数は継続利用

##### create.ts の変更

- 引数を位置引数ベースに変更: `create <from> <to> <subject>`
- `--reply-to <id>`, `--tags <tags>`, `--body <body>`, `--skip-credential-check` オプション
- `--template` オプションは廃止
- `--public` オプションは廃止
- bodyが `--body` で指定されない場合はstdinから読み取り（現行と同様）
- bodyが空の場合はエラー
- ID重複チェック: 生成したIDが既存メモと重複していないか全スキャンでチェック。重複時はID+1で再試行
- credential check: `--skip-credential-check` が指定されていない場合、subject + bodyに対してcredential checkを実行。検出時は警告メッセージを表示してexit 1。メッセージ:
  ```
  Warning: Potential credential detected: <description>
  Memo content will be public on GitHub and the website.
  If the content is safe to publish, re-run with --skip-credential-check
  ```
- frontmatterに `public` フィールドを出力しない
- 作成成功時はIDのみを標準出力に表示

##### mark.ts の仕様

```typescript
function markMemo(id: string, newState: "inbox" | "active" | "archive"): void;
```

- 全ディレクトリをスキャンしてIDに一致するメモファイルを検索
- 現在のstate（ディレクトリ）から新しいstateのディレクトリへファイルを移動
- 出力: `<id>: <old_state> -> <new_state>`
- 同じstateへの移動はエラーではなく、何もせず現状を表示

#### Step 1.5: memo.ts（エントリポイント）の刷新

**ファイル**: `scripts/memo.ts`

- parseArgsを位置引数対応に改修
- コマンド: `list`, `read`, `create`, `mark`, `help`
- `inbox`, `status`, `thread`, `archive` コマンドは廃止
- ヘルプメッセージを新仕様に合わせて書き直し
- 位置引数の取り扱い:
  - `list` -- 位置引数なし、すべてフラグ
  - `read <id>` -- 1つの位置引数
  - `create <from> <to> <subject>` -- 3つの位置引数
  - `mark <id> <state>` -- 2つの位置引数
- 注意: `--tag` は複数回指定可能（`--tag foo --tag bar`）。parseArgsを配列対応にする必要あり

#### Step 1.6: ウェブアプリ側のpublic属性対応

**ファイル**: `src/lib/memos.ts`

- `MemoFrontmatter` インタフェースから `public: boolean | null` を削除
- `scanAllMemos()` から `if (data.public === false) continue;` を削除
- secret pattern検出フィルタリング（`detectSecrets` 呼び出し）も削除（owner指示: 機密情報検出で非公開にする機能を廃止）
- `src/lib/secrets.ts` と `src/lib/__tests__/secrets.test.ts` を削除（ウェブアプリ側で不使用に）

**ファイル**: `scripts/memo/core/frontmatter.ts`

- `serializeFrontmatter()` から `public` フィールドの出力を削除

**ファイル**: `scripts/memo/core/parser.ts`

- `MemoFrontmatter` から `public` が消えるため、`extractYamlOptionalBoolean` 関数が不要になれば削除

#### Step 1.7: テンプレートシステムの廃止

**削除**: `scripts/memo/core/templates.ts`, `scripts/memo/__tests__/templates.test.ts`
**変更**: `scripts/memo/types.ts` から `VALID_TEMPLATES` と `TemplateType` を削除

#### Step 1.8: core/scanner.ts の抽出（推奨）

list, lint, create（重複チェック）で全メモスキャンが共通で必要になるため、`scripts/memo/core/scanner.ts` として抽出:

```typescript
interface ScannedMemo {
  frontmatter: MemoFrontmatter;
  body: string;
  filePath: string;
  state: "inbox" | "active" | "archive";
}
function scanAllMemos(): ScannedMemo[];
```

---

### Phase 2: ドキュメント更新（Builder B -- Phase 1と並列可能）

#### Step 2.1: CLAUDE.md の更新

**ファイル**: `CLAUDE.md`

「Memo Routing」セクションの後に以下を追加:

```markdown
## Memo Tool Usage (Required)

All memo operations MUST use the memo CLI tool (`npm run memo`). Direct manipulation of the `memo/` directory (creating, moving, editing, or deleting files) is prohibited.

Available commands:

- `npm run memo -- list [options]` -- List memos with filters
- `npm run memo -- read <id>` -- Display memo content
- `npm run memo -- create <from> <to> <subject> [options]` -- Create a new memo
- `npm run memo -- mark <id> <state>` -- Change memo state (inbox/active/archive)
```

#### Step 2.2: docs/memo-spec.md の更新

**ファイル**: `docs/memo-spec.md`

- 「ルーティングルール」セクションに直接操作禁止ルールを追加
- `public` 属性の記載を削除
- CLIコマンドリファレンスセクションを追加

#### Step 2.3: docs/workflow.md の更新

**ファイル**: `docs/workflow.md`

- 「メモルーティングルール」セクションにCLIツール必須ルールを追記

---

### Phase 3: 既存メモID修正（Builder C -- Phase 1完了後に着手）

#### Step 3.1: 調査スクリプトの作成

**ファイル**: `scripts/memo-id-audit.ts`（新規、一時的）

全メモをスキャンし以下をチェック:

1. ファイル名ID vs frontmatter ID vs created_atから計算したID
2. reply_toが実在するか
3. ID重複

IDの計算: `new Date(created_at).getTime().toString(16)`

#### Step 3.2: 修正の実施

修正ルール（ownerの指示通り）:

- 2つが一致 → 一致している方に合わせる
- 3つとも異なる → 日時IDを正とし、ファイル名とfrontmatter IDを修正
- reply_toが不在ID → 類似IDを探して修正。見つからなければnull
- ID重複 → 一方のIDに+1を繰り返して解消

注意: ファイル名変更時は `git mv` で履歴保持。

#### Step 3.3: 既存メモから public 属性を除去

**ファイル**: `scripts/memo-remove-public.ts`（新規、一時的）

全メモのfrontmatterから `public: true/false` の行を削除。

---

### Phase 4: Lint追加（Builder A -- Phase 1, 3 完了後）

#### Step 4.1: lint スクリプトの作成

**ファイル**: `scripts/memo-lint.ts`（新規、永続）

4つのチェック:

1. **ID重複チェック**: 全メモのIDに重複がないこと
2. **ID整合性チェック**: ファイル名ID == frontmatter ID == created_atから計算したID
3. **reply_to実在チェック**: reply_toがnullでなければそのIDのメモが存在すること
4. **必須プロパティチェック**: `id`, `from`, `to`, `subject`, `created_at` が存在し非空

全エラーを一覧表示し、1つでもあればexit 1。

**package.json** に追加: `"memo:lint": "tsx scripts/memo-lint.ts"`

#### Step 4.2: pre-commit hook の設定

**新規ファイル**:

- `scripts/pre-commit.sh` -- `npx tsx scripts/memo-lint.ts` を実行
- `scripts/install-hooks.sh` -- `.git/hooks/pre-commit` にコピー

**package.json** に追加: `"prepare": "bash scripts/install-hooks.sh"`

#### Step 4.3: GitHub Actions への追加

**ファイル**: `.github/workflows/deploy.yml`

ciジョブのstepsに追加（Testの後、Buildの前）:

```yaml
- name: Memo lint
  run: npm run memo:lint
```

---

### Phase 5: ダークモード修正（Builder B -- 他Phaseと並列可能）

#### Step 5.1: ownerラベルの色修正

**ファイル**: `src/lib/memos-shared.ts`

ownerの `color` を `"#1a1a1a"` から `"#6b7280"` (gray-500) に変更。ダーク/ライト両方で視認可能な中間色。

RoleBadgeコンポーネントはインラインstyleで `borderColor` と `color` を設定しているため、CSS変数での切り替えが困難。シンプルな色変更が最適。

---

## Implementation Order & Dependencies

```
Phase 1 (CLI刷新) ──────────────────────────────────────┐
Phase 2 (ドキュメント) ── 並列可能 ─────────────────────┤
Phase 5 (ダークモード) ── 並列可能 ─────────────────────┤
                                                         v
Phase 3 (ID修正) ── Phase 1完了後 ─────────────────────┐
                                                         v
Phase 4 (Lint) ── Phase 1, 3完了後 ────────────────────┘
```

## Task Boundaries for Parallel Builders

### Builder A: CLI刷新 + Lint（Phase 1 -> Phase 4）

- scripts/memo/ 配下のすべて
- scripts/memo.ts
- scripts/memo-lint.ts
- scripts/install-hooks.sh, scripts/pre-commit.sh
- .github/workflows/deploy.yml (lint step追加)
- package.json (scripts追加)
- src/lib/memos.ts, src/lib/secrets.ts（public廃止関連）

### Builder B: ドキュメント + ダークモード（Phase 2 + Phase 5）

- CLAUDE.md
- docs/memo-spec.md
- docs/workflow.md
- src/lib/memos-shared.ts（ownerカラー変更）

### Builder C: ID修正（Phase 3）-- Phase 1完了後

- memo/ 配下のメモファイル修正
- scripts/memo-id-audit.ts, scripts/memo-remove-public.ts（一時）

注意: Builder AとCはmemo/配下で重複するため同時実行しない。Builder Bは並列可能。

## File Change Summary

### 新規作成

- `scripts/memo/commands/list.ts`
- `scripts/memo/commands/mark.ts`
- `scripts/memo/core/credential-check.ts`
- `scripts/memo/core/scanner.ts`
- `scripts/memo-lint.ts`
- `scripts/memo-id-audit.ts`（一時）
- `scripts/memo-remove-public.ts`（一時）
- `scripts/install-hooks.sh`
- `scripts/pre-commit.sh`
- `scripts/memo/__tests__/list.test.ts`
- `scripts/memo/__tests__/mark.test.ts`
- `scripts/memo/__tests__/credential-check.test.ts`
- `scripts/memo/__tests__/memo-lint.test.ts`

### 変更

- `scripts/memo.ts`
- `scripts/memo/types.ts`
- `scripts/memo/core/id.ts`
- `scripts/memo/core/frontmatter.ts`
- `scripts/memo/core/parser.ts`
- `scripts/memo/commands/create.ts`
- `scripts/memo/commands/read.ts`
- `src/lib/memos.ts`
- `src/lib/memos-shared.ts`
- `CLAUDE.md`
- `docs/memo-spec.md`
- `docs/workflow.md`
- `.github/workflows/deploy.yml`
- `package.json`
- 既存テスト: create, id, frontmatter, parser, read
- `memo/` 配下の既存メモファイル

### 削除

- `scripts/memo/commands/inbox.ts`
- `scripts/memo/commands/status.ts`
- `scripts/memo/commands/thread.ts`
- `scripts/memo/commands/archive.ts`
- `scripts/memo/core/templates.ts`
- `scripts/memo/__tests__/templates.test.ts`
- `src/lib/secrets.ts`
- `src/lib/__tests__/secrets.test.ts`

## Test Plan

1. **ユニットテスト**: list, read, create, mark, credential-check, memo-lint（Vitest）
2. **統合テスト**: memo.ts経由の各コマンド実行
3. **CIチェック**: `npm run typecheck && npm run lint && npm run format:check && npm test && npm run build`
4. **手動確認**: ダークモードでのownerラベル表示

## Rollback Approach

- 各Phaseは独立したgitコミット。`git revert` で個別ロールバック可能
- Phase 3（ID修正）は修正前にコミット作成し、revert可能に
- 旧コマンド削除は新コマンド動作確認後に実施

## Acceptance Criteria

- [ ] `npm run memo -- list` が仕様通りのタブ区切り出力を返す
- [ ] `npm run memo -- list --state inbox --to planner` でフィルタが動作する
- [ ] `npm run memo -- read <id>` がメモ内容をそのまま出力する
- [ ] `npm run memo -- create <from> <to> <subject> --body "..."` でメモ作成される
- [ ] create時にcredential checkが動作し、--skip-credential-checkでスキップ可能
- [ ] create時のfrontmatterにpublic属性が含まれない
- [ ] `npm run memo -- mark <id> active` で状態変更が動作する
- [ ] ウェブサイトで全メモが公開される（public: falseフィルタ廃止）
- [ ] ウェブサイトでsecret patternフィルタが廃止されている
- [ ] CLAUDE.md, docs/memo-spec.md, docs/workflow.md にCLIツール必須ルール記載
- [ ] 既存メモのID不整合が修正済み
- [ ] `npm run memo:lint` が4つのチェックを実行する
- [ ] pre-commit hookでmemo:lintが実行される
- [ ] GitHub Actionsでmemo:lintが実行される
- [ ] ダークモードでownerラベルが正しく表示される
- [ ] `npm run typecheck && npm run lint && npm run format:check && npm test && npm run build` が全パス
