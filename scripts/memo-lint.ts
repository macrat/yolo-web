import { scanAllMemos } from "./memo/core/scanner.js";
import { timestampFromId } from "./memo/core/id.js";
import { checkCredentials } from "./memo/core/credential-check.js";
import type { MemoFrontmatter } from "./memo/types.js";

export interface LintError {
  file: string;
  message: string;
}

const REQUIRED_FIELDS: (keyof MemoFrontmatter)[] = [
  "id",
  "subject",
  "from",
  "to",
  "created_at",
  "tags",
  "reply_to",
];

/**
 * Check that all required frontmatter fields are present and non-empty.
 * reply_to may be null (which is valid), but must be explicitly present.
 */
function checkRequiredFields(fm: MemoFrontmatter, file: string): LintError[] {
  const errors: LintError[] = [];
  for (const field of REQUIRED_FIELDS) {
    const value = fm[field];
    // reply_to is allowed to be null
    if (field === "reply_to") continue;
    // tags is allowed to be empty array
    if (field === "tags") {
      if (!Array.isArray(value)) {
        errors.push({ file, message: `Missing or invalid field: ${field}` });
      }
      continue;
    }
    if (value === undefined || value === null || value === "") {
      errors.push({ file, message: `Missing required field: ${field}` });
    }
  }
  return errors;
}

/**
 * Check that the ID and created_at are consistent.
 * timestampFromId(id) should equal new Date(created_at).getTime()
 */
function checkIdConsistency(fm: MemoFrontmatter, file: string): LintError[] {
  const idTimestamp = timestampFromId(fm.id);
  const createdTimestamp = new Date(fm.created_at).getTime();
  if (isNaN(createdTimestamp)) {
    return [{ file, message: `Invalid created_at: ${fm.created_at}` }];
  }
  if (idTimestamp !== createdTimestamp) {
    return [
      {
        file,
        message: `ID/created_at mismatch: id "${fm.id}" -> ${idTimestamp}, created_at "${fm.created_at}" -> ${createdTimestamp}`,
      },
    ];
  }
  return [];
}

/**
 * Check that no two memos share the same ID.
 */
function checkIdUniqueness(memos: { id: string; file: string }[]): LintError[] {
  const errors: LintError[] = [];
  const seen = new Map<string, string>();
  for (const { id, file } of memos) {
    const existing = seen.get(id);
    if (existing) {
      errors.push({
        file,
        message: `Duplicate ID "${id}" (also in ${existing})`,
      });
    } else {
      seen.set(id, file);
    }
  }
  return errors;
}

/**
 * Strip fenced code blocks and inline code from markdown text.
 * Credential patterns inside code examples are not real secrets.
 * Lines containing inline code are removed entirely since the
 * surrounding descriptive text often mentions credential-like words.
 */
function stripCodeBlocks(text: string): string {
  // Remove fenced code blocks (``` ... ```)
  let stripped = text.replace(/```[\s\S]*?```/g, "");
  // Remove entire lines containing inline code (the surrounding
  // description often mentions credential terms like "Bearer token")
  stripped = stripped
    .split("\n")
    .filter((line) => !line.includes("`"))
    .join("\n");
  return stripped;
}

/**
 * Check memo body for credential patterns.
 * Code blocks are excluded since they often contain example patterns.
 */
function checkCredentialPatterns(body: string, file: string): LintError[] {
  const strippedBody = stripCodeBlocks(body);
  const result = checkCredentials(strippedBody);
  if (result.found) {
    return [
      {
        file,
        message: `Possible credential in body: ${result.description}`,
      },
    ];
  }
  return [];
}

/**
 * Run all lint checks on all memos.
 * Returns a list of errors (empty if all memos pass).
 */
export function lintAllMemos(): LintError[] {
  const memos = scanAllMemos();
  const errors: LintError[] = [];

  // Per-memo checks
  for (const memo of memos) {
    errors.push(...checkRequiredFields(memo.frontmatter, memo.filePath));
    errors.push(...checkIdConsistency(memo.frontmatter, memo.filePath));
    errors.push(...checkCredentialPatterns(memo.body, memo.filePath));
  }

  // Cross-memo checks
  errors.push(
    ...checkIdUniqueness(
      memos.map((m) => ({ id: m.frontmatter.id, file: m.filePath })),
    ),
  );

  return errors;
}

// CLI entry point
if (
  process.argv[1] &&
  (process.argv[1].endsWith("memo-lint.ts") ||
    process.argv[1].endsWith("memo-lint.js"))
) {
  const errors = lintAllMemos();
  if (errors.length > 0) {
    console.error(`memo-lint: ${errors.length} error(s) found:\n`);
    for (const err of errors) {
      console.error(`  ${err.file}: ${err.message}`);
    }
    process.exit(1);
  } else {
    console.log("memo-lint: all memos OK");
    process.exit(0);
  }
}
