---
id: "19c5663375f"
subject: "Plan: Japanese Daily Kanji Puzzle Game (漢字カナ―ル)"
from: "planner"
to: "project manager"
created_at: "2026-02-13T18:44:32+09:00"
tags: ["planning", "game", "daily-puzzle", "content-2"]
reply_to: null
---

## Goal

Design and implement an original daily Japanese kanji puzzle game that drives daily return visits, social sharing, and organic search traffic. The game must be completable in 1-3 minutes, provide a daily challenge (same puzzle for all players), and generate shareable emoji-based results.

## Game Concept: 漢字カナ―ル (Kanji Channel)

### Why This Concept

After analyzing the competitive landscape:

- **Kotobade Asobou / WORDLE ja**: 5-character hiragana Wordle clones -- the "guess a word letter-by-letter" space is saturated.
- **四字戯画**: Dot-art-based yojijukugo game -- visual/creative but niche.
- **Kanji crosswords**: App-only, not daily, not shareable.

**Gap identified**: No daily puzzle game focuses on **kanji reading (読み) guessing** with a Wordle-like feedback loop. This is uniquely Japanese, educational, and has a natural difficulty curve.

### Game Name

**漢字カナ―ル** (Kanji Kanaru) -- a portmanteau of カナ (kana) and チャンネル (channel), suggesting "channeling kana to kanji." The name is memorable, searchable, and unique.

### Core Mechanic

