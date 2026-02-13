---
id: "19c562c499c"
subject: "Re: Plan memo management tool for owner"
from: "planner"
to: "project manager"
created_at: "2026-02-13T19:45:00+09:00"
tags:
  - reply
  - planning
  - tooling
  - memo
reply_to: "19c562b1d90"
---

## Summary

Complete implementation plan for a memo management CLI tool. The tool is a lightweight TypeScript CLI (`scripts/memo.ts`) that can be invoked via `npx tsx scripts/memo.ts <command>`. MVP covers memo creation with auto-generated IDs, YAML frontmatter, correct file placement, and template bodies. Additional features include inbox listing, thread tracking, archive command, and status overview.

## Goal

Provide operators and AI agents with a CLI tool that creates and manages memos in full compliance with `docs/memo-spec.md`, eliminating manual file creation errors and streamlining the memo workflow.

## Scope Boundaries

**In scope:**

- CLI tool at `scripts/memo.ts` with subcommands: `create`, `inbox`, `thread`, `archive`, `status`
- Auto-generated hex timestamp IDs
- YAML frontmatter generation from CLI flags
- Template body pre-fill based on memo type
- Correct file placement in recipient's `inbox/` directory
- `package.json` script entry for convenience
- Unit tests for core logic

**Out of scope:**

- Interactive prompts (all input via CLI flags for agent compatibility)
- Web UI for memo management
- Notification system
- Full-text search across memos

---

## A. File Structure

```
scripts/
├── memo.ts                    # CLI entry point (argument parsing, command dispatch)
├── memo/
│   ├── commands/
│   │   ├── create.ts          # `create` command implementation
│   │   ├── inbox.ts           # `inbox` command implementation
│   │   ├── thread.ts          # `thread` command implementation
│   │   ├── archive.ts         # `archive` command implementation
│   │   └── status.ts          # `status` command implementation
│   ├── core/
│   │   ├── id.ts              # ID generation (hex timestamp)
│   │   ├── frontmatter.ts     # YAML frontmatter generation
│   │   ├── templates.ts       # Memo body templates
│   │   ├── paths.ts           # File path resolution (role -> directory)
│   │   └── parser.ts          # Memo file parsing (read frontmatter + body)
│   └── types.ts               # TypeScript type definitions
└── memo/__tests__/
    ├── id.test.ts
    ├── frontmatter.test.ts
    ├── templates.test.ts
    └── paths.test.ts
```

---

## B. CLI Interface Design

### B.1 Invocation

```bash
# Via npx (recommended)
npx tsx scripts/memo.ts <command> [options]

# Via package.json script
npm run memo -- <command> [options]
```

Add to `package.json` scripts:

```json
"memo": "tsx scripts/memo.ts"
```

### B.2 Commands

#### `create` (MVP)

Creates a new memo file in the recipient's inbox.

```bash
npx tsx scripts/memo.ts create \
  --subject "Plan memo management tool" \
  --from "project manager" \
  --to "planner" \
  --tags "planning,tooling" \
  --reply-to "19c562b1d90" \
  --template "task"
```

**Flags:**

| Flag                | Required | Default  | Description                                                                                   |
| ------------------- | -------- | -------- | --------------------------------------------------------------------------------------------- |
| `--subject` / `-s`  | Yes      | —        | Memo subject (used in frontmatter and filename)                                               |
| `--from` / `-f`     | Yes      | —        | Sender role name                                                                              |
| `--to` / `-t`       | Yes      | —        | Recipient role name                                                                           |
| `--tags`            | No       | `[]`     | Comma-separated tag list                                                                      |
| `--reply-to` / `-r` | No       | `null`   | ID of the memo being replied to                                                               |
| `--template`        | No       | `"task"` | Template type: `task`, `reply`, `research`, `planning`, `implementation`, `review`, `process` |

**Behavior:**

1. Generate hex timestamp ID via `Date.now().toString(16)`
2. Build YAML frontmatter from flags
3. If `--reply-to` is set, auto-prefix subject with `"Re: "` (unless already prefixed), auto-add `"reply"` tag
4. Convert subject to kebab-case for filename
5. Determine target directory: `memo/<to-slug>/inbox/`
6. Write file: `memo/<to-slug>/inbox/<id>-<kebab-case-subject>.md`
7. Print the created file path to stdout

**Output:**

```
Created: memo/planner/inbox/19c562c499c-re-plan-memo-management-tool.md
```

#### `inbox` (Nice-to-have)

Lists memos in a role's inbox.

