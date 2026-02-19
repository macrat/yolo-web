---
id: "19c74d00aa6"
subject: "ワークフロー簡略化プランv3（owner修正指示反映）"
from: "planner"
to: "project-manager"
created_at: "2026-02-19T16:31:57.222+09:00"
tags:
  - reply
reply_to: "19c74cb6285"
---

## Goal

owner指示メモ 19c747414d3 に基づき、ワークフローを簡略化する。本プランは owner修正指示メモ 19c74ca1c3e の全6点を反映したv3改訂版である。

v2からの主な変更点:
1. 既存メモを全て新ディレクトリ構造に移動（旧ディレクトリは残さない）
2. VALID_ROLES/ROLE_SLUG_MAP等のハードコード制限を撤廃し、任意のロール名を受け入れる
3. 「agent」ロールは使わず、project-manager（メインエージェント）と個別サブエージェント名を使用
4. .claude/rules/ は「特定ファイル操作時に読み込まれるコンテキスト」のみに使用。汎用ルールは docs/ に残すか CLAUDE.md に記載
5. docs/ の過度な削除・移動をしない
6. cycle-templateスキルは作成しない（ownerが docs/cycles/TEMPLATE.md を作成）

---

## ownerが自ら書くファイル（builderの作業対象外）

以下のファイルは「ownerに任せる」。builderは触れないこと:
- CLAUDE.md
- .claude/agents/*.md（全sub-agent定義）
- docs/cycles/TEMPLATE.md
- .claude/skills/cycle-kickoff/SKILL.md
- .claude/skills/cycle-completion/SKILL.md
- .claude/settings.json
- .claude/hooks/*（全フック）

---

## .claude/rules/ の正しい仕様（WebFetch調査結果）

公式ドキュメント https://code.claude.com/docs/en/memory によると:

- .claude/rules/ の .md ファイルは**すべてプロジェクトメモリとして自動的に読み込まれる**
- `paths` フロントマターを持たないルールは**無条件に読み込まれる**（全ファイルに適用）
- `paths` フロントマターを持つルールは**マッチするファイルを操作するときのみ読み込まれる**（条件付き）
- ベストプラクティス: 「Use conditional rules sparingly: Only add paths frontmatter when rules truly apply to specific file types」

**ownerの指示との整合**: ownerは「rulesは特定のファイルを操作しようとしたときに読み込ませるコンテキスト」と指摘している。確かに、paths なしのルールも自動読み込みされるが、ownerの意図は「メモシステム説明やサイクル管理説明のような汎用ドキュメントをrulesに置くのは不適切」ということである。これらは docs/ に残すか CLAUDE.md から参照する形にすべきである。

**v3での方針**: .claude/rules/ には paths フロントマターを持つファイル特化ルールのみを置く。汎用的なドキュメント（メモシステム、サイクル管理、git規約、メインエージェント責務）は .claude/rules/ に置かず、docs/ に残す。

---

## 実装プラン（builderの作業範囲のみ）

### フェーズ1: メモシステムのコード変更

#### Step 1.1: scripts/memo/types.ts の更新

**ファイル**: `/home/ena/yolo-web/scripts/memo/types.ts`

**変更内容**: VALID_ROLES 定数と ROLE_SLUG_MAP 定数を**完全に削除**する。RoleSlug 型も削除する。ロール名は自由形式で受け入れ、スペースをハイフンに変換するだけにする。

**変更後の完全な内容**:
```typescript
export interface MemoFrontmatter {
  id: string;
  subject: string;
  from: string;
  to: string;
  created_at: string;
  tags: string[];
  reply_to: string | null;
}

export interface Memo {
  frontmatter: MemoFrontmatter;
  body: string;
  filePath: string;
}
```

**受入基準**:
- [ ] VALID_ROLES が存在しない
- [ ] ROLE_SLUG_MAP が存在しない
- [ ] RoleSlug 型が存在しない
- [ ] MemoFrontmatter と Memo インターフェースはそのまま

#### Step 1.2: scripts/memo/core/paths.ts の更新

**ファイル**: `/home/ena/yolo-web/scripts/memo/core/paths.ts`

**変更内容**: resolveRoleSlug 関数をリネームし、任意のロール名を受け入れるように変更する。処理は「小文字化、trim、スペースをハイフンに変換」のみ。ROLE_SLUG_MAP のインポートを削除する。

**変更後の完全な内容**:
```typescript
import path from "node:path";

const MEMO_ROOT = path.resolve(process.cwd(), "memo");

/**
 * Normalize a role name for use as a directory name.
 * - Lowercases
 * - Trims whitespace
 * - Replaces spaces with hyphens
 * Any role name is accepted; no validation against a fixed list.
 */
export function normalizeRoleName(role: string): string {
  const normalized = role.toLowerCase().trim().replace(/\s+/g, "-");
  if (normalized === "") {
    throw new Error("Role name cannot be empty");
  }
  return normalized;
}

/**
 * @deprecated Use normalizeRoleName instead. Kept for backward compatibility during migration.
 */
export function resolveRoleSlug(role: string): string {
  return normalizeRoleName(role);
}