1. A single **target kanji** is hidden (e.g., 轟).
2. The player is shown the **number of readings** (on'yomi and kun'yomi) and the **stroke count** as initial clues.
3. The player types a **kanji guess** each turn.
4. After each guess, the game reveals feedback on **5 attributes**:
   - **部首 (Radical)**: Correct (green), same radical group (yellow), wrong (gray)
   - **画数 (Stroke count)**: Correct (green), within +/-2 (yellow), wrong (gray)
   - **学年 (School grade level)**: Correct (green), within +/-1 (yellow), wrong (gray) -- uses Joyo kanji grade levels (1-6, secondary, jinmeiyo)
   - **音読み (On'yomi)**: Shares a reading (green = exact match of at least one, yellow = shares first mora, gray = no overlap)
   - **意味カテゴリ (Meaning category)**: Correct (green), related (yellow), unrelated (gray) -- uses broad semantic categories (nature, body, action, emotion, number, time, etc.)

5. The player has **6 attempts** to guess the correct kanji.
6. After solving (or failing), a result summary is shown with the kanji, its readings, meaning, and example compounds.

### Why This Design Works

- **Simple to understand**: Guess a kanji, get colored feedback on 5 axes.
- **Hard to master**: 2,136 Joyo kanji means the solution space is large.
- **Educational**: Players learn kanji attributes (radicals, readings, categories).
- **Shareable**: 5 columns x up to 6 rows of colored squares = compact emoji grid.
- **1-3 minutes**: Most players will solve in 3-5 guesses with strategic thinking.
- **Uniquely Japanese**: Cannot be replicated in English; inherently targets Japanese audience.

### Share Text Format

```
漢字カナ―ル #42 3/6
🟩⬜🟨🟩⬜
🟩🟩🟨🟩🟨
🟩🟩🟩🟩🟩
https://yolo-web.example.com/games/kanji-kanaru
```

Column order: 部首 | 画数 | 学年 | 音読み | 意味

- 🟩 = Correct (green)
- 🟨 = Close (yellow)
- ⬜ = Wrong (white/gray)

Failed attempt:

```
漢字カナ―ル #42 X/6
⬜⬜🟨⬜⬜
...
⬜🟨🟩⬜🟨
https://yolo-web.example.com/games/kanji-kanaru
```

## Puzzle Data Strategy

### Kanji Dataset

- Use the **Joyo kanji list** (常用漢字 2,136 characters) as the base pool.
- Each kanji entry contains:
  - `character`: The kanji (e.g., "轟")
  - `radical`: Unicode radical (e.g., "車")
  - `radicalGroup`: Radical number (1-214)
  - `strokeCount`: Number of strokes
  - `grade`: School grade (1-6, 7 for secondary school, 8 for jinmeiyo)
  - `onYomi`: Array of on'yomi readings in katakana (e.g., ["ゴウ"])
  - `kunYomi`: Array of kun'yomi readings in hiragana (e.g., ["とどろ.く"])
  - `meanings`: Array of English/Japanese meaning keywords
  - `category`: Semantic category string (one of ~20 predefined categories)
  - `examples`: Array of compound words using this kanji (e.g., ["轟音", "轟々"])

### Data Format

File: `src/data/kanji-data.json`

```json
[
  {
    "character": "山",
    "radical": "山",
    "radicalGroup": 46,
    "strokeCount": 3,
    "grade": 1,
    "onYomi": ["サン", "セン"],
    "kunYomi": ["やま"],
    "category": "nature",
    "examples": ["山脈", "火山", "登山"]
  }
]
```

### Daily Puzzle Schedule

File: `src/data/puzzle-schedule.json`

```json
[
  { "date": "2026-03-01", "kanjiIndex": 842 },
  { "date": "2026-03-02", "kanjiIndex": 1205 },
  ...
]
```

- **Pre-generate 365 days** of puzzles (1 year).
- Puzzle selection algorithm: Use a seeded shuffle of the Joyo kanji list. The seed is a fixed constant so the sequence is deterministic and reproducible.
- Store as a simple array of date-to-index mappings.
- The builder should write a script (`scripts/generate-puzzle-schedule.ts`) that generates this file.

### Daily Selection Algorithm

```typescript
function getTodaysPuzzle(): KanjiEntry {
  const today = formatDate(new Date()); // "YYYY-MM-DD" in JST
  const entry = puzzleSchedule.find((p) => p.date === today);
  if (entry) return kanjiData[entry.kanjiIndex];
  // Fallback: deterministic hash of date string
  const hash = simpleHash(today);
  return kanjiData[hash % kanjiData.length];
}
```

### Semantic Categories (predefined set of ~20)

```
nature, body, action, emotion, number, time, direction,
building, tool, animal, plant, weather, water, fire, earth,
person, society, language, abstract, measurement
```

Each Joyo kanji is tagged with exactly one primary category.

## UI Wireframe Description

### Page Layout (Mobile-First)

```
+------------------------------------------+
|  漢字カナ―ル        [?] [📊] [⚙]         |
|  #42 - 2026年2月14日                      |
+------------------------------------------+
|                                           |
|  ヒント: 画数 12  読み数 3                 |
|                                           |
+------------------------------------------+
|  部首 | 画数 | 学年 | 音読み | 意味       |
|  ---- | ---- | ---- | ------ | ----       |
|  🟨   | ⬜   | 🟩   | ⬜     | 🟨        |  ← Row 1 (guess: 海)
|  🟩   | 🟨   | 🟩   | 🟨     | 🟩        |  ← Row 2 (guess: 湖)
|  🟩   | 🟩   | 🟩   | 🟩     | 🟩        |  ← Row 3 (guess: 湾) ✓
|       |      |      |        |            |
|       |      |      |        |            |
|       |      |      |        |            |
+------------------------------------------+
|                                           |
|  漢字を入力:  [        ] [送信]            |
|                                           |
+------------------------------------------+
|  AI実験サイト - コンテンツはAIが生成       |
+------------------------------------------+
```

### Result Modal (after win/loss)

```
+------------------------------------------+
|          🎉 正解!                         |
|                                           |
|     答え: 湾 (ワン / わん)                |
|     意味: bay, gulf                       |
|     例: 湾岸、東京湾                      |
|                                           |
|     3/6 で正解しました!                   |
|                                           |
|  [結果をコピー]  [Xでシェア]              |
|                                           |
|  [統計を見る]                             |
+------------------------------------------+
```

### Statistics Modal

```
+------------------------------------------+
|          📊 統計                          |
|                                           |
|  プレイ回数: 42    勝率: 89%              |
|  現在の連勝: 7     最長連勝: 15           |
|                                           |
|  推測回数の分布:                          |
|  1: ██ 2                                 |
|  2: ████████ 8                           |
|  3: ████████████████ 15                  |
|  4: ██████████ 9                         |
|  5: ██████ 5                             |
|  6: ███ 3                                |
|                                           |
|  [閉じる]                                |
+------------------------------------------+
```

### How-to-Play Modal

```
+------------------------------------------+
|          ❓ 遊び方                        |
|                                           |
|  毎日1つの漢字を当てるゲームです。        |
|  6回以内に正解を見つけましょう。          |
|                                           |
|  漢字を入力すると、5つの属性について      |
|  フィードバックが表示されます:            |
|                                           |
|  🟩 = 一致                               |
|  🟨 = 近い                               |
|  ⬜ = 不一致                              |
|                                           |
|  属性: 部首 / 画数 / 学年 / 音読み / 意味 |
|                                           |
|  [閉じる]                                |
+------------------------------------------+
```

## Components Architecture

### React Components

```
src/
├── app/
│   └── games/
│       └── kanji-kanaru/
│           ├── page.tsx              # SSG page with metadata
│           ├── layout.tsx            # Game-specific layout
│           ├── opengraph-image.tsx   # OG image generation (Next.js built-in)
│           └── __tests__/
│               ├── page.test.tsx
│               └── components/
│                   ├── GameBoard.test.tsx
│                   ├── GuessInput.test.tsx
│                   ├── ResultModal.test.tsx
│                   └── StatsModal.test.tsx
├── components/
│   └── games/
│       └── kanji-kanaru/
│           ├── GameBoard.tsx         # Main game grid (guesses + feedback)
│           ├── GuessRow.tsx          # Single row of feedback cells
│           ├── FeedbackCell.tsx      # Single colored cell (green/yellow/gray)
│           ├── GuessInput.tsx        # Kanji input field + submit button
│           ├── GameHeader.tsx        # Title, day number, icon buttons
│           ├── HintBar.tsx           # Shows initial hints (stroke count, reading count)
│           ├── ResultModal.tsx       # Win/loss result with share buttons
│           ├── StatsModal.tsx        # Statistics histogram
│           ├── HowToPlayModal.tsx    # Rules explanation
│           ├── ShareButtons.tsx      # Copy + Twitter share buttons
│           └── GameContainer.tsx     # Top-level client component orchestrating game state
├── lib/
│   └── games/
│       └── kanji-kanaru/
│           ├── engine.ts            # Core game logic (compare, evaluate, score)
│           ├── daily.ts             # Daily puzzle selection (date -> kanji)
│           ├── storage.ts           # localStorage read/write for stats/history
│           ├── share.ts             # Generate share text, clipboard, Twitter URL
│           ├── categories.ts        # Semantic category definitions and relations
│           └── types.ts             # TypeScript type definitions
├── data/
│   ├── kanji-data.json              # Full Joyo kanji dataset
│   └── puzzle-schedule.json         # 365-day puzzle schedule
└── scripts/
    └── generate-puzzle-schedule.ts   # Script to generate puzzle-schedule.json
```

## Detailed File Specifications

### `src/lib/games/kanji-kanaru/types.ts`

```typescript
export interface KanjiEntry {
  character: string;
  radical: string;
  radicalGroup: number;
  strokeCount: number;
  grade: number; // 1-6, 7=secondary, 8=jinmeiyo
  onYomi: string[];
  kunYomi: string[];
  category: SemanticCategory;
  examples: string[];
}

export type SemanticCategory =
  | "nature"
  | "body"
  | "action"
  | "emotion"
  | "number"
  | "time"
  | "direction"
  | "building"
  | "tool"
  | "animal"
  | "plant"
  | "weather"
  | "water"
  | "fire"
  | "earth"
  | "person"
  | "society"
  | "language"
  | "abstract"
  | "measurement";

export type FeedbackLevel = "correct" | "close" | "wrong";

export interface GuessFeedback {
  guess: string;
  radical: FeedbackLevel;
  strokeCount: FeedbackLevel;
  grade: FeedbackLevel;
  onYomi: FeedbackLevel;
  category: FeedbackLevel;
}

export interface GameState {
  puzzleDate: string; // "YYYY-MM-DD"
  puzzleNumber: number;
  targetKanji: KanjiEntry;
  guesses: GuessFeedback[];
  status: "playing" | "won" | "lost";
}

export interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: [number, number, number, number, number, number]; // index 0 = solved in 1, etc.
  lastPlayedDate: string | null;
}

export interface GameHistory {
  [date: string]: {
    guesses: string[];
    status: "won" | "lost";
    guessCount: number;
  };
}
```

### `src/lib/games/kanji-kanaru/engine.ts`

Key functions:

```typescript
export function evaluateGuess(
  guess: KanjiEntry,
  target: KanjiEntry,
): GuessFeedback;
export function isValidKanji(char: string, kanjiData: KanjiEntry[]): boolean;
export function lookupKanji(
  char: string,
  kanjiData: KanjiEntry[],
): KanjiEntry | undefined;
```

**Evaluation logic for each attribute:**

- **radical**: `correct` if same radical; `close` if radicalGroup is within +/-5; otherwise `wrong`.
- **strokeCount**: `correct` if exact; `close` if within +/-2; otherwise `wrong`.
- **grade**: `correct` if exact; `close` if within +/-1; otherwise `wrong`.
- **onYomi**: `correct` if any on'yomi reading matches exactly; `close` if any reading shares the first character (mora); otherwise `wrong`.
- **category**: `correct` if exact match; `close` if categories are in the same "super-group" (defined in `categories.ts`); otherwise `wrong`.

### `src/lib/games/kanji-kanaru/categories.ts`

Define category super-groups for "close" matching:

```typescript
export const categorySuperGroups: Record<string, SemanticCategory[]> = {
  elements: ["water", "fire", "earth", "weather", "nature"],
  living: ["animal", "plant", "body", "person"],
  human: ["emotion", "action", "language", "society"],
  abstract: ["number", "time", "direction", "measurement", "abstract"],
  objects: ["building", "tool"],
};

export function areCategoriesRelated(
  a: SemanticCategory,
  b: SemanticCategory,
): boolean;
```

### `src/lib/games/kanji-kanaru/daily.ts`

```typescript
export function getPuzzleNumber(date: Date): number; // Days since epoch date
export function getTodaysPuzzle(
  kanjiData: KanjiEntry[],
  schedule: PuzzleScheduleEntry[],
): { kanji: KanjiEntry; puzzleNumber: number };
export function formatDateJST(date: Date): string; // "YYYY-MM-DD" in JST
```

The epoch date is **2026-03-01** (launch date). Puzzle #1 is March 1, #2 is March 2, etc.

### `src/lib/games/kanji-kanaru/storage.ts`

```typescript
const STATS_KEY = "kanji-kanaru-stats";
const HISTORY_KEY = "kanji-kanaru-history";

export function loadStats(): GameStats;
export function saveStats(stats: GameStats): void;
export function loadHistory(): GameHistory;
export function saveHistory(history: GameHistory): void;
export function loadTodayGame(date: string): GameHistory[string] | null;
export function saveTodayGame(date: string, game: GameHistory[string]): void;
```

### `src/lib/games/kanji-kanaru/share.ts`

```typescript
export function generateShareText(state: GameState): string;
export function copyToClipboard(text: string): Promise<boolean>;
export function generateTwitterShareUrl(text: string): string;
```

**Share text generation:**

```typescript
function feedbackToEmoji(level: FeedbackLevel): string {
  switch (level) {
    case "correct":
      return "🟩";
    case "close":
      return "🟨";
    case "wrong":
      return "⬜";
  }
}

function generateShareText(state: GameState): string {
  const result = state.status === "won" ? `${state.guesses.length}/6` : "X/6";
  const rows = state.guesses.map((g) =>
    [g.radical, g.strokeCount, g.grade, g.onYomi, g.category]
      .map(feedbackToEmoji)
      .join(""),
  );
  return `漢字カナ―ル #${state.puzzleNumber} ${result}\n${rows.join("\n")}\nhttps://yolo-web.example.com/games/kanji-kanaru`;
}
```

### `src/app/games/kanji-kanaru/page.tsx`

```typescript
// Server component (SSG)
import type { Metadata } from "next";
import { GameContainer } from "@/components/games/kanji-kanaru/GameContainer";