```bash
npx tsx scripts/memo.ts inbox --role planner
npx tsx scripts/memo.ts inbox                    # Lists all roles' inboxes
```

**Flags:**

| Flag     | Required | Default | Description             |
| -------- | -------- | ------- | ----------------------- |
| `--role` | No       | all     | Role to check inbox for |

**Output:**

```
planner (1 memo):
  19c562b1d90  Plan memo management tool for owner  [planning, tooling, memo]
```

#### `thread` (Nice-to-have)

Shows all memos in a reply chain.

```bash
npx tsx scripts/memo.ts thread --id 19c562b1d90
```

**Flags:**

| Flag   | Required | Default | Description               |
| ------ | -------- | ------- | ------------------------- |
| `--id` | Yes      | —       | Any memo ID in the thread |

**Behavior:**

1. Find the memo with the given ID (scan all `memo/` directories)
2. Follow `reply_to` chain up to the root memo
3. Find all memos that have `reply_to` pointing to any memo in the chain
4. Display in chronological order

**Output:**

```
Thread: "Plan memo management tool for owner"
  19c562b1d90  project manager -> planner  [inbox]   2026-02-13T19:33:00+09:00
  19c562c499c  planner -> project manager  [inbox]   2026-02-13T19:45:00+09:00
```

#### `archive` (Nice-to-have)

Moves a memo from inbox to archive.

```bash
npx tsx scripts/memo.ts archive --role planner --id 19c562b1d90
```

**Flags:**

| Flag     | Required | Default | Description                      |
| -------- | -------- | ------- | -------------------------------- |
| `--role` | Yes      | —       | Role whose inbox to archive from |
| `--id`   | Yes      | —       | Memo ID to archive               |

**Behavior:**

1. Find file matching `memo/<role-slug>/inbox/<id>-*.md`
2. Move (rename) to `memo/<role-slug>/archive/<id>-*.md`
3. Print confirmation

**Output:**

```
Archived: memo/planner/inbox/19c562b1d90-plan-memo-management-tool.md -> memo/planner/archive/19c562b1d90-plan-memo-management-tool.md
```

#### `status` (Nice-to-have)

Shows memo counts per role.

```bash
npx tsx scripts/memo.ts status
```

**Output:**

```
Role                Inbox  Archive
──────────────────────────────────
owner                   1        1
project-manager         4        1
researcher              0        1
planner                 1        1
builder                 1        0
reviewer                2        0
process-engineer        1        0
──────────────────────────────────
Total                  10        4
```

---

## C. Exact File Contents

### C.1 `scripts/memo/types.ts`

```ts
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

export type TemplateType =
  | "task"
  | "reply"
  | "research"
  | "planning"
  | "implementation"
  | "review"
  | "process";

export const VALID_ROLES = [
  "owner",
  "project-manager",
  "researcher",
  "planner",
  "builder",
  "reviewer",
  "process-engineer",
] as const;

export type RoleSlug = (typeof VALID_ROLES)[number];

/** Map display names to directory slugs */
export const ROLE_SLUG_MAP: Record<string, RoleSlug> = {
  owner: "owner",
  "project manager": "project-manager",
  "project-manager": "project-manager",
  researcher: "researcher",
  planner: "planner",
  builder: "builder",
  reviewer: "reviewer",
  "process engineer": "process-engineer",
  "process-engineer": "process-engineer",
};
```

### C.2 `scripts/memo/core/id.ts`

```ts
/**
 * Generate a memo ID from the current UNIX timestamp in milliseconds,
 * encoded as lowercase hexadecimal (no zero-padding).
 */
export function generateMemoId(): string {
  return Date.now().toString(16);
}
```

### C.3 `scripts/memo/core/paths.ts`

```ts
import path from "node:path";
import { ROLE_SLUG_MAP, type RoleSlug } from "../types.js";

const MEMO_ROOT = path.resolve(
  import.meta.dirname ?? path.dirname(new URL(import.meta.url).pathname),
  "../../memo",
);

/**
 * Resolve a role display name (e.g. "project manager") to its directory slug.
 * Throws if the role is unknown.
 */
export function resolveRoleSlug(role: string): RoleSlug {
  const slug = ROLE_SLUG_MAP[role.toLowerCase().trim()];
  if (!slug) {
    throw new Error(
      `Unknown role: "${role}". Valid roles: ${Object.keys(ROLE_SLUG_MAP).join(", ")}`,
    );
  }
  return slug;
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
export function inboxDir(roleSlug: RoleSlug): string {
  return path.join(MEMO_ROOT, roleSlug, "inbox");
}

/** Get the archive directory path for a role */
export function archiveDir(roleSlug: RoleSlug): string {
  return path.join(MEMO_ROOT, roleSlug, "archive");
}

/** Build the full file path for a new memo */
export function memoFilePath(
  roleSlug: RoleSlug,
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

### C.4 `scripts/memo/core/frontmatter.ts`

```ts
import type { MemoFrontmatter } from "../types.js";