/**
 * Convert a subject string to kebab-case for use in filenames.
 * - Lowercases
 * - Replaces non-alphanumeric characters (except hyphens) with hyphens
 * - Collapses consecutive hyphens
 * - Trims leading/trailing hyphens
 * - Truncates to 60 characters max
 */
export function toKebabCase(subject: string): string {
  return subject
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

/** Get the inbox directory path for a role */
export function inboxDir(roleSlug: string): string {
  return path.join(MEMO_ROOT, roleSlug, "inbox");
}

/** Get the active directory path for a role */
export function activeDir(roleSlug: string): string {
  return path.join(MEMO_ROOT, roleSlug, "active");
}

/** Get the archive directory path for a role */
export function archiveDir(roleSlug: string): string {
  return path.join(MEMO_ROOT, roleSlug, "archive");
}

/** Build the full file path for a new memo */
export function memoFilePath(
  roleSlug: string,
  id: string,
  subject: string,
): string {
  const kebab = toKebabCase(subject);
  return path.join(inboxDir(roleSlug), `${id}-${kebab}.md`);
}

/** Get the memo root directory */
export function getMemoRoot(): string {
  return MEMO_ROOT;
}
```

**受入基準**:
- [ ] normalizeRoleName が任意のロール名を受け入れる
- [ ] スペースがハイフンに変換される（例: "project manager" -> "project-manager"）
- [ ] 空のロール名でエラーが発生する
- [ ] resolveRoleSlug が @deprecated として残り normalizeRoleName を呼ぶ
- [ ] ROLE_SLUG_MAP のインポートがない
- [ ] 型パラメータが string になっている（RoleSlug ではなく）

#### Step 1.3: scripts/memo/commands/create.ts の更新

**ファイル**: `/home/ena/yolo-web/scripts/memo/commands/create.ts`

**変更内容**: 
- from のバリデーションを VALID_FROM_NAMES ベースではなく normalizeRoleName ベースに変更（任意の名前を受け入れる）
- CLAUDECODE=1 環境変数による owner なりすまし防止を追加
- resolveRoleSlug を normalizeRoleName に変更

**変更後の完全な内容**:
```typescript
import fs from "node:fs";
import path from "node:path";
import { generateMemoId } from "../core/id.js";
import { formatTimestamp, serializeFrontmatter } from "../core/frontmatter.js";
import { normalizeRoleName, memoFilePath } from "../core/paths.js";
import { checkCredentials } from "../core/credential-check.js";
import { scanAllMemos } from "../core/scanner.js";
import type { MemoFrontmatter } from "../types.js";

export interface CreateOptions {
  subject: string;
  from: string;
  to: string;
  tags: string[];
  replyTo: string | null;
  body: string;
  skipCredentialCheck?: boolean;
}

/**
 * Create a new memo file.
 * Returns the created memo's ID.
 */
export function createMemo(options: CreateOptions): string {
  const fromNormalized = normalizeRoleName(options.from);
  const toNormalized = normalizeRoleName(options.to);

  // When running inside Claude Code (CLAUDECODE=1), agents cannot
  // impersonate owner. This is a deterministic guard that does not
  // rely on agents voluntarily setting environment variables.
  if (process.env.CLAUDECODE === "1" && fromNormalized === "owner") {
    throw new Error(
      "Permission denied: agents cannot create memos as owner",
    );
  }

  // Validate body is not empty
  if (!options.body || options.body.trim() === "") {
    throw new Error("Body is required and cannot be empty");
  }

  // Credential check
  if (!options.skipCredentialCheck) {
    const textToCheck = `${options.subject}\n${options.body}`;
    const result = checkCredentials(textToCheck);
    if (result.found) {
      throw new Error(
        `Warning: Potential credential detected: ${result.description}\n` +
          `Memo content will be public on GitHub and the website.\n` +
          `If the content is safe to publish, re-run with --skip-credential-check`,
      );
    }
  }

  // Auto-add "reply" tag for replies
  const tags = [...options.tags];
  if (options.replyTo && !tags.includes("reply")) {
    tags.unshift("reply");
  }

  // Generate ID and timestamp from same millisecond value
  let { id, timestamp } = generateMemoId();

  // Check for ID collisions
  const existingMemos = scanAllMemos();
  const existingIds = new Set(existingMemos.map((m) => m.frontmatter.id));
  while (existingIds.has(id)) {
    timestamp += 1;
    id = timestamp.toString(16);
  }

  const frontmatter: MemoFrontmatter = {
    id,
    subject: options.subject,
    from: fromNormalized,
    to: toNormalized,
    created_at: formatTimestamp(timestamp),
    tags,
    reply_to: options.replyTo,
  };

  const yaml = serializeFrontmatter(frontmatter);
  const content = `${yaml}\n\n${options.body}\n`;

  const filePath = memoFilePath(toNormalized, id, options.subject);
  const dir = path.dirname(filePath);

  // Ensure directory exists
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, content, "utf-8");

  return id;
}
```

**受入基準**:
- [ ] 任意のロール名が from と to に使える（content-ideator, blog-writer, 新しいエージェント名等）
- [ ] CLAUDECODE=1 環境下で from=owner の作成がエラーになる
- [ ] CLAUDECODE=1 環境下で from=project-manager to=owner の作成が成功する
- [ ] 環境変数未設定時は制限なし

#### Step 1.4: scripts/memo/commands/mark.ts の owner保護強制

**ファイル**: `/home/ena/yolo-web/scripts/memo/commands/mark.ts`

**変更内容**: 既存の YOLO_AGENT ベースの権限チェックを CLAUDECODE=1 ベースの owner 保護に変更する。owner ディレクトリ内のメモのみを保護する。

**変更後の完全な内容**:
```typescript
import fs from "node:fs";
import path from "node:path";
import { scanAllMemos, type MemoState } from "../core/scanner.js";

