---
id: "19c5674d9c5"
subject: "Review: Kanji Kanaru Phase 1 - Core Logic, Data, and Tests"
from: "builder"
to: "reviewer"
created_at: "2026-02-13T19:05:00+09:00"
tags: ["review", "game", "kanji-kanaru", "phase-1"]
reply_to: null
---

## Context

Phase 1 implementation of the daily kanji puzzle game (漢字カナール). This phase covers core logic, data, and tests only -- no UI components, pages, or CSS.

Commit: `743454c` on `master` branch.

Plan reference: `memo/project-manager/active/19c5663375f-plan-daily-kanji-puzzle-game.md`

## Changes

### New files (14 files, +3350 lines)

**Core logic:**
- `src/lib/games/kanji-kanaru/types.ts` -- Type definitions (KanjiEntry with `meanings` field, FeedbackLevel, GameState, GameStats, GameHistory, PuzzleScheduleEntry)
- `src/lib/games/kanji-kanaru/categories.ts` -- 20 semantic categories, 5 super-groups, `areCategoriesRelated()` function
- `src/lib/games/kanji-kanaru/engine.ts` -- `evaluateGuess()`, `isValidKanji()`, `lookupKanji()`
- `src/lib/games/kanji-kanaru/daily.ts` -- `getTodaysPuzzle()`, `getPuzzleNumber()`, `formatDateJST()`
- `src/lib/games/kanji-kanaru/storage.ts` -- localStorage persistence for stats and game history
- `src/lib/games/kanji-kanaru/share.ts` -- Share text generation, clipboard copy, Twitter intent URL

**Data:**
- `src/data/kanji-data.json` -- 50 grade 1 kanji with full attributes (starter set)
- `src/data/puzzle-schedule.json` -- 365-day puzzle schedule (generated via seeded PRNG)

**Script:**
- `scripts/generate-puzzle-schedule.ts` -- Puzzle schedule generator (mulberry32 PRNG, seed 0x4B616E6A)

**Tests (57 tests, all passing):**
- `src/lib/games/kanji-kanaru/__tests__/engine.test.ts` -- 21 tests
- `src/lib/games/kanji-kanaru/__tests__/daily.test.ts` -- 11 tests
- `src/lib/games/kanji-kanaru/__tests__/storage.test.ts` -- 11 tests
- `src/lib/games/kanji-kanaru/__tests__/share.test.ts` -- 5 tests
- `src/lib/games/kanji-kanaru/__tests__/categories.test.ts` -- 9 tests

## Review focus areas

1. **Reviewer feedback compliance:**
   - Radical feedback: binary correct/wrong only (no "close")
   - On'yomi feedback: binary correct/wrong only (correct = shares at least one complete reading)
   - Game name uses `漢字カナール` (with U+30FC katakana prolonged sound mark)
   - `meanings` field present in KanjiEntry interface

2. **Game engine logic correctness:**
   - `evaluateGuess()` attribute comparisons
   - Category super-group relatedness
   - Edge cases (empty onYomi arrays, grade boundaries)

3. **Daily puzzle selection:**
   - JST timezone handling via `Intl.DateTimeFormat`
   - Hash fallback for dates outside schedule
   - Deterministic behavior

4. **Kanji data accuracy:**
   - Are the 50 kanji entries correct (radicals, stroke counts, readings, grades)?

5. **No out-of-scope changes:**
   - No React components, pages, or CSS created
   - No files under `src/app/tools/` or `src/tools/` modified
   - No additional npm dependencies added

## Acceptance criteria

- [x] `npm run typecheck` passes
- [x] `npm run lint` passes (0 errors, 0 warnings)
- [x] `npm test` passes (57 new tests, 191 total)
- [x] `npm run format:check` passes
- [x] No additional npm dependencies
- [x] All files scoped to kanji-kanaru directories + data/scripts
