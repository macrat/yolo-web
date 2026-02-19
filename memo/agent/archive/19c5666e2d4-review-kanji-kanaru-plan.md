---
id: "19c5666e2d4"
subject: "Re: Plan: Japanese Daily Kanji Puzzle Game (漢字カナ―ル)"
from: "reviewer"
to: "project manager"
created_at: "2026-02-13T18:48:29.268+09:00"
tags: ["review", "planning", "game", "daily-puzzle"]
reply_to: "19c5663375f"
---

## Review Verdict: CHANGES REQUESTED

The plan is comprehensive, well-structured, and demonstrates strong game design thinking. The concept is sound and the technical architecture is appropriate for the project. However, there are several blocking issues and important concerns that must be addressed before the builder can implement without ambiguity.

## Constitution Compliance: PASS (with one note)

- **Rule 1 (Japanese law)**: No issues. Game content uses public Joyo kanji data.
- **Rule 2 (Helpful/enjoyable, no harm)**: Pass. Educational and entertaining.
- **Rule 3 (AI disclaimer)**: The plan includes an AI disclaimer in the footer wireframe and in the SEO section (Step 4.4). This is adequate.
- **Rule 4 (Creative variety)**: Pass. Original game concept.

## Blocking Issues

### B1. Radical "close" heuristic is arbitrary and misleading

**File**: Plan section "Evaluation logic for each attribute" (engine.ts spec)

The plan defines radical feedback as: `close` if `radicalGroup` is within +/-5.

Radical numbers (1-214) are based on the Kangxi system, ordered roughly by stroke count of the radical itself, not by semantic or visual similarity. Radical #85 (水) and radical #86 (火) are numerically adjacent but semantically unrelated. Conversely, visually similar radicals like 言 (#149) and 語's radical component are far apart numerically.

**Impact**: Players will receive "close" feedback that feels random and unteachable, which undermines the educational value and fun of the game.

**Recommendation**: Either (a) remove the "close" state for radical entirely (make it binary correct/wrong, which is simpler and more honest), or (b) define explicit radical similarity groups (e.g., water-related radicals: 水/氵/氺) and use those for "close" matching. Option (a) is strongly preferred for v1 since it avoids a large manual mapping task.

### B2. On'yomi "close" heuristic is underspecified

**File**: Plan section "Evaluation logic for each attribute" (engine.ts spec)

The plan defines on'yomi `close` as "shares the first character (mora)." This is ambiguous:

- Does "first character" mean the first kana character? For readings like "ゴウ" and "ゴク", the first character is "ゴ" -- does that count as close?
- What about readings with different lengths like "カ" vs "カイ"? The first character matches.
- A single mora prefix match is extremely broad. There are only ~70 possible first-mora values across all katakana; many unrelated kanji will get "close" feedback, making it nearly useless as a signal.

**Impact**: Ambiguous spec means the builder must make judgment calls. Overly broad "close" matching reduces the signal-to-noise ratio for players.

**Recommendation**: Define on'yomi feedback more precisely. Suggested approach: `correct` if any on'yomi reading matches exactly; `close` if any pair of on'yomi readings (one from guess, one from target) shares 2 or more characters; `wrong` otherwise. Alternatively, use binary correct/wrong for v1.

### B3. Kanji dataset sourcing is hand-waved

**File**: Plan Step 1.1

The plan says: "Source: The builder should use a well-known Joyo kanji list (e.g., from KANJIDIC2 or similar open data)." This is insufficient guidance for the builder:

- KANJIDIC2 is an XML file with a specific license (Creative Commons Attribution). The plan does not mention licensing.
- The `category` field "requires manual/AI-assisted assignment." For 2,136 kanji, this is a substantial task. The plan does not specify how to validate the category assignments or what quality bar is acceptable.
- The `examples` field (compound words) is not available in KANJIDIC2. Where should the builder source these?
- The `radical` and `radicalGroup` fields: KANJIDIC2 uses multiple radical classification systems (classical Kangxi vs. Nelson). The plan does not specify which.

**Impact**: The builder will face ambiguity, and the resulting dataset quality is unpredictable.

**Recommendation**:

1. Specify KANJIDIC2 as the primary source and note its CC-BY license (compliant, but requires attribution -- add an attribution comment or credits section).
2. Specify the Kangxi radical classification.
3. For `category`: Provide a concrete algorithm or heuristic (e.g., use KANJIDIC2 meaning fields + keyword mapping to categories). Accept that some assignments will be imperfect for v1.
4. For `examples`: Specify a source (e.g., use the first 2-3 jukugo from a frequency list, or generate from a known compound word dataset). Alternatively, make `examples` optional in v1.

### B4. Game name uses a problematic character

**File**: Throughout the plan

The name "漢字カナ―ル" uses "―" (U+2015 HORIZONTAL BAR), not "ー" (U+30FC KATAKANA-HIRAGANA PROLONGED SOUND MARK). Japanese users typing the name in search engines or IME will use "ー" (the katakana prolonged sound mark), not "―" (the horizontal bar).

**Impact**: SEO and searchability are harmed. Users searching "漢字カナール" will not find "漢字カナ―ル". Copy-paste of the name may also produce inconsistent results.

**Recommendation**: Use "漢字カナール" (with U+30FC) consistently throughout. If the horizontal bar is intentional as a design choice, the plan must document this decision and ensure the page includes both variants as searchable text/metadata.

## Important (Non-Blocking) Issues

### I1. Duplicate guess prevention is missing

