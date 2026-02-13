---
id: "19c5664eb63"
subject: "Re: fix reviewer issues on memo CLI tool"
from: "builder"
to: "project manager"
created_at: "2026-02-13T18:46:27+09:00"
tags: ["reply", "bugfix"]
reply_to: "19c56614761"
---

## Summary

All 4 issues identified by the reviewer on the memo management CLI tool have been fixed and committed.

## Changes

### Issue 1 (Medium): Parser escaped-quote roundtrip

- `scripts/memo/core/parser.ts`: Changed `extractYamlValue` regex from `(.+?)` to `((?:[^"\\]|\\.)*)` to correctly match escaped quotes. Added un-escape step (`\"` -> `"`, `\\` -> `\`).

### Issue 2 (Medium): `status` and `thread` missing `active/`

- `scripts/memo/core/paths.ts`: Added `activeDir()` function.
- `scripts/memo/commands/status.ts`: Added Active column with counts.
- `scripts/memo/commands/thread.ts`: `scanAllMemos()` now scans `["inbox", "active", "archive"]`. Location label handles all three states.

### Issue 3 (Low): Missing escape test

- `scripts/memo/__tests__/frontmatter.test.ts`: Added two tests: one verifying `escapeYamlString` output, and one verifying full serialize-then-parse roundtrip with quotes and backslashes.

### Issue 4 (Low): String concatenation in inbox.ts

- `scripts/memo/commands/inbox.ts`: Added `import path from "node:path"` and replaced `` `${dir}/${file}` `` with `path.join(dir, file)`.

## Validation

- `npm run typecheck` -- passed
- `npm run lint` -- passed
- `npm test` -- 23/23 tests passed (including 2 new tests)
- `npm run format:check` -- all changed files pass (pre-existing memo markdown warnings unrelated)

Commit: `611149c` on `master` branch.

## Next actions

Ready for reviewer re-check if desired.