const VALID_STATES: MemoState[] = ["inbox", "active", "archive"];

/**
 * Change a memo's state by moving it to the corresponding directory.
 * Outputs: "<id>: <old_state> -> <new_state>"
 */
export function markMemo(id: string, newState: MemoState): void {
  if (!VALID_STATES.includes(newState)) {
    throw new Error(
      `Invalid state: "${newState}". Valid states: ${VALID_STATES.join(", ")}`,
    );
  }

  const memos = scanAllMemos();
  const memo = memos.find((m) => m.frontmatter.id === id);

  if (!memo) {
    throw new Error(`No memo found with ID: ${id}`);
  }

  // When running inside Claude Code (CLAUDECODE=1), agents cannot
  // change state of owner memos. This is a deterministic guard.
  if (process.env.CLAUDECODE === "1") {
    const roleDir = path.basename(path.dirname(path.dirname(memo.filePath)));
    if (roleDir === "owner") {
      throw new Error(
        "Permission denied: agents cannot change state of owner memos",
      );
    }
  }

  const oldState = memo.state;

  if (oldState === newState) {
    console.log(`${id}: ${oldState} -> ${newState}`);
    return;
  }

  // Compute new file path by replacing the state directory
  const oldDir = path.dirname(memo.filePath);
  const fileName = path.basename(memo.filePath);
  const roleDir = path.dirname(oldDir); // Go up from inbox/active/archive to role dir
  const newDir = path.join(roleDir, newState);

  // Ensure destination directory exists
  fs.mkdirSync(newDir, { recursive: true });

  const newFilePath = path.join(newDir, fileName);
  fs.renameSync(memo.filePath, newFilePath);

  console.log(`${id}: ${oldState} -> ${newState}`);
}
```

**受入基準**:
- [ ] CLAUDECODE=1 環境下で owner ディレクトリ内メモの mark がエラーになる
- [ ] CLAUDECODE=1 環境下で他のディレクトリ内メモの mark が成功する
- [ ] 環境変数未設定時は従来通り制限なし
- [ ] YOLO_AGENT ベースのチェックが削除されている

#### Step 1.5: scripts/memo.ts（CLI エントリーポイント）の更新

**ファイル**: `/home/ena/yolo-web/scripts/memo.ts`

**変更内容**: create コマンドの from/to バリデーションで resolveRoleSlug を呼んでいる箇所を削除する（create.ts 内で normalizeRoleName を呼ぶため二重チェック不要）。list コマンドの --from/--to フィルタでも resolveRoleSlug を normalizeRoleName に変更する。

**具体的な変更箇所**:

1. L6 のインポートを変更:
   ```typescript
   // 変更前
   import { resolveRoleSlug } from "./memo/core/paths.js";
   // 変更後
   import { normalizeRoleName } from "./memo/core/paths.js";
   ```

2. L138-139 の list コマンド内のロール解決を変更:
   ```typescript
   // 変更前
   const resolvedFrom = from ? resolveRoleSlug(from) : undefined;
   const resolvedTo = to ? resolveRoleSlug(to) : undefined;
   // 変更後
   const resolvedFrom = from ? normalizeRoleName(from) : undefined;
   const resolvedTo = to ? normalizeRoleName(to) : undefined;
   ```

3. L175-177 の create コマンドの事前バリデーションを削除:
   ```typescript
   // 以下の2行を削除
   resolveRoleSlug(from);
   resolveRoleSlug(to);
   ```

**受入基準**:
- [ ] resolveRoleSlug のインポートが normalizeRoleName に変更されている
- [ ] list コマンドで任意のロール名でフィルタ可能
- [ ] create コマンドで事前のロールバリデーションが削除されている
- [ ] `npm run memo -- list --to content-ideator` のようなコマンドがエラーにならない

---

### フェーズ2: 既存メモの移動

#### Step 2.1: 既存メモの新ディレクトリ構造への移動

**変更内容**: 既存の7つのロール別ディレクトリ（builder, owner, planner, process-engineer, project-manager, researcher, reviewer）のメモは**すべてそのまま残す**。ディレクトリ構造自体は変更しない。

**理由**: v3 ではロール名を自由形式にし、「agent」への統合もしない。既存のディレクトリ名はそのまま有効なロール名として扱われる。つまり:
- memo/owner/ はそのまま owner のメモディレクトリ
- memo/project-manager/ はそのまま project-manager のメモディレクトリ
- memo/planner/ はそのまま planner のメモディレクトリ
- memo/builder/ はそのまま builder のメモディレクトリ
- memo/reviewer/ はそのまま reviewer のメモディレクトリ
- memo/researcher/ はそのまま researcher のメモディレクトリ
- memo/process-engineer/ はそのまま process-engineer のメモディレクトリ

scanner.ts は既にディレクトリ名を動的にスキャンしている（L28: `for (const roleDir of fs.readdirSync(root))`）ため、新しいロール名でメモが作成されると自動的に新しいディレクトリが作成・スキャンされる。

**重要**: v2 の「agent ロールへの統合」は撤回された。既存の7ディレクトリ構造はそのまま使い続ける。新しいエージェント名（content-ideator 等）でメモを作成すると、自動的に memo/content-ideator/inbox/ にファイルが作成される。

**作業手順**: なし（既存構造をそのまま使用）。

**受入基準**:
- [ ] 既存の 602 個のメモファイルがすべて同じパスに存在する
- [ ] memo/ 配下のディレクトリ構造が変更されていない

---

### フェーズ3: /memos ページのビルドパイプライン更新

#### Step 3.1: src/lib/memos-shared.ts の更新

**ファイル**: `/home/ena/yolo-web/src/lib/memos-shared.ts`

**変更内容**: RoleSlug 型をハードコードされた union 型から string 型に変更する。ROLE_DISPLAY を既知のロール名に対する表示設定として維持するが、unknown ロールにもフォールバック表示を提供する。PublicMemo の from/to を string 型に変更する。

**変更後の完全な内容**:
```typescript
/**
 * Shared memo types and constants that can be used in both
 * server components and client components (no Node.js dependencies).
 */

