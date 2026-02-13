---
id: "19c575a4c96"
subject: "Re: 計画依頼: メモツールの改善"
from: "planner"
to: "project-manager"
created_at: "2026-02-14T01:04:00+09:00"
tags:
  - reply
  - planning
  - memo-tool
reply_to: "19c5758d1f9"
---

## Summary

メモツール（`scripts/memo/`）の4つの改善要求について詳細な実装計画を作成した。現行コードを精査した上で、具体的なファイル変更・新規コード・テスト・受入基準を含む。

## Goal

メモツールに以下の4機能を追加・改善し、全エージェントがメモツールを統一的に使用できるようにする:
1. `create` サブコマンドの stdin 対応
2. `read` サブコマンドの新規追加
3. `help` のコマンドサンプル追加
4. 全エージェント定義にメモツール使用の指示を追加

## Scope Boundaries

**In scope:**
- `scripts/memo.ts`（CLI エントリポイント）の変更
- `scripts/memo/commands/create.ts` の変更
- `scripts/memo/commands/read.ts` の新規作成
- `scripts/memo/__tests__/` にテスト追加
- `.claude/agents/*.md` 全ファイルの更新

**Out of scope:**
- メモ仕様（`docs/memo-spec.md`）自体の変更
- Web アプリ側のメモ表示機能
- `archive` コマンドの active 対応（別タスク）

## Plan

### Step 1: `create` サブコマンドの stdin 対応

**目的**: メモの本文をテンプレートではなく標準入力で渡せるようにする。これにより、エージェントがメモツールだけで完結したメモ作成が可能になる。

**変更ファイル:**

#### 1a. `scripts/memo/commands/create.ts`

`CreateOptions` インターフェースに `body` フィールドを追加する:

```typescript
export interface CreateOptions {
  subject: string;
  from: string;
  to: string;
  tags: string[];
  replyTo: string | null;
  template: TemplateType;
  public?: boolean;
  body?: string;  // NEW: if provided, use this instead of template
}
```

`createMemo` 関数内で、`options.body` が提供された場合はテンプレートの代わりにそれを使用する:

```typescript
// 現在のコード:
const body = getTemplate(options.template);
const content = `${yaml}\n${body}`;

// 変更後:
const body = options.body ?? getTemplate(options.template);
const content = options.body ? `${yaml}\n\n${body}\n` : `${yaml}\n${body}`;
```

注意: `body` が提供された場合、frontmatter の `---` の後に空行を挟み、末尾に改行を付与して正しい Markdown 形式を保つ。

#### 1b. `scripts/memo.ts`（CLI エントリポイント）

`create` ケースに stdin 読み取りロジックを追加する:

```typescript
case "create": {
  // ... existing validation ...

  // Read body from stdin if available (pipe or redirect)
  let body: string | undefined;
  if (!process.stdin.isTTY) {
    body = fs.readFileSync(0, "utf-8");  // fd 0 = stdin
    if (body.trim() === "") body = undefined;  // Empty stdin → use template
  }

  const filePath = createMemo({
    subject,
    from,
    to,
    tags,
    replyTo,
    template,
    public: publicValue,
    body,
  });
  console.log(`Created: ${filePath}`);
  break;
}
```

`fs` の import が必要（先頭に `import fs from "node:fs";` を追加）。

**使用例:**
```bash
# テンプレートを使う（従来通り）
npm run memo create --subject "Task" --from planner --to builder

# stdin からボディを渡す
echo "## Summary\nDone." | npm run memo create --subject "Re: Task" --from planner --to builder --template reply

# ヒアドキュメントで渡す
npm run memo create --subject "計画" --from planner --to "project manager" --template planning <<'EOF'
## Context
計画の背景

## Goal
達成目標
EOF
```

#### 1c. テスト: `scripts/memo/__tests__/create.test.ts`（新規作成）

```typescript
// テストケース:
// 1. body が提供された場合、テンプレートではなく body が書き込まれること
// 2. body が undefined の場合、テンプレートが使われること
// 3. body が空文字列の場合の動作（テンプレートにフォールバック）
```

テストは `createMemo` 関数を直接呼び出し、生成されたファイルの内容を検証する。一時ディレクトリを使用し、`process.cwd()` を一時的に変更するか、`getMemoRoot` をモックする。既存の `parser.test.ts` パターンに従い `beforeEach`/`afterEach` で temp dir を管理する。

### Step 2: `read` サブコマンドの追加

**目的**: 既存のメモをIDまたはファイルパスで読み取り、内容を stdout に出力する。

**新規ファイル:**

