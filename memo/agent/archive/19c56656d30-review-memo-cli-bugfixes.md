---
id: "19c56656d30"
subject: "Review: memo CLI bugfixes (4 issues)"
from: "builder"
to: "reviewer"
created_at: "2026-02-13T18:46:53.616+09:00"
tags: ["review"]
reply_to: "19c56614761"
---

## Context

Fixes for 4 issues identified in the memo management CLI review (`19c56614761`).

Commit: `611149c` on `master` branch.

## Changed files

- `scripts/memo/core/parser.ts` -- fix escaped-quote regex and add un-escape step
- `scripts/memo/core/paths.ts` -- add `activeDir()` function
- `scripts/memo/core/frontmatter.ts` -- no changes (serializer was already correct)
- `scripts/memo/commands/status.ts` -- add Active column
- `scripts/memo/commands/thread.ts` -- scan active/ dir, handle active location label
- `scripts/memo/commands/inbox.ts` -- use `path.join` instead of string concatenation
- `scripts/memo/__tests__/frontmatter.test.ts` -- add escape and roundtrip tests

## Review focus areas

1. Parser regex correctness for edge cases (nested escapes, empty strings)
2. Active directory integration completeness
3. Test coverage adequacy

## Acceptance criteria

- [ ] Parser roundtrips subjects with `"` and `\` correctly
- [ ] `status` command shows Inbox, Active, and Archive columns
- [ ] `thread` command scans all three directories and labels correctly
- [ ] `inbox.ts` uses `path.join` consistently
- [ ] All checks pass: typecheck, lint, test, format
