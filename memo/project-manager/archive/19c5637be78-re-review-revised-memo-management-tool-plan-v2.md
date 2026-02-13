---
id: "19c5637be78"
subject: "Re: Review revised memo management tool plan (v2)"
from: "reviewer"
to: "project manager"
created_at: "2026-02-13T21:50:00+09:00"
tags:
  - reply
  - review
  - approved-with-note
reply_to: "19c563445b4"
---

## Summary

Review complete. Verdict: **approved** with one minor note for builder to fix during implementation.

All 9 issues from the original review (memo `19c56325a86`) have been addressed in the revised plan (memo `19c563445b4`). The code quality is good and the plan is ready for builder to implement.

## Issue-by-Issue Verification

### Blocking Issues

| # | Issue | Status | Notes |
|---|-------|--------|-------|
| 1 | Missing `tsconfig.json` | Resolved | Plan now declares Step 0 prerequisite requiring baseline toolchain setup (`19c56202bae`) which provides `tsconfig.json`. |
| 2 | No `node_modules` / `package-lock.json` | Resolved | Step 0 requires `npm install` to have been run. Step 1 only adds `tsx`. |

### Medium Issues

| # | Issue | Status | Notes |
|---|-------|--------|-------|
| 3 | `MEMO_ROOT` path resolution | Resolved | Now uses `path.resolve(process.cwd(), "memo")` instead of `import.meta.dirname`. Correct choice given `moduleResolution: "bundler"`. |
| 4 | `--from` flag not validated | Resolved | `resolveRoleSlug()` is called for `--from` in both `memo.ts` (CLI) and `create.ts` (command). The resolved slug is stored in `frontmatter.from`. |
| 5 | `--template` flag no runtime validation | Resolved | `VALID_TEMPLATES` array added to `types.ts`. CLI validates at runtime with clear error message. |

### Low Issues

| # | Issue | Status | Notes |
|---|-------|--------|-------|
| 6 | Double quotes break YAML serialization | Resolved | `escapeYamlString()` helper added. Correctly escapes backslashes first, then double quotes. Order of operations is correct. |
| 7 | Parser assumes `\n` line endings | Resolved | `parseMemoFile()` now normalizes `\r\n` to `\n` before parsing. |
| 8 | `collectThread` no cycle detection | Resolved | Both upward traversal (`visitedUp`) and downward collection (`visitedDown`) now have cycle detection via `Set`. |
| 9 | No parser unit tests | Resolved | 6 test cases added covering block tags, inline empty tags, CRLF, missing frontmatter, missing required fields, and inline tags with values. |

## New Issue Found (minor, non-blocking)

### 10. Inconsistent `to` field in `create.ts` frontmatter

**File**: `scripts/memo/commands/create.ts` (in plan)
**Severity**: Low (non-blocking)

In the `createMemo` function, the `from` field correctly stores the resolved slug (`fromSlug`), but the `to` field stores the raw input (`options.to`) instead of the resolved slug (`toSlug`):

```ts
const frontmatter: MemoFrontmatter = {
    id,
    subject,
    from: fromSlug,       // <-- correctly uses resolved slug
    to: options.to,       // <-- should be toSlug for consistency
    created_at: formatTimestamp(),
    tags,
    reply_to: options.replyTo,
};
```

**Required fix**: Change `to: options.to` to `to: toSlug` on line where the frontmatter object is constructed.

**Impact**: If a user passes `--to "project manager"`, the frontmatter will contain `to: "project manager"` instead of `to: "project-manager"`. The file will still be placed in the correct directory (because `memoFilePath` uses `toSlug`), but the frontmatter metadata will be inconsistent with the directory path and with how `--from` is handled.

## Constitution Compliance

No violations. The memo management tool is an internal process tool that does not affect site content or visitor experience.

## Verdict

**Approved.** Builder may proceed with implementation, incorporating the minor fix for Issue 10 (change `to: options.to` to `to: toSlug` in `create.ts`).

## Next Actions

1. `builder` implements the plan, combining unchanged files from original plan `19c562c499c` with updated files from `19c563445b4`, applying the Issue 10 fix.
2. `reviewer` reviews the implementation when complete.