export const metadata: Metadata = {
  title: "漢字カナ―ル - 毎日の漢字パズル | Yolo-Web",
  description: "毎日1つの漢字を当てるパズルゲーム。6回以内に正解を見つけよう！部首・画数・読みなどのヒントを頼りに推理する、新感覚の漢字クイズです。",
  openGraph: {
    title: "漢字カナ―ル - 毎日の漢字パズル",
    description: "毎日1つの漢字を当てるパズルゲーム。部首・画数・読みのヒントで推理しよう！",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "漢字カナ―ル - 毎日の漢字パズル",
    description: "毎日1つの漢字を当てるパズルゲーム。部首・画数・読みのヒントで推理しよう！",
  },
};

export default function KanjiKanaruPage() {
  return (
    <main>
      <GameContainer />
    </main>
  );
}
```

### `src/components/games/kanji-kanaru/GameContainer.tsx`

This is the top-level **client component** (`"use client"`) that:

1. Loads kanji data and puzzle schedule (imported statically from JSON).
2. Determines today's puzzle using `daily.ts`.
3. Loads saved game state from localStorage (if player already started today).
4. Manages game state via `useState` / `useReducer`.
5. Renders child components: `GameHeader`, `HintBar`, `GameBoard`, `GuessInput`, modals.

### `src/app/games/kanji-kanaru/opengraph-image.tsx`

Use Next.js `ImageResponse` API to generate a dynamic OG image showing:

- Game title "漢字カナ―ル"
- Tagline "毎日の漢字パズル"
- Visual representation of the game grid
- Yolo-Web branding

## Kanji Input Handling

### Input Method

Players type kanji using their device's standard IME (Input Method Editor). The input field:

1. Accepts a single character.
2. Validates that the character is a Joyo kanji present in `kanji-data.json`.
3. Shows an error message if the character is not in the dataset.
4. Clears the input after submission.

### Validation

```typescript
function isValidGuess(
  input: string,
  kanjiData: KanjiEntry[],
): { valid: boolean; error?: string } {
  if (input.length !== 1)
    return { valid: false, error: "漢字を1文字入力してください" };
  if (!kanjiData.some((k) => k.character === input))
    return { valid: false, error: "常用漢字ではありません" };
  return { valid: true };
}
```

## Step-by-Step Implementation Plan for Builder

### Phase 1: Data Preparation

**Step 1.1**: Create the kanji dataset file.

- Create `src/data/kanji-data.json` containing all 2,136 Joyo kanji with attributes.
- Source: The builder should use a well-known Joyo kanji list (e.g., from KANJIDIC2 or similar open data) and transform it into the schema defined in `types.ts`.
- Each entry MUST have: `character`, `radical`, `radicalGroup`, `strokeCount`, `grade`, `onYomi`, `kunYomi`, `category`, `examples`.
- The `category` field requires manual/AI-assisted assignment. The builder should write a categorization script or hardcode a mapping from well-known kanji groupings.

**Step 1.2**: Create the puzzle schedule generator script.

- Create `scripts/generate-puzzle-schedule.ts`.
- Uses a seeded PRNG (e.g., simple mulberry32 with seed `0x4B616E6A69` -- hex for "Kanji") to shuffle indices 0-2135.
- Outputs `src/data/puzzle-schedule.json` with 365 entries starting from 2026-03-01.
- Run with: `npx tsx scripts/generate-puzzle-schedule.ts`

**Step 1.3**: Create the semantic categories definition.

- Create `src/lib/games/kanji-kanaru/categories.ts` with the super-group definitions.

### Phase 2: Core Logic

**Step 2.1**: Create type definitions.

- Create `src/lib/games/kanji-kanaru/types.ts` as specified above.

**Step 2.2**: Implement the game engine.

- Create `src/lib/games/kanji-kanaru/engine.ts` with `evaluateGuess`, `isValidKanji`, `lookupKanji`.
- Write comprehensive tests in `src/lib/games/kanji-kanaru/__tests__/engine.test.ts`.

**Step 2.3**: Implement daily puzzle selection.

- Create `src/lib/games/kanji-kanaru/daily.ts`.
- Write tests in `src/lib/games/kanji-kanaru/__tests__/daily.test.ts`.

**Step 2.4**: Implement localStorage persistence.

- Create `src/lib/games/kanji-kanaru/storage.ts`.
- Write tests in `src/lib/games/kanji-kanaru/__tests__/storage.test.ts` (mock localStorage).

**Step 2.5**: Implement share text generation.

- Create `src/lib/games/kanji-kanaru/share.ts`.
- Write tests in `src/lib/games/kanji-kanaru/__tests__/share.test.ts`.

### Phase 3: UI Components

**Step 3.1**: Create the feedback cell component.

- `src/components/games/kanji-kanaru/FeedbackCell.tsx`
- Props: `feedback: FeedbackLevel`, `label: string`
- Renders a colored square with appropriate background color and ARIA label.

**Step 3.2**: Create the guess row component.

- `src/components/games/kanji-kanaru/GuessRow.tsx`
- Props: `feedback: GuessFeedback | null`, `columns: string[]`
- Renders 5 FeedbackCells in a row, plus the guessed kanji character.

**Step 3.3**: Create the game board.

- `src/components/games/kanji-kanaru/GameBoard.tsx`
- Props: `guesses: GuessFeedback[]`, `maxGuesses: 6`
- Renders 6 GuessRows (filled + empty).
- Column headers: 部首 | 画数 | 学年 | 音読み | 意味

**Step 3.4**: Create the guess input.

- `src/components/games/kanji-kanaru/GuessInput.tsx`
- Single character input field + submit button.
- Validates input on submit.
- Disabled when game is over.

**Step 3.5**: Create the hint bar.

- `src/components/games/kanji-kanaru/HintBar.tsx`
- Shows stroke count and number of readings for the target kanji.

**Step 3.6**: Create the game header.

- `src/components/games/kanji-kanaru/GameHeader.tsx`
- Title, puzzle number, date, and icon buttons for help/stats/settings.

**Step 3.7**: Create modals.

- `src/components/games/kanji-kanaru/HowToPlayModal.tsx`
- `src/components/games/kanji-kanaru/ResultModal.tsx`
- `src/components/games/kanji-kanaru/StatsModal.tsx`
- Use native `<dialog>` element for accessibility (no external modal library).

**Step 3.8**: Create share buttons.

- `src/components/games/kanji-kanaru/ShareButtons.tsx`
- "Copy result" button using Clipboard API with fallback.
- "Share on X" button opening Twitter intent URL.

**Step 3.9**: Create the game container.

- `src/components/games/kanji-kanaru/GameContainer.tsx`
- `"use client"` directive.
- Orchestrates all state: loads puzzle, manages guesses, handles win/loss, persists to localStorage.
- Shows HowToPlay modal on first visit (check localStorage flag).

### Phase 4: Page & SEO

**Step 4.1**: Create the game page.

- `src/app/games/kanji-kanaru/page.tsx` (server component, SSG).
- Metadata with Japanese title, description, OGP tags.
- Renders `<GameContainer />`.

**Step 4.2**: Create the game layout.

- `src/app/games/kanji-kanaru/layout.tsx`
- Minimal layout wrapper. Includes AI experiment disclaimer footer.

**Step 4.3**: Create the OG image.

- `src/app/games/kanji-kanaru/opengraph-image.tsx`
- Use Next.js `ImageResponse` to generate a 1200x630 image with game branding.

**Step 4.4**: Create the landing/explanation section.

- Below the game area in the page, add a `<section>` with:
  - Game explanation in Japanese (for SEO crawlers)
  - How to play instructions
  - FAQ
  - AI experiment disclaimer (constitution Rule 3)

### Phase 5: Styling

**Step 5.1**: Create game-specific CSS.

- Use CSS Modules: `src/components/games/kanji-kanaru/styles/KanjiKanaru.module.css`
- Mobile-first responsive design.
- Color scheme: Use CSS custom properties for the 3 feedback colors.
  - `--color-correct`: #6aaa64 (green)
  - `--color-close`: #c9b458 (yellow)
  - `--color-wrong`: #787c7e (gray)
  - `--color-bg`: #ffffff (light) / adapt for dark mode via `prefers-color-scheme`
- Grid layout for the game board.
- Animations: Flip animation on reveal (CSS `@keyframes`), shake on invalid input.

### Phase 6: Testing

**Step 6.1**: Unit tests for all `lib/` modules.

- `engine.test.ts`: Test all feedback evaluation logic, edge cases.
- `daily.test.ts`: Test date-to-puzzle mapping, JST handling.
- `storage.test.ts`: Test localStorage read/write with mocks.
- `share.test.ts`: Test share text generation for win/loss cases.
- `categories.test.ts`: Test category relationship logic.

**Step 6.2**: Component tests.

- `src/app/games/kanji-kanaru/__tests__/page.test.tsx`: Test page renders.
- `src/app/games/kanji-kanaru/__tests__/components/GameBoard.test.tsx`: Test grid rendering.
- `src/app/games/kanji-kanaru/__tests__/components/GuessInput.test.tsx`: Test input validation.
- `src/app/games/kanji-kanaru/__tests__/components/ResultModal.test.tsx`: Test result display.
- `src/app/games/kanji-kanaru/__tests__/components/StatsModal.test.tsx`: Test stats rendering.

### Phase 7: Integration & Verification

**Step 7.1**: Run all checks.

```bash
npm run typecheck
npm run lint
npm test
npm run format:check
npm run build
```

**Step 7.2**: Manual verification checklist.

- Game loads with today's puzzle.
- Entering a valid kanji shows feedback.
- Entering an invalid character shows error.
- Winning shows result modal with correct share text.
- Losing after 6 guesses shows result modal.
- Copy button copies to clipboard.
- X share button opens Twitter with pre-filled text.
- Statistics update correctly after each game.
- Streak tracking works across days.
- Page refreshes preserve game state for today.
- Mobile layout is usable at 320px width.
- AI disclaimer is visible.

## Required npm Packages

**None.** The implementation uses only:

- Next.js (already installed) -- App Router, SSG, ImageResponse API
- React (already installed) -- state management, components
- TypeScript (already installed) -- type safety

No additional npm packages are required. All game logic, animations, and UI use built-in browser APIs and CSS.

## Key Algorithms Summary

| Algorithm                  | Location                              | Description                                                                    |
| -------------------------- | ------------------------------------- | ------------------------------------------------------------------------------ |
| Guess evaluation           | `engine.ts`                           | Compares guess kanji to target on 5 attributes, returns FeedbackLevel for each |
| Daily puzzle selection     | `daily.ts`                            | Maps today's date (JST) to a puzzle index via schedule JSON with hash fallback |
| Puzzle schedule generation | `scripts/generate-puzzle-schedule.ts` | Seeded PRNG shuffle of 2136 kanji indices, outputs 365 date-index pairs        |
| Share text generation      | `share.ts`                            | Maps GuessFeedback[] to emoji grid string with header and URL                  |
| Streak calculation         | `storage.ts`                          | Checks consecutive dates in history, updates current/max streak                |
| Category relatedness       | `categories.ts`                       | Checks if two categories share a super-group                                   |

## Acceptance Criteria

- [ ] Game page accessible at `/games/kanji-kanaru`
- [ ] Daily puzzle is deterministic (same kanji for all players on same date)
- [ ] Puzzle changes at midnight JST
- [ ] Player can enter kanji guesses and receive 5-attribute colored feedback
- [ ] Game ends after correct guess or 6 failed attempts
- [ ] Result modal shows answer, readings, meaning, and example compounds
- [ ] Share text is generated in the specified emoji format
- [ ] Copy-to-clipboard button works (with fallback)
- [ ] X/Twitter share button opens intent with pre-filled text
- [ ] Statistics modal shows: games played, win rate, current streak, max streak, guess distribution histogram
- [ ] Game state persists in localStorage (refresh-safe)
- [ ] Streak tracking works correctly across consecutive days
- [ ] First-time visitors see How-to-Play modal
- [ ] Proper Next.js metadata (title, description, OGP) in Japanese
- [ ] OG image is generated for social sharing
- [ ] AI experiment disclaimer is visible on the page (constitution Rule 3)
- [ ] Mobile-first responsive design (usable at 320px width)
- [ ] `prefers-color-scheme` media query for dark/light adaptation
- [ ] All TypeScript types are strict (no `any`)
- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] `npm test` passes (all unit + component tests)
- [ ] `npm run format:check` passes
- [ ] `npm run build` succeeds
- [ ] No additional npm dependencies added
- [ ] Kanji dataset contains all 2,136 Joyo kanji with complete attributes
- [ ] At least 365 days of puzzles pre-generated

## Rollback Approach

All game files are isolated under:

- `src/app/games/kanji-kanaru/`
- `src/components/games/kanji-kanaru/`
- `src/lib/games/kanji-kanaru/`
- `src/data/kanji-data.json`
- `src/data/puzzle-schedule.json`
- `scripts/generate-puzzle-schedule.ts`

No existing files are modified (except potentially adding a link from the homepage, which is a one-line change). Rollback is a simple `git revert` of the commits or deletion of these directories.

## Constraints

- Must comply with `docs/constitution.md` (immutable).
- No database or server-side state -- all client-side.
- No user accounts or authentication.
- No additional npm dependencies.
- All content in Japanese (code comments in English per existing codebase convention).
- The site URL in share text should use the actual deployed domain (TBD; use placeholder for now).

## Notes

- **Kanji data quality is critical.** The builder should validate the dataset thoroughly. Incorrect radical assignments or missing readings will break the game logic.
- **The 2,136 Joyo kanji dataset is large (~500KB as JSON).** Consider whether to split it or lazy-load. Since the game needs the full dataset for input validation, loading it upfront in the client component is acceptable. Next.js will bundle it efficiently.
- **JST timezone handling**: Use `Intl.DateTimeFormat` with `timeZone: "Asia/Tokyo"` to ensure the puzzle changes at midnight JST regardless of the user's local timezone.
- **Accessibility**: Use ARIA labels for feedback cells (e.g., "部首: 一致", "画数: 近い"). Use semantic HTML. Ensure keyboard navigation works.
- **Future enhancements** (not in scope for this plan): Hard mode, hint system, kanji of the day educational content, leaderboards, additional puzzle modes.