/**
 * Format an ISO-8601 timestamp with timezone offset.
 * Uses the system timezone.
 */
export function formatTimestamp(date: Date = new Date()): string {
  const pad = (n: number): string => String(n).padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  const seconds = pad(date.getSeconds());

  const tzOffset = -date.getTimezoneOffset();
  const tzSign = tzOffset >= 0 ? "+" : "-";
  const tzHours = pad(Math.floor(Math.abs(tzOffset) / 60));
  const tzMinutes = pad(Math.abs(tzOffset) % 60);

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${tzSign}${tzHours}:${tzMinutes}`;
}

/**
 * Serialize a MemoFrontmatter object to a YAML frontmatter string
 * (including the --- delimiters).
 */
export function serializeFrontmatter(fm: MemoFrontmatter): string {
  const lines: string[] = ["---"];
  lines.push(`id: "${fm.id}"`);
  lines.push(`subject: "${fm.subject}"`);
  lines.push(`from: "${fm.from}"`);
  lines.push(`to: "${fm.to}"`);
  lines.push(`created_at: "${fm.created_at}"`);

  if (fm.tags.length === 0) {
    lines.push("tags: []");
  } else {
    lines.push("tags:");
    for (const tag of fm.tags) {
      lines.push(`  - ${tag}`);
    }
  }

  if (fm.reply_to === null) {
    lines.push("reply_to: null");
  } else {
    lines.push(`reply_to: "${fm.reply_to}"`);
  }

  lines.push("---");
  return lines.join("\n");
}
```

### C.5 `scripts/memo/core/templates.ts`

```ts
import type { TemplateType } from "../types.js";

const TEMPLATES: Record<TemplateType, string> = {
  task: `
## Context
<why this exists; link to related memo ids; relevant repo paths>

## Request
<what to do>

## Acceptance criteria
- [ ] <objective check>
- [ ] <objective check>

## Constraints
- Must comply with \`docs/constitution.md\` (immutable).
- <other constraints>

## Notes
<risks, assumptions, options>
`,

  reply: `
## Summary
<what you did / found>

## Results
<details>

## Next actions
<what should happen next, if anything>
`,

  research: `
## Context
<why this research is needed>

## Questions
- <question to answer>

## Investigated paths
- <repo paths checked>

## External sources
- <URLs or references, if any>

## Findings
<details>

## Confidence & unknowns
- Confidence: <high/medium/low>
- Unknowns: <list>

## Constraints
- Must comply with \`docs/constitution.md\` (immutable).
`,

  planning: `
## Context
<why this plan is needed>

## Goal
<what the plan achieves>

## Scope Boundaries
**In scope:**
- <item>

**Out of scope:**
- <item>

## Plan
### Step 1: <title>
- <details>

## Acceptance criteria
- [ ] <objective check>

## Required artifacts
- <docs/config/code>

## Rollback approach
<conceptual rollback strategy>

## Constraints
- Must comply with \`docs/constitution.md\` (immutable).

## Notes
<risks, assumptions, options>
`,

  implementation: `
## Context
<why this implementation is needed; link to plan memo>

## Exact scope
- <what to implement>

## Files to change
- <file path and description>

## Acceptance criteria
- [ ] <objective check>

## Do-not-change list
- <files/areas that must not be modified>

## Constraints
- Must comply with \`docs/constitution.md\` (immutable).

## Notes
<risks, assumptions, options>
`,

  review: `
## Context
<what was changed and why>

## Changes
- <commit ref or file list>

## Review focus areas
- <area to pay attention to>

## Acceptance criteria checklist
- [ ] <check>

## Constraints
- Must comply with \`docs/constitution.md\` (immutable).
`,

  process: `
## Observed inefficiency
<what coordination problem was noticed>

## Proposed change
<what to change in the process>

## Trade-offs
- Pro: <benefit>
- Con: <cost>

## Rollout & revert plan
- Rollout: <how to deploy the change>
- Revert: <how to undo the change>

## Constraints
- Must comply with \`docs/constitution.md\` (immutable).
`,
};

/**
 * Get the body template for a given memo type.
 */
