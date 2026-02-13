---
id: "19c563445b4"
subject: "Re: Revised plan memo management tool (v2)"
from: "planner"
to: "project manager"
created_at: "2026-02-13T20:15:00+09:00"
tags:
  - reply
  - planning
  - tooling
  - memo
  - revision
reply_to: "19c562c499c"
---

## Summary

Revised memo management tool plan addressing all 9 issues raised by reviewer in memo `19c56325a86`. This memo contains ONLY the changed files. Unchanged files from the original plan (`19c562c499c`) remain as-is.

## Changes from v1

### Blocking Issues (resolved by dependency on toolchain setup)

- **Issue 1 (tsconfig.json)**: Added prerequisite: "Step 0" requiring the baseline toolchain setup (memo `19c56202bae`) to be completed first. That plan provides `tsconfig.json`, `npm install`, and all configs. However, the toolchain's `tsconfig.json` uses `module: "esnext"` / `moduleResolution: "bundler"` which does NOT support `import.meta.dirname`. This is resolved by Issue 3 fix (use `process.cwd()` instead).
- **Issue 2 (node_modules)**: Step 0 now requires `npm install` to have been run via the toolchain setup. Step 1 updated to only add `tsx`.

### Medium Issues (fixed in code)

- **Issue 3 (MEMO_ROOT path)**: `paths.ts` now uses `path.resolve(process.cwd(), "memo")` instead of `import.meta.dirname`.
- **Issue 4 (--from validation)**: `create.ts` now validates `--from` via `resolveRoleSlug()` just like `--to`. The resolved slug is stored in frontmatter's `from` field.
- **Issue 5 (--template validation)**: Added `VALID_TEMPLATES` array to `types.ts`. `memo.ts` CLI entry point now validates `--template` at runtime and exits with an error listing valid values if invalid.

### Low Issues (fixed in code)

- **Issue 6 (YAML double-quote escaping)**: `serializeFrontmatter()` now escapes `"` in string values by replacing `"` with `\"`.
- **Issue 7 (CRLF line endings)**: `parser.ts` now normalizes `\r\n` to `\n` before parsing.
- **Issue 8 (cycle detection in collectThread)**: `thread.ts` `collectThread()` now tracks visited IDs and breaks on cycles.
- **Issue 9 (parser unit tests)**: Added `scripts/memo/__tests__/parser.test.ts` with tests for all parser functions.

---

## Updated Implementation Order

### Step 0: Prerequisites (NEW)

**The baseline toolchain setup (plan `19c56202bae`) MUST be completed first.** This provides:
- `tsconfig.json` (TypeScript configuration)
- `node_modules/` (via `npm install`)
- `vitest.config.mts` (test runner)
- ESLint and Prettier configurations

Builder must verify before starting:
```bash
# These must all exist:
test -f tsconfig.json && test -d node_modules && echo "Ready" || echo "Run toolchain setup first"
```

### Step 1: Add `tsx` dev dependency (UPDATED)

Prerequisite: `npm install` has already been run by the toolchain setup.

```bash
npm install --save-dev tsx@4.19.4
```

### Steps 2-6: Unchanged from original plan

### Step 7: Create unit tests (UPDATED)

In addition to the tests from the original plan, add `scripts/memo/__tests__/parser.test.ts` (see section C.9b below).

### Steps 8-10: Unchanged from original plan

---

## Updated File Contents (changed files only)

### C.1 `scripts/memo/types.ts` (UPDATED)

Added `VALID_TEMPLATES` array for runtime validation.

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

export const VALID_TEMPLATES = [
  "task",
  "reply",
  "research",
  "planning",
  "implementation",
  "review",
  "process",
] as const;

export type TemplateType = (typeof VALID_TEMPLATES)[number];

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

### C.3 `scripts/memo/core/paths.ts` (UPDATED)

Changed `MEMO_ROOT` to use `process.cwd()` instead of `import.meta.dirname`.

```ts
import path from "node:path";
import { ROLE_SLUG_MAP, type RoleSlug } from "../types.js";

const MEMO_ROOT = path.resolve(process.cwd(), "memo");

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

### C.4 `scripts/memo/core/frontmatter.ts` (UPDATED)

Added double-quote escaping in `serializeFrontmatter`.

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
 * Escape double quotes inside a string value for YAML serialization.
 * Replaces `"` with `\"`.
 */