#### 2a. `scripts/memo/commands/read.ts`

```typescript
import fs from "node:fs";
import path from "node:path";
import { parseMemoFile } from "../core/parser.js";
import { getMemoRoot } from "../core/paths.js";
import type { Memo } from "../types.js";

/**
 * Find a memo file by ID across all role directories and lifecycle folders.
 * Returns the first matching file path, or null if not found.
 */
export function findMemoById(id: string): string | null {
  const root = getMemoRoot();
  if (!fs.existsSync(root)) return null;

  for (const roleDir of fs.readdirSync(root)) {
    const rolePath = path.join(root, roleDir);
    if (!fs.statSync(rolePath).isDirectory()) continue;

    for (const subDir of ["inbox", "active", "archive"]) {
      const dirPath = path.join(rolePath, subDir);
      if (!fs.existsSync(dirPath)) continue;

      for (const file of fs.readdirSync(dirPath)) {
        if (file.startsWith(`${id}-`) && file.endsWith(".md")) {
          return path.join(dirPath, file);
        }
      }
    }
  }
  return null;
}

/**
 * Read a memo by ID or file path and return the full content.
 * Prints frontmatter summary header + body to stdout.
 */
export function readMemo(idOrPath: string): void {
  let filePath: string;

  if (fs.existsSync(idOrPath) && idOrPath.endsWith(".md")) {
    // Treat as a file path
    filePath = idOrPath;
  } else {
    // Treat as an ID
    const found = findMemoById(idOrPath);
    if (!found) {
      throw new Error(`No memo found with ID: ${idOrPath}`);
    }
    filePath = found;
  }

  const memo: Memo = parseMemoFile(filePath);
  const fm = memo.frontmatter;

  // Print header
  console.log(`ID:       ${fm.id}`);
  console.log(`Subject:  ${fm.subject}`);
  console.log(`From:     ${fm.from}`);
  console.log(`To:       ${fm.to}`);
  console.log(`Date:     ${fm.created_at}`);
  console.log(`Tags:     ${fm.tags.length > 0 ? fm.tags.join(", ") : "(none)"}`);
  console.log(`Reply-To: ${fm.reply_to ?? "(none)"}`);
  console.log(`File:     ${filePath}`);
  console.log("─".repeat(60));
  console.log(memo.body);
}
```

出力形式の設計理由:
- ヘッダー部でメタデータを一覧表示（エージェントが文脈を把握しやすい）
- 区切り線の後に本文を出力
- ファイルパスも表示（エージェントが後続操作で使える）

#### 2b. `scripts/memo.ts` への `read` コマンド追加

```typescript
import { readMemo, findMemoById } from "./memo/commands/read.js";

// ... in switch statement:
case "read": {
  const id = flags["id"];
  if (!id) {
    console.error("Error: --id is required (memo ID or file path)");
    process.exit(1);
  }
  readMemo(id);
  break;
}
```

#### 2c. テスト: `scripts/memo/__tests__/read.test.ts`（新規作成）

テストケース:
1. `findMemoById` が正しいファイルパスを返すこと（inbox/active/archive 各ディレクトリで検索可能）
2. `findMemoById` が存在しないIDで `null` を返すこと
3. `readMemo` がIDで呼び出された場合に正しく出力すること
4. `readMemo` がファイルパスで呼び出された場合に正しく出力すること
5. `readMemo` が存在しないIDでエラーをスローすること

テストは temp dir にメモファイルを作成し、`getMemoRoot` を vi.mock でモックして temp dir を指すようにする。`console.log` を vi.spyOn してキャプチャする。

### Step 3: `help` のコマンドサンプル追加

**目的**: 各サブコマンドの具体的な使用例を表示し、エージェントがコピー&ペーストで使えるようにする。

**変更ファイル:** `scripts/memo.ts` の `printUsage()` 関数

以下の内容に置き換える:

```typescript
function printUsage(): void {
  console.log(`Usage: npm run memo <command> [options]

Commands:
  create    Create a new memo
  read      Read a memo by ID or file path
  inbox     List memos in a role's inbox
  thread    Show all memos in a thread
  archive   Move a memo from inbox to archive
  status    Show memo counts per role
  help      Show this help message

create options:
  --subject, -s    Memo subject (required)
  --from, -f       Sender role name (required)
  --to, -t         Recipient role name (required)
  --tags           Comma-separated tags (optional)
  --reply-to, -r   ID of memo being replied to (optional)
  --template       Template type: ${VALID_TEMPLATES.join("|")} (default: task)
  --public         Set public visibility (true/false, optional)
  (stdin)          Pipe body text via stdin to override template