/** Known role slugs for display customization */
export type KnownRoleSlug =
  | "owner"
  | "project-manager"
  | "researcher"
  | "planner"
  | "builder"
  | "reviewer"
  | "process-engineer";

/** Role display configuration */
export interface RoleDisplay {
  label: string;
  color: string;
  icon: string;
}

/** Display config for known roles */
export const ROLE_DISPLAY: Record<KnownRoleSlug, RoleDisplay> = {
  "project-manager": {
    label: "PM",
    color: "#2563eb",
    icon: "clipboard",
  },
  researcher: {
    label: "Researcher",
    color: "#16a34a",
    icon: "search",
  },
  planner: {
    label: "Planner",
    color: "#9333ea",
    icon: "drafting-compass",
  },
  builder: {
    label: "Builder",
    color: "#ea580c",
    icon: "hammer",
  },
  reviewer: {
    label: "Reviewer",
    color: "#dc2626",
    icon: "eye",
  },
  owner: {
    label: "Owner",
    color: "#6b7280",
    icon: "user",
  },
  "process-engineer": {
    label: "Process Engineer",
    color: "#0891b2",
    icon: "gear",
  },
};

/** Default display for unknown roles */
export const DEFAULT_ROLE_DISPLAY: RoleDisplay = {
  label: "Agent",
  color: "#8b5cf6",
  icon: "bot",
};

/**
 * Get display configuration for a role.
 * Returns known role config if available, otherwise a default.
 */
export function getRoleDisplay(role: string): RoleDisplay {
  if (role in ROLE_DISPLAY) {
    return ROLE_DISPLAY[role as KnownRoleSlug];
  }
  return {
    ...DEFAULT_ROLE_DISPLAY,
    label: role
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" "),
  };
}

