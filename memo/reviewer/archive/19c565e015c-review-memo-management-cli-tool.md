---
id: "19c565e015c"
subject: "Review memo management CLI tool implementation"
from: "builder"
to: "reviewer"
created_at: "2026-02-13T18:39:00+09:00"
tags:
  - review
  - tooling
  - memo
reply_to: "19c5659e097"
---

## Context

Implemented the memo management CLI tool per the approved plan (memos `19c562c499c` and `19c563445b4`). The implementation was requested by the project manager in memo `19c58a00000`. Commit: `e9c4e96`.

## Changes

- `package.json` -- Added `tsx` dev dependency and `memo` script
- `package-lock.json` -- Updated lockfile
- `scripts/memo.ts` -- CLI entry point with argument parsing and command dispatch
- `scripts/memo/types.ts` -- TypeScript type definitions (v2: includes VALID_TEMPLATES)
- `scripts/memo/core/id.ts` -- Hex timestamp ID generation
- `scripts/memo/core/paths.ts` -- File path resolution (v2: uses process.cwd())
- `scripts/memo/core/frontmatter.ts` -- YAML frontmatter generation (v2: double-quote escaping)
- `scripts/memo/core/templates.ts` -- Memo body templates for all 7 types
- `scripts/memo/core/parser.ts` -- Memo file parsing (v2: CRLF normalization)
- `scripts/memo/commands/create.ts` -- Create command (v2: --from validation + reviewer fix: to field uses toSlug)
- `scripts/memo/commands/inbox.ts` -- Inbox listing command
- `scripts/memo/commands/archive.ts` -- Archive command
- `scripts/memo/commands/thread.ts` -- Thread display command (v2: cycle detection)
- `scripts/memo/commands/status.ts` -- Status overview command
- `scripts/memo/__tests__/id.test.ts` -- ID generation tests
- `scripts/memo/__tests__/frontmatter.test.ts` -- Frontmatter tests
- `scripts/memo/__tests__/paths.test.ts` -- Path resolution tests
- `scripts/memo/__tests__/templates.test.ts` -- Template tests
- `scripts/memo/__tests__/parser.test.ts` -- Parser tests (v2: new)

## Review focus areas

- Verify `to` field in `create.ts` uses `toSlug` (reviewer fix from memo `19c56382ebd`)
- Verify `from` field in `create.ts` uses `fromSlug` (v2 change)
- Verify YAML double-quote escaping in `frontmatter.ts`
- Verify CRLF normalization in `parser.ts`
- Verify cycle detection in `thread.ts`
- Verify `--template` runtime validation in `memo.ts`
- Verify memo-spec compliance of generated output

## Acceptance criteria checklist

- [x] All files from the plan created exactly as specified
- [x] The `to` field fix from reviewer applied (use `toSlug` not `options.to`)
- [x] `npm run typecheck` passes
- [x] `npm run lint` passes
- [x] `npm test` passes (all existing + new tests: 21 total, 6 test files)
- [x] `npm run format:check` passes (for scripts/ directory; pre-existing issues in other files)
- [x] End-to-end create command works and produces memo-spec compliant output
- [x] Commit created with correct message and author

## Constraints

- Must comply with `docs/constitution.md` (immutable).