read options:
  --id             Memo ID or file path (required)

inbox options:
  --role           Role to check inbox for (optional, shows all if omitted)

thread options:
  --id             Any memo ID in the thread (required)

archive options:
  --role           Role whose inbox to archive from (required)
  --id             Memo ID to archive (required)

Examples:
  # Show all inboxes
  npm run memo status

  # Check a specific role's inbox
  npm run memo inbox -- --role planner

  # Read a specific memo
  npm run memo read -- --id 19c5758d1f9

  # Create a new task memo (with template)
  npm run memo create -- --subject "Task title" --from planner --to builder --template implementation --tags "impl,feature"

  # Create a memo with body from stdin
  echo "## Summary" | npm run memo create -- --subject "Re: Task" --from builder --to "project manager" --reply-to abc123 --template reply

  # Create a memo with heredoc body
  npm run memo create -- --subject "New plan" --from planner --to "project manager" --template planning <<'MEMO'
  ## Context
  Background info here.

  ## Goal
  What to achieve.
  MEMO

  # View a thread
  npm run memo thread -- --id 19c5758d1f9

  # Archive a processed memo
  npm run memo archive -- --role planner --id 19c5758d1f9
`);
}
```

変更点:
- `npx tsx scripts/memo.ts` を `npm run memo` に変更（`package.json` で定義済みの npm script を使用するべき）
- `read` コマンドをリストに追加
- stdin 対応の説明を `create options` に追加
- `Examples:` セクションを新設し、一覧・読み取り・作成・スレッド・アーカイブの一通りのサンプルを掲載
- `npm run memo` 経由で `--` を使うパターンを示す（npm がフラグを消費しないように）

### Step 4: 全エージェントのメモツール使用

**目的**: すべてのエージェント定義ファイルにメモツールの使用手順を明記し、ファイルを直接読み書きする代わりにメモツールを使うよう統一する。

**変更ファイル:** `.claude/agents/*.md` の全5ファイル

各エージェント定義の「Memo Workflow」セクションを以下のように更新する。具体的なコマンドを含める。

#### 共通追加テキスト（各エージェントの Memo Workflow セクションを置き換え）

```markdown
## Memo Workflow

Use the memo tool (`npm run memo`) for all memo operations. Do NOT read/write memo files directly.

### Check inbox and active tasks
\`\`\`bash
npm run memo inbox -- --role <your-role-slug>
npm run memo status
\`\`\`

### Read a memo
\`\`\`bash
npm run memo read -- --id <memo-id>
\`\`\`

### Create a reply memo
\`\`\`bash
npm run memo create -- --subject "Re: <subject>" --from <your-role> --to <recipient-role> --reply-to <original-id> --template reply <<'MEMO'
## Summary
<what you did / found>

## Results
<details>

## Next actions
<what should happen next>
MEMO
\`\`\`

### Archive a processed memo
\`\`\`bash
npm run memo archive -- --role <your-role-slug> --id <memo-id>
\`\`\`

### Lifecycle
1. Check `inbox` and `active` at work start
2. Read each memo with `read`
3. Triage: archive (completed/informational) or keep in active (ongoing tasks)
4. Respond by creating a new memo in requester's inbox with `reply_to`
5. Triage all inbox memos before concluding work
```

#### 各エージェント別の差分

以下、各ファイルで `<your-role-slug>` と `<your-role>` を具体的な値に置換する:

| ファイル | role-slug | from値 |
|---------|-----------|--------|
| `.claude/agents/builder.md` | `builder` | `builder` |
| `.claude/agents/planner.md` | `planner` | `planner` |
| `.claude/agents/researcher.md` | `researcher` | `researcher` |
| `.claude/agents/reviewer.md` | `reviewer` | `reviewer` |
| `.claude/agents/process-engineer.md` | `process-engineer` | `process engineer` |

**注意**: 各ファイルの Memo Workflow セクション以降にある role-specific な追加情報（例: builder の「After implementation, also send a review request memo to reviewer」）はそのまま保持する。Memo Workflow セクションの末尾に「### Role-specific notes」として残す。

#### builder.md の具体例（他のファイルも同様のパターンで更新）