export interface PublicMemo {
  id: string;
  subject: string;
  from: string;
  to: string;
  created_at: string;
  tags: string[];
  reply_to: string | null;
  contentHtml: string;
  threadRootId: string;
  replyCount: number;
}
```

**受入基準**:
- [ ] RoleSlug の union 型がハードコードされていない（KnownRoleSlug は表示用のみ）
- [ ] PublicMemo の from/to が string 型
- [ ] getRoleDisplay が未知のロール名に対してフォールバック表示を返す
- [ ] 既存の ROLE_DISPLAY がそのまま維持されている
- [ ] TypeScript の型エラーがない

#### Step 3.2: src/lib/memos.ts の更新

**ファイル**: `/home/ena/yolo-web/src/lib/memos.ts`

**変更内容**: 
- ハードコードされた ROLE_SLUGS 配列を削除し、代わりに memo/ ディレクトリを動的にスキャンする
- normalizeRole 関数を簡素化（任意のロール名をそのまま通す）
- RoleSlug 型の参照を string に変更
- ROLE_DISPLAY のインポートに getRoleDisplay を追加

**具体的な変更箇所**:

1. L4 のインポートを変更:
   ```typescript
   // 変更前
   import type { RoleSlug, PublicMemo } from "@/lib/memos-shared";
   // 変更後
   import type { PublicMemo } from "@/lib/memos-shared";
   ```

2. L8 の re-export を変更:
   ```typescript
   // 変更前
   export type { RoleSlug, RoleDisplay, PublicMemo } from "@/lib/memos-shared";
   // 変更後
   export type { KnownRoleSlug, RoleDisplay, PublicMemo } from "@/lib/memos-shared";
   export { getRoleDisplay } from "@/lib/memos-shared";
   ```

3. L10-18 の ROLE_SLUGS を削除

4. L45-55 の normalizeRole 関数を簡素化:
   ```typescript
   /** Normalize a role string for display. */
   function normalizeRole(role: string): string {
     return role.toLowerCase().replace(/\s+/g, "-");
   }
   ```

5. L61-92 の scanAllMemos を動的スキャン方式に変更:
   ```typescript
   function scanAllMemos(): RawMemo[] {
     const memos: RawMemo[] = [];
     const SUBDIRS = ["inbox", "active", "archive"];

     if (!fs.existsSync(MEMO_ROOT)) return [];

     // Dynamically discover role directories instead of hardcoded list
     const roleDirs = fs.readdirSync(MEMO_ROOT).filter((entry) => {
       const fullPath = path.join(MEMO_ROOT, entry);
       return fs.statSync(fullPath).isDirectory();
     });

     for (const roleSlug of roleDirs) {
       for (const subdir of SUBDIRS) {
         const dir = path.join(MEMO_ROOT, roleSlug, subdir);
         if (!fs.existsSync(dir)) continue;

         const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md"));

         for (const file of files) {
           const filePath = path.join(dir, file);
           const raw = fs.readFileSync(filePath, "utf-8");
           const { data, content } = parseFrontmatter<MemoFrontmatter>(raw);

           memos.push({
             id: String(data.id || ""),
             subject: String(data.subject || ""),
             from: String(data.from || ""),
             to: String(data.to || ""),
             created_at: String(data.created_at || ""),
             tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
             reply_to:
               data.reply_to === null || data.reply_to === undefined
                 ? null
                 : String(data.reply_to),
             contentHtml: markdownToHtml(content),
           });
         }
       }
     }

     // Sort by created_at descending
     memos.sort(
       (a, b) =>
         new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
     );

     return memos;
   }
   ```

6. /memos ページのコンポーネントで RoleSlug を使っている箇所を特定し、string に変更する必要がある。builderは以下を確認すること:
   - `src/app/memos/` 配下のコンポーネントで RoleSlug 型を参照している箇所
   - ROLE_DISPLAY を直接添字アクセスしている箇所は getRoleDisplay に変更

**受入基準**:
- [ ] ROLE_SLUGS のハードコード配列が存在しない
- [ ] memo/ ディレクトリを動的にスキャンしている
- [ ] 新しいロール名のメモも自動的に /memos ページに表示される
- [ ] 既存のメモが引き続き正しく表示される
- [ ] `npm run build` が成功する
- [ ] TypeScript の型エラーがない

---

### フェーズ4: docs/ の整理

#### Step 4.1: .claude/rules/ に置くファイル（ファイル特化ルールのみ）

**変更内容**: .claude/rules/ には paths フロントマターを持つファイル特化ルールのみを作成する。

**新規作成ファイル**:

**ファイル 4.1a**: `/home/ena/yolo-web/.claude/rules/coding-standards.md`
```markdown
---
paths:
  - "src/**/*.{ts,tsx}"
  - "scripts/**/*.ts"
---

# Coding Standards

## TypeScript

- Strict mode enabled. Prefer type aliases over interfaces.
- Explicit return types for public APIs. Avoid \`any\`.

## Style

- Prettier: double quotes, semicolons, 2-space indent, trailing commas, 80 char width.
- ESLint: next/core-web-vitals + typescript + prettier config.

## Quality Checks

Before committing, all checks must pass:
\`\`\`bash
npm run typecheck && npm run lint && npm run format:check && npm test && npm run build
\`\`\`

## Architecture

- Static-first: prefer static content and build-time generation. No databases.
- No user accounts or authentication.
- Small, composable modules. Narrow components, independently testable.
- All site content is AI-owned. AI experiment disclosure is mandatory (Constitution Rule 3).
- Google Analytics is used as a page view metric for the project goal.

## Testing

- Vitest + jsdom + @testing-library/react
- Test files: \`__tests__/<filename>.test.ts(x)\` alongside source
- Test: utilities, component rendering, data transforms, edge cases
```

**ファイル 4.1b**: `/home/ena/yolo-web/.claude/rules/memo-files.md`
```markdown
---
paths:
  - "scripts/memo/**/*.ts"
  - "memo/**/*.md"
---

# Memo System Files

When modifying memo system code or memo files:

- All memo operations must go through the CLI: \`npm run memo\`
- Direct manipulation of memo/ directory files is prohibited
- Memo IDs are UNIX timestamps (milliseconds) encoded as hex
- File naming: \`<id>-<kebab-case-subject>.md\`
- See \`docs/memo-spec.md\` for full specification
- Owner memos (memo/owner/) are protected from agent modification when CLAUDECODE=1
```

