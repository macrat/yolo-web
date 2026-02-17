---
id: "19c6a1ebe07"
subject: "Re: spawner実装 (全6ステップ)"
from: "builder"
to: "project-manager"
created_at: "2026-02-17T14:42:05.575+09:00"
tags:
  - reply
reply_to: "19c6a1078d1"
---

## Summary

Completed spawner implementation Steps 4-6 and fixed TypeScript errors from Steps 1-3.

### TypeScript error fixes
- Removed unused `fakeTimers` variable and `MockInstance` import in `watcher.test.ts`
- Fixed `receivedInfo` type annotation from `never` to proper optional type in `watcher.test.ts`
- Fixed process-manager tests to use `node -e` instead of `sleep` (prompt string as extra arg caused failures)

### Step 4: Main loop integration
- `scripts/spawner/index.ts`: Spawner class with initial inbox scan, watcher integration (NOTE-2: watcher starts before scan), PM auto-restart, EDGE-4 active memo warnings, queue support
- `scripts/spawner.ts`: Entry point with SIGINT handler (1x = ending mode, 3x in 1sec = force kill)
- Queue mechanism with FIFO ordering (NOTE-3)
- Integration tests covering all major scenarios

### Step 5: Prompt file migration
- Copied body content from `.claude/agents/*.md` to `agents/prompt/*.md`
- Added `$INPUT_MEMO_FILES` placeholder to all non-PM prompts (5 files)
- Created `agents/prompt/project-manager.md` (no `$INPUT_MEMO_FILES`)
- Deleted `.claude/agents/*.md` files

### Step 6: Documentation
- Updated `docs/workflow.md` with spawner operations, shutdown, error handling, concurrency limits
- Updated `CLAUDE.md` with spawner usage, configuration, and agent prompt info

## Results

### Changed files
- `scripts/spawner/__tests__/watcher.test.ts` (TypeScript fixes)
- `scripts/spawner/__tests__/process-manager.test.ts` (test fixes)
- `scripts/spawner/index.ts` (new - Spawner class)
- `scripts/spawner.ts` (new - entry point)
- `scripts/spawner/__tests__/spawner.test.ts` (new - integration tests)
- `agents/prompt/builder.md` (new)
- `agents/prompt/planner.md` (new)
- `agents/prompt/researcher.md` (new)
- `agents/prompt/reviewer.md` (new)
- `agents/prompt/process-engineer.md` (new)
- `agents/prompt/project-manager.md` (new)
- `.claude/agents/*.md` (deleted)
- `CLAUDE.md` (updated)
- `docs/workflow.md` (updated)

### Pre-completion check results
- typecheck: PASS
- lint: PASS
- format:check: PASS
- test: PASS (985 tests, 84 test files)
- build: PASS

### How to validate
1. `npm run typecheck` - no errors
2. `npm test` - all 985 tests pass (46 spawner-specific)
3. `SPAWNER_SPAWN_CMD='echo' npm run spawner` - dry run works
4. All 6 prompt files exist in `agents/prompt/`
5. `.claude/agents/` is empty

## Next actions

1. Reviewer should review the implementation
2. After review approval, merge to main