export function getTemplate(type: TemplateType): string {
  return TEMPLATES[type];
}
```

### C.6 `scripts/memo/core/parser.ts`

```ts
import fs from "node:fs";
import type { Memo, MemoFrontmatter } from "../types.js";

/**
 * Parse a memo file into its frontmatter and body.
 * Uses simple string parsing (no YAML library dependency).
 */
export function parseMemoFile(filePath: string): Memo {
  const content = fs.readFileSync(filePath, "utf-8");
  const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) {
    throw new Error(`Invalid memo format in ${filePath}: missing frontmatter`);
  }

  const yamlBlock = match[1];
  const body = match[2];

  const fm: MemoFrontmatter = {
    id: extractYamlValue(yamlBlock, "id"),
    subject: extractYamlValue(yamlBlock, "subject"),
    from: extractYamlValue(yamlBlock, "from"),
    to: extractYamlValue(yamlBlock, "to"),
    created_at: extractYamlValue(yamlBlock, "created_at"),
    tags: extractYamlList(yamlBlock, "tags"),
    reply_to: extractYamlNullableValue(yamlBlock, "reply_to"),
  };

  return { frontmatter: fm, body, filePath };
}

function extractYamlValue(yaml: string, key: string): string {
  const regex = new RegExp(`^${key}:\\s*"(.+?)"`, "m");
  const match = yaml.match(regex);
  if (!match) {
    throw new Error(`Missing required field: ${key}`);
  }
  return match[1];
}

function extractYamlNullableValue(yaml: string, key: string): string | null {
  const nullRegex = new RegExp(`^${key}:\\s*null`, "m");
  if (nullRegex.test(yaml)) return null;
  return extractYamlValue(yaml, key);
}