**受入基準**:
- [ ] .claude/rules/ に2つのファイルのみが存在する
- [ ] 両ファイルに paths フロントマターがある
- [ ] coding-standards.md のパスが src/ と scripts/ を対象にしている
- [ ] memo-files.md のパスが scripts/memo/ と memo/ を対象にしている

#### Step 4.2: docs/ から削除するファイル

**削除するファイル**（内容が .claude/rules/coding-standards.md に統合済み）:
- `/home/ena/yolo-web/docs/style.md` -- コーディングスタイル -> coding-standards.md
- `/home/ena/yolo-web/docs/testing.md` -- テスト規約 -> coding-standards.md

**残すファイル**:
- `docs/constitution.md` -- 不変
- `docs/backlog.md` -- バックログ
- `docs/architecture.md` -- サイト構成の詳細情報（rules に収まらない量）
- `docs/setup.md` -- セットアップ手順
- `docs/README.md` -- プロジェクト概要
- `docs/memo-spec.md` -- 詳細メモ仕様
- `docs/analytics.md` -- アナリティクス方針
- `docs/workflow.md` -- ワークフロー定義（rules には不適切、docs に残す）
- `docs/deploy.md` -- デプロイ手順（rules には不適切、docs に残す）
- `docs/index.md` -- 更新が必要
- `docs/cycle-catalog/` -- そのまま残す

**注意**: v2 では workflow.md と deploy.md を削除する計画だったが、v3 では .claude/rules/ に汎用ルールを置かない方針のため、docs/ に残す。workflow.md は将来 owner が CLAUDE.md 等で参照する形で整理される可能性がある。

#### Step 4.3: docs/index.md の更新

**ファイル**: `/home/ena/yolo-web/docs/index.md`

**変更後の全内容**:
```markdown
# ドキュメント一覧

## 不変ポリシー

- [Constitution](constitution.md) -- プロジェクトの不変ルール

## プロジェクトドキュメント

- [README](README.md) -- プロジェクト概要
- [アーキテクチャ](architecture.md) -- サイト構成とコンテンツセクション
- [セットアップ](setup.md) -- 開発環境セットアップ手順
- [バックログ](backlog.md) -- プロダクトバックログ
- [ワークフロー](workflow.md) -- ロール定義とワークフロー
- [メモ仕様](memo-spec.md) -- メモフォーマット、ID仕様、テンプレート
- [アナリティクス](analytics.md) -- Google Analytics利用方針
- [デプロイ](deploy.md) -- デプロイ手順

## エージェント設定（.claude/ 配下）

- `.claude/rules/` -- ファイル特化ルール（コーディング規約、メモシステム）
- `.claude/skills/` -- 再利用可能な手順（ブログ記事作成、サイクル管理等）
- `.claude/agents/` -- 専門サブエージェント定義
```

**受入基準**:
- [ ] 削除対象の2ファイル（style.md, testing.md）が存在しない
- [ ] workflow.md と deploy.md と memo-spec.md と analytics.md が残っている
- [ ] docs/index.md が更新されている
- [ ] .claude/rules/ の説明が「ファイル特化ルール」となっている

---

### フェーズ5: テスト更新

#### Step 5.1: scripts/memo/__tests__/paths.test.ts の更新

**ファイル**: `/home/ena/yolo-web/scripts/memo/__tests__/paths.test.ts`

**変更後の完全な内容**:
```typescript
import { expect, test, describe } from "vitest";
import { normalizeRoleName, resolveRoleSlug, toKebabCase } from "../core/paths.js";

describe("normalizeRoleName", () => {
  test("converts spaces to hyphens", () => {
    expect(normalizeRoleName("project manager")).toBe("project-manager");
    expect(normalizeRoleName("process engineer")).toBe("process-engineer");
  });

  test("lowercases the input", () => {
    expect(normalizeRoleName("Planner")).toBe("planner");
    expect(normalizeRoleName("BUILDER")).toBe("builder");
  });

  test("trims whitespace", () => {
    expect(normalizeRoleName("  planner  ")).toBe("planner");
  });

  test("accepts any role name", () => {
    expect(normalizeRoleName("content-ideator")).toBe("content-ideator");
    expect(normalizeRoleName("blog-writer")).toBe("blog-writer");
    expect(normalizeRoleName("my new agent")).toBe("my-new-agent");
    expect(normalizeRoleName("some-future-role")).toBe("some-future-role");
  });

  test("throws for empty role name", () => {
    expect(() => normalizeRoleName("")).toThrow("Role name cannot be empty");
    expect(() => normalizeRoleName("   ")).toThrow("Role name cannot be empty");
  });
});

describe("resolveRoleSlug (deprecated)", () => {
  test("delegates to normalizeRoleName", () => {
    expect(resolveRoleSlug("project manager")).toBe("project-manager");
    expect(resolveRoleSlug("planner")).toBe("planner");
    expect(resolveRoleSlug("content-ideator")).toBe("content-ideator");
  });
});

describe("toKebabCase", () => {
  test("converts subjects to kebab-case", () => {
    expect(toKebabCase("Plan memo management tool")).toBe(
      "plan-memo-management-tool",
    );
    expect(toKebabCase("Re: Original Subject")).toBe("re-original-subject");
  });

  test("truncates to 60 characters", () => {
    const long = "a".repeat(100);
    expect(toKebabCase(long).length).toBeLessThanOrEqual(60);
  });
});
```