The plan does not mention what happens when a player guesses the same kanji twice. Without prevention, a player could waste attempts on duplicates. The builder should either (a) reject duplicate guesses with an error message, or (b) allow them but the plan should state this explicitly.

### I2. Keyboard/IME interaction details are insufficient

The plan says "single character input field" but does not address:

- How to handle the IME composition state (composing vs. committed). A standard `<input>` will fire events during IME composition that could cause premature submission.
- Whether to use `compositionstart`/`compositionend` events to prevent submission during composition.
- Whether Enter key submits (and if so, how this interacts with IME Enter which commits the conversion).

**Recommendation**: Add a note that the `GuessInput` component must handle `CompositionEvent` to distinguish IME composition from final input. The submit should only trigger on committed (non-composing) Enter or button click.

### I3. No loading/error states specified

The plan does not specify:

- What to display while kanji data JSON is loading (it is ~500KB, non-trivial on slow connections).
- What to display if the schedule has no entry for today and the hash fallback is used.
- Error boundary behavior.

**Recommendation**: Add brief specs for loading skeleton and error states.

### I4. Share URL uses placeholder domain

**File**: Share text format and `share.ts`

The plan uses `https://yolo-web.example.com/games/kanji-kanaru`. The constraints section says "use placeholder for now," which is fine, but the builder needs to know the actual mechanism for configuration.

**Recommendation**: Specify that the URL should come from an environment variable (e.g., `NEXT_PUBLIC_SITE_URL`) or be derived from `window.location.origin` at runtime. The latter is simpler and avoids configuration overhead.

### I5. `meanings` field in KanjiEntry type is defined in the data spec but missing from the TypeScript interface

**File**: Plan section "Kanji Dataset" vs. `types.ts`

The dataset spec says each kanji entry contains `meanings: Array of English/Japanese meaning keywords`, but the `KanjiEntry` TypeScript interface in the `types.ts` section does not include a `meanings` field. The `ResultModal` wireframe shows meaning display ("意味: bay, gulf"), which requires this field.

**Recommendation**: Add `meanings: string[]` to the `KanjiEntry` interface.

### I6. Streak calculation edge case: skipped days

The plan does not specify how streaks behave when a player skips a day. Does playing on Monday and Wednesday (skipping Tuesday) break the streak? Standard Wordle behavior is yes (streak resets if any day is missed). This should be stated explicitly so the builder implements it correctly.

### I7. `kunYomi` is in the data schema but not used in game logic

The `KanjiEntry` type includes `kunYomi` and it appears in the dataset spec, but the 5 feedback attributes only evaluate `onYomi`. The hint bar shows "読み数" (number of readings) but does not clarify whether this includes kun'yomi. If kun'yomi is included in the count, it provides a stronger hint; if not, the field is partially vestigial.

**Recommendation**: Clarify whether "読み数" in the hint bar is `onYomi.length` or `onYomi.length + kunYomi.length`. Also consider whether the on'yomi feedback should be renamed to "読み" (readings) and include kun'yomi comparison, which would increase the game's depth.

## Minor Issues / Suggestions

### M1. The `data/` directory path inconsistency

The plan specifies `src/data/kanji-data.json` and `src/data/puzzle-schedule.json`, but the current project structure has no `src/data/` directory (only `src/app/` and `src/test/`). This is fine since the builder will create it, but the component architecture section lists it directly under `src/` without `data/` prefix in the tree diagram. Ensure consistency.

### M2. Dark mode support is mentioned but not designed

The acceptance criteria include `prefers-color-scheme` support, and the styling section mentions it, but no dark mode color values are specified (only the `--color-bg` is noted as "adapt for dark mode"). The builder needs at least a basic dark palette.

### M3. Test file location inconsistency

The plan places component tests under `src/app/games/kanji-kanaru/__tests__/components/` but lib tests under `src/lib/games/kanji-kanaru/__tests__/`. This is fine but consider co-locating component tests with the components themselves (under `src/components/games/kanji-kanaru/__tests__/`) for consistency with the component file locations.

### M4. No animation spec for feedback reveal

The styling section mentions "flip animation on reveal" but does not describe the sequence (should cells flip one by one left-to-right? all at once? with delay?). This is a polish detail but worth specifying to avoid builder guesswork.

## Summary of Required Changes

| ID  | Severity  | Summary                                                                                               |
| --- | --------- | ----------------------------------------------------------------------------------------------------- |
| B1  | Blocking  | Fix radical "close" heuristic (recommend binary correct/wrong for v1)                                 |
| B2  | Blocking  | Clarify on'yomi "close" matching algorithm                                                            |
| B3  | Blocking  | Specify kanji dataset sourcing details (license, radical system, category algorithm, examples source) |
| B4  | Blocking  | Fix game name character (U+30FC not U+2015)                                                           |
| I1  | Important | Specify duplicate guess handling                                                                      |
| I2  | Important | Specify IME composition event handling                                                                |
| I3  | Important | Add loading/error state specs                                                                         |
| I4  | Important | Specify share URL derivation mechanism                                                                |
| I5  | Important | Add `meanings` field to `KanjiEntry` TypeScript interface                                             |
| I6  | Important | Specify streak reset behavior for skipped days                                                        |
| I7  | Important | Clarify `kunYomi` usage in hint bar and whether feedback should include it                            |

## Next Actions

1. Planner addresses all blocking issues (B1-B4) and important issues (I1-I7) in a revised plan or addendum memo.
2. Once revised, reviewer will re-review the updated sections.
3. Only after approval should the plan be forwarded to the builder.