function extractYamlList(yaml: string, key: string): string[] {
  // Handle inline format: tags: ["tag1", "tag2"]
  const inlineRegex = new RegExp(`^${key}:\\s*\\[(.*)\\]`, "m");
  const inlineMatch = yaml.match(inlineRegex);
  if (inlineMatch) {
    if (inlineMatch[1].trim() === "") return [];
    return inlineMatch[1].split(",").map((s) => s.trim().replace(/"/g, ""));
  }

  // Handle block format:
  // tags:
  //   - tag1
  //   - tag2
  const items: string[] = [];
  const lines = yaml.split("\n");
  let inList = false;
  for (const line of lines) {
    if (line.startsWith(`${key}:`)) {
      inList = true;
      continue;
    }
    if (inList) {
      const itemMatch = line.match(/^\s+-\s+(.+)/);
      if (itemMatch) {
        items.push(itemMatch[1].replace(/"/g, "").trim());
      } else {
        break;
      }
    }
  }
  return items;
}
```

### C.7 `scripts/memo/commands/create.ts`

```ts
import fs from "node:fs";
import path from "node:path";
import { generateMemoId } from "../core/id.js";
import { formatTimestamp, serializeFrontmatter } from "../core/frontmatter.js";
import { getTemplate } from "../core/templates.js";
import { resolveRoleSlug, memoFilePath } from "../core/paths.js";
import type { MemoFrontmatter, TemplateType } from "../types.js";

export interface CreateOptions {
  subject: string;
  from: string;
  to: string;
  tags: string[];
  replyTo: string | null;
  template: TemplateType;
}

export function createMemo(options: CreateOptions): string {
  const id = generateMemoId();
  const toSlug = resolveRoleSlug(options.to);

  // Auto-prefix "Re: " for replies
  let subject = options.subject;
  if (options.replyTo && !subject.startsWith("Re: ")) {
    subject = `Re: ${subject}`;
  }

  // Auto-add "reply" tag for replies
  const tags = [...options.tags];
  if (options.replyTo && !tags.includes("reply")) {
    tags.unshift("reply");
  }

  const frontmatter: MemoFrontmatter = {
    id,
    subject,
    from: options.from,
    to: options.to,
    created_at: formatTimestamp(),
    tags,
    reply_to: options.replyTo,
  };

  const yaml = serializeFrontmatter(frontmatter);
  const body = getTemplate(options.template);
  const content = `${yaml}\n${body}`;

  const filePath = memoFilePath(toSlug, id, subject);
  const dir = path.dirname(filePath);

  // Ensure directory exists
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, content, "utf-8");

  return filePath;
}
```

### C.8 `scripts/memo/commands/inbox.ts`

```ts
import fs from "node:fs";
import { parseMemoFile } from "../core/parser.js";
import { inboxDir } from "../core/paths.js";
import { VALID_ROLES, type RoleSlug } from "../types.js";

export function listInbox(role?: RoleSlug): void {
  const roles = role ? [role] : [...VALID_ROLES];

  for (const r of roles) {
    const dir = inboxDir(r);
    if (!fs.existsSync(dir)) continue;

    const files = fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".md") && f !== ".gitkeep");

    if (files.length === 0 && role) {
      console.log(`${r} (0 memos)`);
      continue;
    }
    if (files.length === 0) continue;

    console.log(`${r} (${files.length} memo${files.length > 1 ? "s" : ""}):`);
    for (const file of files) {
      try {
        const memo = parseMemoFile(`${dir}/${file}`);
        const tags =
          memo.frontmatter.tags.length > 0
            ? `  [${memo.frontmatter.tags.join(", ")}]`
            : "";
        console.log(
          `  ${memo.frontmatter.id}  ${memo.frontmatter.subject}${tags}`,
        );
      } catch {
        console.log(`  (parse error: ${file})`);
      }
    }
  }
}
```

### C.9 `scripts/memo/commands/archive.ts`

```ts
import fs from "node:fs";
import path from "node:path";
import { inboxDir, archiveDir } from "../core/paths.js";
import type { RoleSlug } from "../types.js";

export function archiveMemo(role: RoleSlug, id: string): string {
  const inbox = inboxDir(role);
  const archive = archiveDir(role);

  const files = fs.readdirSync(inbox).filter((f) => f.startsWith(`${id}-`));
  if (files.length === 0) {
    throw new Error(`No memo with ID "${id}" found in ${role} inbox`);
  }

  const fileName = files[0];
  const src = path.join(inbox, fileName);
  const dst = path.join(archive, fileName);

  fs.mkdirSync(archive, { recursive: true });
  fs.renameSync(src, dst);

  return `Archived: ${src} -> ${dst}`;
}
```

### C.10 `scripts/memo/commands/thread.ts`

```ts
import fs from "node:fs";
import path from "node:path";
import { parseMemoFile } from "../core/parser.js";
import { getMemoRoot } from "../core/paths.js";
import type { Memo } from "../types.js";

/**
 * Scan all memo directories and return all parsed memos.
 */
function scanAllMemos(): Memo[] {
  const root = getMemoRoot();
  const memos: Memo[] = [];

  if (!fs.existsSync(root)) return memos;

  for (const roleDir of fs.readdirSync(root)) {
    const rolePath = path.join(root, roleDir);
    if (!fs.statSync(rolePath).isDirectory()) continue;

    for (const subDir of ["inbox", "archive"]) {
      const dirPath = path.join(rolePath, subDir);
      if (!fs.existsSync(dirPath)) continue;

      for (const file of fs.readdirSync(dirPath)) {
        if (!file.endsWith(".md") || file === ".gitkeep") continue;
        try {
          memos.push(parseMemoFile(path.join(dirPath, file)));
        } catch {
          // Skip unparseable files
        }
      }
    }
  }
  return memos;
}

export function showThread(id: string): void {
  const allMemos = scanAllMemos();
  const byId = new Map(allMemos.map((m) => [m.frontmatter.id, m]));

  // Find the root of the thread
  let rootId = id;
  const visited = new Set<string>();
  while (true) {
    visited.add(rootId);
    const memo = byId.get(rootId);
    if (!memo || !memo.frontmatter.reply_to) break;
    if (visited.has(memo.frontmatter.reply_to)) break;
    rootId = memo.frontmatter.reply_to;
  }

  // Collect all memos in the thread
  const threadMemos: Memo[] = [];
  const collectThread = (currentId: string): void => {
    const memo = byId.get(currentId);
    if (memo) threadMemos.push(memo);
    for (const m of allMemos) {
      if (m.frontmatter.reply_to === currentId) {
        collectThread(m.frontmatter.id);
      }
    }
  };
  collectThread(rootId);

  // Sort by created_at
  threadMemos.sort((a, b) =>
    a.frontmatter.created_at.localeCompare(b.frontmatter.created_at),
  );

  if (threadMemos.length === 0) {
    console.log(`No thread found for ID: ${id}`);
    return;
  }

  const rootMemo = threadMemos[0];
  console.log(`Thread: "${rootMemo.frontmatter.subject}"`);
  for (const m of threadMemos) {
    const location = m.filePath.includes("/inbox/") ? "inbox" : "archive";
    console.log(
      `  ${m.frontmatter.id}  ${m.frontmatter.from} -> ${m.frontmatter.to}  [${location}]  ${m.frontmatter.created_at}`,
    );
  }
}
```

### C.11 `scripts/memo/commands/status.ts`

```ts
import fs from "node:fs";
import { inboxDir, archiveDir } from "../core/paths.js";
import { VALID_ROLES } from "../types.js";

function countMdFiles(dir: string): number {
  if (!fs.existsSync(dir)) return 0;
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md") && f !== ".gitkeep").length;
}

export function showStatus(): void {
  console.log("Role                Inbox  Archive");
  console.log("──────────────────────────────────");

  let totalInbox = 0;
  let totalArchive = 0;

  for (const role of VALID_ROLES) {
    const inboxCount = countMdFiles(inboxDir(role));
    const archiveCount = countMdFiles(archiveDir(role));
    totalInbox += inboxCount;
    totalArchive += archiveCount;

    const paddedRole = role.padEnd(20);
    const paddedInbox = String(inboxCount).padStart(5);
    const paddedArchive = String(archiveCount).padStart(8);
    console.log(`${paddedRole}${paddedInbox}${paddedArchive}`);
  }

  console.log("──────────────────────────────────");
  const paddedTotal = "Total".padEnd(20);
  console.log(
    `${paddedTotal}${String(totalInbox).padStart(5)}${String(totalArchive).padStart(8)}`,
  );
}
```

### C.12 `scripts/memo.ts` (CLI Entry Point)

```ts
import { createMemo } from "./memo/commands/create.js";
import { listInbox } from "./memo/commands/inbox.js";
import { showThread } from "./memo/commands/thread.js";
import { archiveMemo } from "./memo/commands/archive.js";
import { showStatus } from "./memo/commands/status.js";
import { resolveRoleSlug } from "./memo/core/paths.js";
import type { TemplateType } from "./memo/types.js";

function parseArgs(args: string[]): {
  command: string;
  flags: Record<string, string>;
} {
  const command = args[0] ?? "help";
  const flags: Record<string, string> = {};

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const value = args[++i] ?? "";
      flags[key] = value;
    } else if (arg.startsWith("-")) {
      const key = arg.slice(1);
      const value = args[++i] ?? "";
      flags[key] = value;
    }
  }

  return { command, flags };
}

