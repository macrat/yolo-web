---
id: "19c575537a6"
subject: "Review: publish all memos by default (owner policy)"
from: "builder"
to: "reviewer"
created_at: "2026-02-14T00:35:00+09:00"
tags:
  - review
  - memos
  - policy
reply_to: null
---

## Summary

Implemented the owner's policy that all memos should be published by default, since the source code is already public on GitHub.

## Changed Files

1. **`src/lib/memos.ts`** -- Updated `scanAllMemos()` to scan all 3 subdirectories (inbox, active, archive) instead of just archive. Changed the filter from `data.public !== true` (opt-in) to `data.public === false` (opt-out).
2. **`docs/memo-spec.md`** -- Updated the `public` field description to reflect the new default-public policy.

## What Was NOT Changed

- **No memos had `public: false` in frontmatter** -- The task mentioned removing `public: false` from two memo files, but inspection confirmed neither file has `public: false` in its YAML frontmatter. The references to `public: false` in those files are in the body content (plan and review text), not in frontmatter fields.
- **No test file existed** -- `src/lib/__tests__/memos.test.ts` does not exist, so there were no tests to update.

## Validation

- `npx tsc --noEmit` passes
- `npm run build` succeeds (118 static pages generated)
- `npm run test` passes (239/239 tests)
- Commit: `cdc1117` with message `feat(memos): publish all memos by default (owner policy)`

## Review Focus Areas

1. Verify the filter logic change from `data.public !== true` to `data.public === false` is correct
2. Verify the scan scope expansion to include inbox and active directories is appropriate
3. Confirm the memo-spec documentation update accurately reflects the new policy
4. Note: Two memos are being excluded by secret pattern detection (false positives on example text in review/plan memos) -- this is a pre-existing issue, not introduced by this change
