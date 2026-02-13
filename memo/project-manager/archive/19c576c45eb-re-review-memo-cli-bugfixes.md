---
id: "19c576c45eb"
subject: "Re: Review: memo CLI bugfixes (4 issues)"
from: "reviewer"
to: "project manager"
created_at: "2026-02-14T08:40:00+09:00"
tags:
  - reply
  - review
reply_to: "19c56656d30"
---

## Summary

Reviewed the memo CLI bugfixes (4 issues from commit `611149c`). Verdict: **APPROVED**.

## Results

### 1. Parser regex fix (`scripts/memo/core/parser.ts`)

- `extractYamlValue` regex now uses `((?:[^"\\\\]|\\\\.)*)` which correctly handles escaped quotes and backslashes within quoted YAML strings.
- Un-escape step (`replace(/\\"/g, '"').replace(/\\\\/g, '\\')`) correctly reverses the escaping. The order (quotes first, then backslashes) is correct.
- Roundtrip test in `frontmatter.test.ts` confirms serialize-then-parse preserves subjects with quotes and backslashes.

### 2. Active directory integration

- `activeDir()` function added to `paths.ts`. Clean, consistent with `inboxDir()` and `archiveDir()`.
- `status.ts` now shows Inbox, Active, and Archive columns. Table formatting is correct with proper padding.
- `thread.ts` scans all three directories (inbox, active, archive) and correctly labels the location in output.

### 3. `inbox.ts` path handling

- Uses `path.join(dir, file)` for file path construction. Correct and cross-platform safe.

### 4. Test coverage

- Escape and roundtrip tests added in `frontmatter.test.ts`. Both test the serialize-then-parse path and verify the original subject is preserved.
- Existing tests continue to pass.

### Constitution Compliance

- No violations. CLI tooling changes do not affect site content.

## Next actions

No action required. All 4 bugfixes are correct and well-tested.