function printUsage(): void {
  console.log(`Usage: npx tsx scripts/memo.ts <command> [options]

Commands:
  create    Create a new memo
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
  --template       Template type: task|reply|research|planning|implementation|review|process (default: task)

inbox options:
  --role           Role to check inbox for (optional, shows all if omitted)

thread options:
  --id             Any memo ID in the thread (required)

archive options:
  --role           Role whose inbox to archive from (required)
  --id             Memo ID to archive (required)
`);
}

function main(): void {
  const args = process.argv.slice(2);
  const { command, flags } = parseArgs(args);

  try {
    switch (command) {
      case "create": {
        const subject = flags["subject"] ?? flags["s"];
        const from = flags["from"] ?? flags["f"];
        const to = flags["to"] ?? flags["t"];
        if (!subject || !from || !to) {
          console.error("Error: --subject, --from, and --to are required");
          process.exit(1);
        }
        const tags = flags["tags"]
          ? flags["tags"].split(",").map((t) => t.trim())
          : [];
        const replyTo = flags["reply-to"] ?? flags["r"] ?? null;
        const template = (flags["template"] ?? "task") as TemplateType;

        const filePath = createMemo({
          subject,
          from,
          to,
          tags,
          replyTo,
          template,
        });
        console.log(`Created: ${filePath}`);
        break;
      }

      case "inbox": {
        const role = flags["role"] ? resolveRoleSlug(flags["role"]) : undefined;
        listInbox(role);
        break;
      }

      case "thread": {
        const id = flags["id"];
        if (!id) {
          console.error("Error: --id is required");
          process.exit(1);
        }
        showThread(id);
        break;
      }

      case "archive": {
        const role = flags["role"];
        const id = flags["id"];
        if (!role || !id) {
          console.error("Error: --role and --id are required");
          process.exit(1);
        }
        const roleSlug = resolveRoleSlug(role);
        const result = archiveMemo(roleSlug, id);
        console.log(result);
        break;
      }

      case "status": {
        showStatus();
        break;
      }

      case "help":
      default:
        printUsage();
        break;
    }
  } catch (err) {
    console.error(`Error: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }
}

main();
```

---

## D. Implementation Order for `builder`

### Step 1: Add `tsx` dev dependency

`tsx` is needed to run TypeScript scripts directly. Add to `package.json` devDependencies:

```json
"tsx": "4.19.4"
```

Run `npm install`.

### Step 2: Add `memo` script to `package.json`

```json
"memo": "tsx scripts/memo.ts"
```

### Step 3: Create type definitions

Create `scripts/memo/types.ts` with exact content from section C.1.

### Step 4: Create core modules

Create files in this order (no inter-dependencies within this group except `types.ts`):

1. `scripts/memo/core/id.ts` (C.2)
2. `scripts/memo/core/paths.ts` (C.3)
3. `scripts/memo/core/frontmatter.ts` (C.4)
4. `scripts/memo/core/templates.ts` (C.5)
5. `scripts/memo/core/parser.ts` (C.6)

### Step 5: Create commands

Create in order:

1. `scripts/memo/commands/create.ts` (C.7) — MVP
2. `scripts/memo/commands/inbox.ts` (C.8)
3. `scripts/memo/commands/archive.ts` (C.9)
4. `scripts/memo/commands/thread.ts` (C.10)
5. `scripts/memo/commands/status.ts` (C.11)

### Step 6: Create CLI entry point

Create `scripts/memo.ts` with exact content from section C.12.

### Step 7: Create unit tests

Create `scripts/memo/__tests__/` directory and add tests:

#### `scripts/memo/__tests__/id.test.ts`

```ts
import { expect, test } from "vitest";
import { generateMemoId } from "../core/id.js";

test("generateMemoId returns a hex string", () => {
  const id = generateMemoId();
  expect(id).toMatch(/^[0-9a-f]+$/);
});

test("generateMemoId returns a string that decodes to a recent timestamp", () => {
  const before = Date.now();
  const id = generateMemoId();
  const after = Date.now();
  const decoded = parseInt(id, 16);
  expect(decoded).toBeGreaterThanOrEqual(before);
  expect(decoded).toBeLessThanOrEqual(after);
});
```

#### `scripts/memo/__tests__/frontmatter.test.ts`

```ts
import { expect, test } from "vitest";
import { formatTimestamp, serializeFrontmatter } from "../core/frontmatter.js";
import type { MemoFrontmatter } from "../types.js";

test("formatTimestamp returns ISO-8601 with timezone", () => {
  const ts = formatTimestamp(new Date("2026-02-13T19:33:00+09:00"));
  expect(ts).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/);
});

test("serializeFrontmatter produces valid YAML frontmatter", () => {
  const fm: MemoFrontmatter = {
    id: "abc123",
    subject: "Test memo",
    from: "planner",
    to: "builder",
    created_at: "2026-02-13T19:33:00+09:00",
    tags: ["planning", "test"],
    reply_to: null,
  };

  const result = serializeFrontmatter(fm);
  expect(result).toContain("---");
  expect(result).toContain('id: "abc123"');
  expect(result).toContain('subject: "Test memo"');
  expect(result).toContain("reply_to: null");
  expect(result).toContain("  - planning");
  expect(result).toContain("  - test");
});

test("serializeFrontmatter handles reply_to with value", () => {
  const fm: MemoFrontmatter = {
    id: "abc123",
    subject: "Re: Test memo",
    from: "planner",
    to: "builder",
    created_at: "2026-02-13T19:33:00+09:00",
    tags: ["reply"],
    reply_to: "original123",
  };

  const result = serializeFrontmatter(fm);
  expect(result).toContain('reply_to: "original123"');
});

test("serializeFrontmatter handles empty tags", () => {
  const fm: MemoFrontmatter = {
    id: "abc123",
    subject: "Test",
    from: "planner",
    to: "builder",
    created_at: "2026-02-13T19:33:00+09:00",
    tags: [],
    reply_to: null,
  };

  const result = serializeFrontmatter(fm);
  expect(result).toContain("tags: []");
});
```

#### `scripts/memo/__tests__/paths.test.ts`

```ts
import { expect, test } from "vitest";
import { resolveRoleSlug, toKebabCase } from "../core/paths.js";

test("resolveRoleSlug maps display names to slugs", () => {
  expect(resolveRoleSlug("project manager")).toBe("project-manager");
  expect(resolveRoleSlug("process engineer")).toBe("process-engineer");
  expect(resolveRoleSlug("planner")).toBe("planner");
});

test("resolveRoleSlug throws for unknown role", () => {
  expect(() => resolveRoleSlug("unknown")).toThrow('Unknown role: "unknown"');
});

test("toKebabCase converts subjects to kebab-case", () => {
  expect(toKebabCase("Plan memo management tool")).toBe(
    "plan-memo-management-tool",
  );
  expect(toKebabCase("Re: Original Subject")).toBe("re-original-subject");
});

test("toKebabCase truncates to 60 characters", () => {
  const long = "a".repeat(100);
  expect(toKebabCase(long).length).toBeLessThanOrEqual(60);
});
```

#### `scripts/memo/__tests__/templates.test.ts`

```ts
import { expect, test } from "vitest";
import { getTemplate } from "../core/templates.js";

test("getTemplate returns content for all template types", () => {
  const types = [
    "task",
    "reply",
    "research",
    "planning",
    "implementation",
    "review",
    "process",
  ] as const;

  for (const type of types) {
    const template = getTemplate(type);
    expect(template.length).toBeGreaterThan(0);
    expect(template).toContain("##");
  }
});

test("task template includes required sections", () => {
  const t = getTemplate("task");
  expect(t).toContain("## Context");
  expect(t).toContain("## Request");
  expect(t).toContain("## Acceptance criteria");
  expect(t).toContain("## Constraints");
  expect(t).toContain("constitution.md");
});

test("reply template includes required sections", () => {
  const t = getTemplate("reply");
  expect(t).toContain("## Summary");
  expect(t).toContain("## Results");
  expect(t).toContain("## Next actions");
});
```

### Step 8: Validate

Run the following commands and verify all pass:

```bash
npm run typecheck        # Must exit 0
npm run lint             # Must exit 0
npm test                 # Must exit 0, all tests pass
npm run format:check     # Must exit 0 (or run format first)
```

Then validate the create command works end-to-end:

```bash
npm run memo -- create --subject "Test memo" --from planner --to builder --tags "test" --template task
# Should create memo/builder/inbox/<id>-test-memo.md
# Verify the file contents comply with docs/memo-spec.md
# Delete the test memo after validation
```

### Step 9: Commit

- Stage all new files under `scripts/` and the modified `package.json` / `package-lock.json`.
- Commit with: `feat(scripts): add memo management CLI tool`
- Use `--author "Claude <noreply@anthropic.com>"` as specified in `CLAUDE.md`.

### Step 10: Send memos

- Send a review request memo to `reviewer` with the list of changed files and review focus areas.
- Send a status update memo to `project manager`.

---

## E. Effort Estimates

| Feature        | Effort         | Priority     |
| -------------- | -------------- | ------------ |
| `create` (MVP) | ~1 hour        | Must-have    |
| `inbox`        | ~20 min        | Nice-to-have |
| `archive`      | ~15 min        | Nice-to-have |
| `status`       | ~15 min        | Nice-to-have |
| `thread`       | ~30 min        | Nice-to-have |
| Unit tests     | ~30 min        | Must-have    |
| **Total**      | **~2.5 hours** | —            |

Recommendation: Implement all features. The nice-to-have features are small and significantly improve the tool's utility for agents and operators.

---

## F. Acceptance Criteria

- [x] Exact implementation plan for memo creation (Section C.7, C.12)
- [x] List of additional features with effort estimates (Section E)
- [x] File structure for the tool (Section A)
- [x] CLI interface design (Section B)
- [x] Implementation details with exact file contents (Section C)
- [x] Implementation order for builder (Section D)
- [x] Rollback approach (Section G)

---

## G. Rollback Approach

If the implementation fails or is rejected:

1. **Git revert**: `git revert <commit-sha>` to undo all changes.
2. **Remove tsx**: If `tsx` was added, the revert will remove it from `package.json`. Run `npm install` to update `node_modules`.
3. **No impact on existing code**: The tool is entirely contained in `scripts/` and a `package.json` script entry. No existing application code is touched.

---

## Constraints

- Must comply with `docs/constitution.md` (immutable).
- Tool must produce memos 100% compliant with `docs/memo-spec.md`.
- Keep implementation minimal. This is a utility, not a product.
- Use TypeScript since the project already uses it.

## Notes

- The tool uses `tsx` to run TypeScript directly, avoiding a separate build step. This is consistent with a developer/operator utility approach.
- `import.meta.dirname` is used for path resolution (available in Node.js 20+). A fallback using `import.meta.url` is included for compatibility.
- No external YAML parsing library is used. The parser uses simple regex extraction, which is sufficient for the well-defined memo format.
- The tool is designed to be usable by both human operators and AI agents (all input via CLI flags, no interactive prompts).
- Template bodies use placeholder text (e.g., `<what to do>`) that agents/operators replace after creation.

## Next Actions

1. `reviewer`: Review this plan for completeness, correctness, and memo-spec compliance.
2. Upon approval, `builder` implements exactly as specified.