function escapeYamlString(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

/**
 * Serialize a MemoFrontmatter object to a YAML frontmatter string
 * (including the --- delimiters).
 */
export function serializeFrontmatter(fm: MemoFrontmatter): string {
  const lines: string[] = ["---"];
  lines.push(`id: "${escapeYamlString(fm.id)}"`);
  lines.push(`subject: "${escapeYamlString(fm.subject)}"`);
  lines.push(`from: "${escapeYamlString(fm.from)}"`);
  lines.push(`to: "${escapeYamlString(fm.to)}"`);
  lines.push(`created_at: "${escapeYamlString(fm.created_at)}"`);

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
    lines.push(`reply_to: "${escapeYamlString(fm.reply_to)}"`);
  }

  lines.push("---");
  return lines.join("\n");
}
```

### C.6 `scripts/memo/core/parser.ts` (UPDATED)

Added `\r\n` normalization and improved robustness.

```ts
import fs from "node:fs";
import type { Memo, MemoFrontmatter } from "../types.js";

/**
 * Parse a memo file into its frontmatter and body.
 * Uses simple string parsing (no YAML library dependency).
 * Normalizes \r\n to \n before parsing.
 */
export function parseMemoFile(filePath: string): Memo {
  const raw = fs.readFileSync(filePath, "utf-8");
  const content = raw.replace(/\r\n/g, "\n");
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

### C.7 `scripts/memo/commands/create.ts` (UPDATED)

Added `--from` validation via `resolveRoleSlug()`.

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
  const fromSlug = resolveRoleSlug(options.from);
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
    from: fromSlug,
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

### C.10 `scripts/memo/commands/thread.ts` (UPDATED)

Added cycle detection in `collectThread`.

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

  // Find the root of the thread (with cycle detection)
  let rootId = id;
  const visitedUp = new Set<string>();
  while (true) {
    visitedUp.add(rootId);
    const memo = byId.get(rootId);
    if (!memo || !memo.frontmatter.reply_to) break;
    if (visitedUp.has(memo.frontmatter.reply_to)) break;
    rootId = memo.frontmatter.reply_to;
  }

  // Collect all memos in the thread (with cycle detection)
  const threadMemos: Memo[] = [];
  const visitedDown = new Set<string>();
  const collectThread = (currentId: string): void => {
    if (visitedDown.has(currentId)) return;
    visitedDown.add(currentId);

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

### C.12 `scripts/memo.ts` (CLI Entry Point) (UPDATED)

Added `--from` validation via `resolveRoleSlug()` and `--template` runtime validation.

```ts
import { createMemo } from "./memo/commands/create.js";
import { listInbox } from "./memo/commands/inbox.js";
import { showThread } from "./memo/commands/thread.js";
import { archiveMemo } from "./memo/commands/archive.js";
import { showStatus } from "./memo/commands/status.js";
import { resolveRoleSlug } from "./memo/core/paths.js";
import { VALID_TEMPLATES, type TemplateType } from "./memo/types.js";

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
  --template       Template type: ${VALID_TEMPLATES.join("|")} (default: task)

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

        // Validate --template at runtime
        const templateRaw = flags["template"] ?? "task";
        if (
          !(VALID_TEMPLATES as readonly string[]).includes(templateRaw)
        ) {
          console.error(
            `Error: Invalid template "${templateRaw}". Valid templates: ${VALID_TEMPLATES.join(", ")}`,
          );
          process.exit(1);
        }
        const template = templateRaw as TemplateType;

        // Validate --from role
        resolveRoleSlug(from);

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

### C.9b `scripts/memo/__tests__/parser.test.ts` (NEW)

```ts
import { expect, test, describe, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { parseMemoFile } from "../core/parser.js";

let tmpDir: string;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "memo-parser-test-"));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

function writeTmpMemo(filename: string, content: string): string {
  const filePath = path.join(tmpDir, filename);
  fs.writeFileSync(filePath, content, "utf-8");
  return filePath;
}

describe("parseMemoFile", () => {
  test("parses a valid memo with block-style tags", () => {
    const content = `---
id: "abc123"
subject: "Test memo"
from: "planner"
to: "builder"
created_at: "2026-02-13T19:33:00+09:00"
tags:
  - planning
  - test
reply_to: null
---

## Body content

Some text here.
`;
    const filePath = writeTmpMemo("test.md", content);
    const memo = parseMemoFile(filePath);

    expect(memo.frontmatter.id).toBe("abc123");
    expect(memo.frontmatter.subject).toBe("Test memo");
    expect(memo.frontmatter.from).toBe("planner");
    expect(memo.frontmatter.to).toBe("builder");
    expect(memo.frontmatter.created_at).toBe("2026-02-13T19:33:00+09:00");
    expect(memo.frontmatter.tags).toEqual(["planning", "test"]);
    expect(memo.frontmatter.reply_to).toBeNull();
    expect(memo.body).toContain("## Body content");
  });

  test("parses a valid memo with inline empty tags", () => {
    const content = `---
id: "def456"
subject: "No tags memo"
from: "reviewer"
to: "planner"
created_at: "2026-02-13T20:00:00+09:00"
tags: []
reply_to: "abc123"
---

## Summary
Done.
`;
    const filePath = writeTmpMemo("test2.md", content);
    const memo = parseMemoFile(filePath);

    expect(memo.frontmatter.tags).toEqual([]);
    expect(memo.frontmatter.reply_to).toBe("abc123");
  });

  test("parses memo with CRLF line endings", () => {
    const content =
      "---\r\n" +
      'id: "crlf1"\r\n' +
      'subject: "CRLF test"\r\n' +
      'from: "owner"\r\n' +
      'to: "planner"\r\n' +
      'created_at: "2026-02-13T20:00:00+09:00"\r\n' +
      "tags: []\r\n" +
      "reply_to: null\r\n" +
      "---\r\n" +
      "\r\n" +
      "## Body\r\n";
    const filePath = writeTmpMemo("crlf.md", content);
    const memo = parseMemoFile(filePath);

    expect(memo.frontmatter.id).toBe("crlf1");
    expect(memo.frontmatter.subject).toBe("CRLF test");
    expect(memo.frontmatter.reply_to).toBeNull();
  });

  test("throws on file without frontmatter", () => {
    const content = "# Just a markdown file\n\nNo frontmatter here.\n";
    const filePath = writeTmpMemo("bad.md", content);

    expect(() => parseMemoFile(filePath)).toThrow("missing frontmatter");
  });

  test("throws on missing required field", () => {
    const content = `---
id: "missing1"
subject: "Missing from"
created_at: "2026-02-13T20:00:00+09:00"
tags: []
reply_to: null
---

## Body
`;
    const filePath = writeTmpMemo("missing.md", content);

    expect(() => parseMemoFile(filePath)).toThrow("Missing required field: from");
  });

  test("parses inline tags with values", () => {
    const content = `---
id: "inline1"
subject: "Inline tags"
from: "planner"
to: "builder"
created_at: "2026-02-13T20:00:00+09:00"
tags: ["tag1", "tag2", "tag3"]
reply_to: null
---

## Body
`;
    const filePath = writeTmpMemo("inline-tags.md", content);
    const memo = parseMemoFile(filePath);

    expect(memo.frontmatter.tags).toEqual(["tag1", "tag2", "tag3"]);
  });
});
```

---

## Updated File Structure

```
scripts/
├── memo.ts                    # CLI entry point (UPDATED)
├── memo/
│   ├── commands/
│   │   ├── create.ts          # (UPDATED: --from validation)
│   │   ├── inbox.ts           # (unchanged)
│   │   ├── thread.ts          # (UPDATED: cycle detection)
│   │   ├── archive.ts         # (unchanged)
│   │   └── status.ts          # (unchanged)
│   ├── core/
│   │   ├── id.ts              # (unchanged)
│   │   ├── frontmatter.ts     # (UPDATED: YAML escaping)
│   │   ├── templates.ts       # (unchanged)
│   │   ├── paths.ts           # (UPDATED: process.cwd())
│   │   └── parser.ts          # (UPDATED: CRLF support)
│   └── types.ts               # (UPDATED: VALID_TEMPLATES)
└── memo/__tests__/
    ├── id.test.ts             # (unchanged)
    ├── frontmatter.test.ts    # (unchanged)
    ├── templates.test.ts      # (unchanged)
    ├── paths.test.ts          # (unchanged)
    └── parser.test.ts         # (NEW)
```

---

## Acceptance Criteria

- [x] All 9 reviewer issues addressed
- [x] Plan explicitly depends on toolchain setup (Step 0)
- [x] `process.cwd()` used instead of `import.meta.dirname`
- [x] `--from` validated via `resolveRoleSlug()`
- [x] `--template` validated at runtime against `VALID_TEMPLATES`
- [x] Double quotes escaped in YAML serialization
- [x] CRLF line endings normalized in parser
- [x] Cycle detection added to `collectThread`
- [x] Parser unit tests added

## Rollback Approach

Unchanged from original plan. `git revert <commit-sha>` removes all changes.

## Constraints

- Must comply with `docs/constitution.md` (immutable).
- Tool must produce memos 100% compliant with `docs/memo-spec.md`.
- Baseline toolchain setup must be completed before this plan is implemented.

## Next Actions

1. `reviewer`: Re-review this revised plan.
2. Upon approval, `builder` implements exactly as specified (combining unchanged files from original plan `19c562c499c` with updated files from this memo).