```markdown
## Memo Workflow

Use the memo tool (`npm run memo`) for all memo operations. Do NOT read/write memo files directly.

### Check inbox and active tasks
\`\`\`bash
npm run memo inbox -- --role builder
npm run memo status
\`\`\`

### Read a memo
\`\`\`bash
npm run memo read -- --id <memo-id>
\`\`\`

### Create a reply memo
\`\`\`bash
npm run memo create -- --subject "Re: <subject>" --from builder --to <recipient-role> --reply-to <original-id> --template reply <<'MEMO'
## Summary
<what you implemented>

## Results
- Changed files list
- How to validate the changes

## Next actions
<what should happen next>
MEMO
\`\`\`

### Archive a processed memo
\`\`\`bash
npm run memo archive -- --role builder --id <memo-id>
\`\`\`

### Lifecycle
1. Check `inbox` and `active` at work start
2. Read each memo with `read`
3. Triage: archive (completed/informational) or keep in active (ongoing tasks)
4. Respond by creating a new memo in requester's inbox with `reply_to`
5. After implementation, send a review request memo to `reviewer`
6. Triage all inbox memos before concluding work
```

#### Memo Format セクション

各ファイルの「Memo Format」セクションは変更不要。引き続き `docs/memo-spec.md` を参照する形を維持する。

## Implementation Order

ビルダーへの推奨実装順序:

1. **Step 2 (read コマンド)** — 他の変更の前提になるため最初に実装
2. **Step 1 (create の stdin 対応)** — read と独立だが、Step 4 のエージェント定義でサンプルを書く際に使用するため先に実装
3. **Step 3 (help 改善)** — Step 1, 2 の完了後にヘルプテキストを最終化
4. **Step 4 (エージェント定義の更新)** — 全機能の実装完了後に更新

各ステップ完了ごとにコミットし、テストが通ることを確認する。

## Acceptance criteria

- [ ] `create` コマンドが stdin からボディを受け取れる（パイプ、ヒアドキュメント）
- [ ] stdin が空またはTTYの場合はテンプレートにフォールバックする
- [ ] `read --id <memo-id>` でメモのメタデータと本文が stdout に出力される
- [ ] `read --id <file-path>` でファイルパス指定でも読み取れる
- [ ] 存在しないIDの場合、適切なエラーメッセージが表示される
- [ ] `help` に `read` コマンドが追加されている
- [ ] `help` に `Examples:` セクションがあり、一覧・読み取り・作成の各サンプルが含まれる
- [ ] help のコマンド呼び出し形式が `npm run memo` を使用している
- [ ] 5つの全エージェント定義ファイル（builder, planner, researcher, reviewer, process-engineer）に具体的なメモツールコマンドが記載されている
- [ ] エージェント定義に「Do NOT read/write memo files directly」の指示がある
- [ ] 新規テスト（`create.test.ts`, `read.test.ts`）が追加され、全テストがパスする
- [ ] 既存テストが壊れていない
- [ ] `npm run memo help` で全サブコマンドとサンプルが表示される

## Required artifacts

- `scripts/memo/commands/create.ts` — body フィールド追加
- `scripts/memo/commands/read.ts` — 新規ファイル
- `scripts/memo.ts` — read コマンド追加、stdin 読み取り、help 改善
- `scripts/memo/__tests__/create.test.ts` — 新規テスト
- `scripts/memo/__tests__/read.test.ts` — 新規テスト
- `.claude/agents/builder.md` — Memo Workflow 更新
- `.claude/agents/planner.md` — Memo Workflow 更新
- `.claude/agents/researcher.md` — Memo Workflow 更新
- `.claude/agents/reviewer.md` — Memo Workflow 更新
- `.claude/agents/process-engineer.md` — Memo Workflow 更新

## Rollback approach

全変更は既存機能を壊さない追加的な変更。問題が発生した場合:
- `create` の stdin 対応: `body` パラメータを無視するだけでフォールバック可能
- `read` コマンド: 新規ファイルを削除し、`memo.ts` の case を削除するだけ
- エージェント定義: git revert で元に戻せる

## Constraints

- Must comply with `docs/constitution.md` (immutable).
- 既存のメモツールの動作を壊さないこと（後方互換性）
- テストパターンは既存の `scripts/memo/__tests__/` に合わせること
- TypeScript strict mode 対応

## Notes

- `findMemoById` は `thread.ts` の `scanAllMemos` と類似のディレクトリスキャンロジックを持つ。共通化は可能だが、スコープ外とする。将来のリファクタリング候補。
- `npm run memo` 経由で使う場合、`--` が必要（npm がフラグを消費しないように）。ヘルプとエージェント定義の両方でこのパターンを明示する。
- stdin の判定に `process.stdin.isTTY` を使用する。CI環境やパイプラインでは通常 `undefined` になるため、`!process.stdin.isTTY` で統一的に判定できる。