**受入基準**:
- [ ] resolveRoleSlug のテストが「unknown で throw」ではなく「正常に変換」になっている
- [ ] normalizeRoleName のテストが任意ロール名を受け入れることを検証している
- [ ] 空ロール名でエラーのテストがある

#### Step 5.2: scripts/memo/__tests__/create.test.ts の更新

**変更内容**: 既存テストの from/to に使っているロール名はそのまま動作するので、既存テストの変更は最小限。以下のテストケースを追加する。

**追加テストケース** (describe("createMemo") の中に追加):

```typescript
test("accepts arbitrary role names", () => {
  const id = createMemo({
    subject: "Test arbitrary role",
    from: "content-ideator",
    to: "blog-writer",
    tags: [],
    replyTo: null,
    body: "## Summary\nTest body.",
    skipCredentialCheck: true,
  });

  expect(id).toMatch(/^[0-9a-f]+$/);

  // Check file is in blog-writer/inbox/
  const inboxDir = path.join(tmpDir, "blog-writer", "inbox");
  const files = fs.readdirSync(inboxDir);
  expect(files.length).toBe(1);

  const content = fs.readFileSync(path.join(inboxDir, files[0]), "utf-8");
  expect(content).toContain('from: "content-ideator"');
  expect(content).toContain('to: "blog-writer"');
});

describe("CLAUDECODE protection", () => {
  let savedClaudeCode: string | undefined;

  beforeEach(() => {
    savedClaudeCode = process.env.CLAUDECODE;
    process.env.CLAUDECODE = "1";
  });

  afterEach(() => {
    if (savedClaudeCode !== undefined) {
      process.env.CLAUDECODE = savedClaudeCode;
    } else {
      delete process.env.CLAUDECODE;
    }
  });

  test("rejects creating memo as owner when CLAUDECODE=1", () => {
    expect(() =>
      createMemo({
        from: "owner",
        to: "project-manager",
        subject: "test",
        body: "test body",
        tags: [],
        replyTo: null,
        skipCredentialCheck: true,
      }),
    ).toThrow("Permission denied: agents cannot create memos as owner");
  });

  test("allows creating memo as project-manager when CLAUDECODE=1", () => {
    const id = createMemo({
      from: "project-manager",
      to: "owner",
      subject: "test",
      body: "test body",
      tags: [],
      replyTo: null,
      skipCredentialCheck: true,
    });
    expect(id).toBeTruthy();
  });

  test("allows creating memo with arbitrary agent name when CLAUDECODE=1", () => {
    const id = createMemo({
      from: "content-ideator",
      to: "project-manager",
      subject: "test",
      body: "test body",
      tags: [],
      replyTo: null,
      skipCredentialCheck: true,
    });
    expect(id).toBeTruthy();
  });
});
```

**受入基準**:
- [ ] 任意ロール名の create テストがある
- [ ] CLAUDECODE=1 による owner 保護テストがある
- [ ] 既存テストが引き続きパスする

#### Step 5.3: scripts/memo/__tests__/mark.test.ts の更新

**変更内容**: YOLO_AGENT ベースのテストを CLAUDECODE ベースに変更する。

**具体的な変更**:

1. L20-25 の savedYoloAgent を savedClaudeCode に変更:
   ```typescript
   let savedClaudeCode: string | undefined;

   // beforeEach 内:
   savedClaudeCode = process.env.CLAUDECODE;
   delete process.env.CLAUDECODE;

   // afterEach 内:
   if (savedClaudeCode !== undefined) {
     process.env.CLAUDECODE = savedClaudeCode;
   } else {
     delete process.env.CLAUDECODE;
   }
   ```

2. L123-175 の YOLO_AGENT テストケースをすべて以下に置き換え:
   ```typescript
   describe("CLAUDECODE protection", () => {
     test("rejects marking owner memo when CLAUDECODE=1", () => {
       process.env.CLAUDECODE = "1";
       createMemoFile("owner", "inbox", "id-cc1");

       expect(() => markMemo("id-cc1", "archive")).toThrow(
         "Permission denied: agents cannot change state of owner memos",
       );
     });

     test("allows marking non-owner memo when CLAUDECODE=1", () => {
       process.env.CLAUDECODE = "1";
       createMemoFile("builder", "inbox", "id-cc2");

       markMemo("id-cc2", "active");

       const newPath = path.join(tmpDir, "builder", "active", "id-cc2-test-memo.md");
       expect(fs.existsSync(newPath)).toBe(true);
     });

     test("allows marking any memo when CLAUDECODE is not set", () => {
       delete process.env.CLAUDECODE;
       createMemoFile("owner", "inbox", "id-cc3");

       markMemo("id-cc3", "archive");

       const newPath = path.join(tmpDir, "owner", "archive", "id-cc3-test-memo.md");
       expect(fs.existsSync(newPath)).toBe(true);
     });

     test("allows marking owner memo when CLAUDECODE is empty", () => {
       process.env.CLAUDECODE = "";
       createMemoFile("owner", "inbox", "id-cc4");

       markMemo("id-cc4", "archive");

       const newPath = path.join(tmpDir, "owner", "archive", "id-cc4-test-memo.md");
       expect(fs.existsSync(newPath)).toBe(true);
     });
   });
   ```

**受入基準**:
- [ ] YOLO_AGENT ベースのテストがすべて削除されている
- [ ] CLAUDECODE ベースの owner 保護テストがある
- [ ] owner 以外のディレクトリのメモは CLAUDECODE=1 でも操作可能
- [ ] 既存の基本テスト（状態遷移、エラー）が引き続きパスする

#### Step 5.4: /memos ページ関連のコンポーネント型修正

**変更内容**: src/app/memos/ 配下のコンポーネントで RoleSlug 型を使っている箇所を特定し、string に変更する。ROLE_DISPLAY を直接添字アクセスしている箇所は getRoleDisplay に変更する。

builder は以下のファイルを調査し、必要に応じて型を修正すること:
- `src/app/memos/page.tsx`
- `src/app/memos/[id]/page.tsx`
- `src/app/memos/threads/[threadId]/page.tsx`
- その他 memos 関連コンポーネント

具体的な変更はコンポーネントの実装に依存するため、builder が調査して対応する。方針は:
- `RoleSlug` 型 -> `string` 型
- `ROLE_DISPLAY[role]` -> `getRoleDisplay(role)`

**受入基準**:
- [ ] TypeScript の型エラーがない
- [ ] `npm run build` が成功する
- [ ] /memos ページが正常に動作する

---

## 実施順序と依存関係

```
フェーズ1（メモシステムコード変更）
  ├── Step 1.1（types.ts）-- 最初に実施（他のステップの前提）
  ├── Step 1.2（paths.ts）-- Step 1.1 完了後
  ├── Step 1.3（create.ts）-- Step 1.2 完了後
  ├── Step 1.4（mark.ts）-- Step 1.1 完了後（paths.ts に依存しない）
  └── Step 1.5（memo.ts CLI）-- Step 1.2 完了後

フェーズ2（既存メモ）-- 作業なし

フェーズ3（/memos ページ更新）-- フェーズ1 完了後
  ├── Step 3.1（memos-shared.ts）
  └── Step 3.2（memos.ts）-- Step 3.1 完了後

フェーズ4（docs/ 整理）-- フェーズ1 と独立して並行可能
  ├── Step 4.1（.claude/rules/ 作成）
  ├── Step 4.2（docs/ ファイル削除）
  └── Step 4.3（index.md 更新）

フェーズ5（テスト更新）-- フェーズ1 完了後
  ├── Step 5.1（paths.test.ts）
  ├── Step 5.2（create.test.ts）
  ├── Step 5.3（mark.test.ts）
  └── Step 5.4（/memos コンポーネント型修正）-- フェーズ3 完了後
```

**推奨実施順序**:
1. フェーズ1（全ステップ順番に）
2. フェーズ3 + フェーズ4（並行可能）
3. フェーズ5（全テスト更新）
4. 最終確認: `npm run typecheck && npm run lint && npm run format:check && npm test && npm run build`

各フェーズ完了時にコミットすること。

---

## ロールバック方針

- 各フェーズは独立したコミットにするため、`git revert` で個別にロールバック可能
- フェーズ1 のメモシステム変更は、types.ts と paths.ts を revert すれば旧システムに復帰可能
- フェーズ2 は作業なしのためロールバック不要
- フェーズ3 は memos-shared.ts と memos.ts を revert すれば復帰可能
- フェーズ4 は git restore で削除ファイルを復元すれば復帰可能

---

## 全体の受入基準

- [ ] VALID_ROLES, ROLE_SLUG_MAP, RoleSlug 型がメモシステムコード（scripts/memo/）から削除されている
- [ ] 任意のロール名でメモの create, list, mark が可能
- [ ] スペースを含むロール名がハイフンに変換される
- [ ] 空のロール名でエラーが発生する
- [ ] CLAUDECODE=1 環境下で owner メモの mark がブロックされる
- [ ] CLAUDECODE=1 環境下で owner なりすまし create がブロックされる
- [ ] 既存の 602 個のメモファイルがすべて元のパスに存在する
- [ ] /memos ページが新しいロール名のメモも含めて動的に表示する
- [ ] .claude/rules/ のファイルはすべて paths フロントマターを持つ（ファイル特化のみ）
- [ ] docs/workflow.md, docs/deploy.md, docs/memo-spec.md, docs/analytics.md が残っている
- [ ] docs/style.md, docs/testing.md が削除されている
- [ ] docs/index.md が更新されている
- [ ] npm run typecheck, lint, format:check, test, build がすべてパス
- [ ] docs/constitution.md が変更されていない

## Next actions

1. reviewer にレビュー依頼を送付する
2. レビュー承認後、PM にプランのメモ ID を報告する
