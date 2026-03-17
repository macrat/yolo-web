import { describe, test, expect } from "vitest";
import {
  checkGuess,
  isOneAway,
  shuffleArray,
  getAllWords,
  getDifficultyColor,
  getDifficultyEmoji,
} from "../engine";
import type { NakamawakePuzzle, NakamawakeGroup } from "../types";

const sampleGroups: [
  NakamawakeGroup,
  NakamawakeGroup,
  NakamawakeGroup,
  NakamawakeGroup,
] = [
  {
    name: "\u679C\u7269",
    words: [
      "\u308A\u3093\u3054",
      "\u307F\u304B\u3093",
      "\u3076\u3069\u3046",
      "\u3082\u3082",
    ],
    difficulty: 1,
  },
  {
    name: "\u52D5\u7269",
    words: [
      "\u3044\u306C",
      "\u306D\u3053",
      "\u3046\u3055\u304E",
      "\u304F\u307E",
    ],
    difficulty: 2,
  },
  {
    name: "\u8272",
    words: [
      "\u3042\u304B",
      "\u3042\u304A",
      "\u304D\u3044\u308D",
      "\u307F\u3069\u308A",
    ],
    difficulty: 3,
  },
  {
    name: "\u5B63\u7BC0",
    words: ["\u306F\u308B", "\u306A\u3064", "\u3042\u304D", "\u3075\u3086"],
    difficulty: 4,
  },
];

const samplePuzzle: NakamawakePuzzle = { groups: sampleGroups };

describe("checkGuess", () => {
  test("returns the matching group for a correct guess", () => {
    const result = checkGuess(
      [
        "\u308A\u3093\u3054",
        "\u307F\u304B\u3093",
        "\u3076\u3069\u3046",
        "\u3082\u3082",
      ],
      samplePuzzle,
      [],
    );
    expect(result).not.toBeNull();
    expect(result!.name).toBe("\u679C\u7269");
    expect(result!.difficulty).toBe(1);
  });

  test("returns the matching group regardless of word order", () => {
    const result = checkGuess(
      [
        "\u3082\u3082",
        "\u3076\u3069\u3046",
        "\u308A\u3093\u3054",
        "\u307F\u304B\u3093",
      ],
      samplePuzzle,
      [],
    );
    expect(result).not.toBeNull();
    expect(result!.name).toBe("\u679C\u7269");
  });

  test("returns null for an incorrect guess", () => {
    const result = checkGuess(
      [
        "\u308A\u3093\u3054",
        "\u307F\u304B\u3093",
        "\u3076\u3069\u3046",
        "\u3044\u306C",
      ],
      samplePuzzle,
      [],
    );
    expect(result).toBeNull();
  });

  test("skips already-solved groups", () => {
    const solved: NakamawakeGroup[] = [sampleGroups[0]];
    const result = checkGuess(
      [
        "\u308A\u3093\u3054",
        "\u307F\u304B\u3093",
        "\u3076\u3069\u3046",
        "\u3082\u3082",
      ],
      samplePuzzle,
      solved,
    );
    expect(result).toBeNull();
  });

  test("returns null when fewer than 4 words are selected", () => {
    const result = checkGuess(
      ["\u308A\u3093\u3054", "\u307F\u304B\u3093", "\u3076\u3069\u3046"],
      samplePuzzle,
      [],
    );
    expect(result).toBeNull();
  });

  test("returns null when more than 4 words are selected", () => {
    const result = checkGuess(
      [
        "\u308A\u3093\u3054",
        "\u307F\u304B\u3093",
        "\u3076\u3069\u3046",
        "\u3082\u3082",
        "\u3044\u306C",
      ],
      samplePuzzle,
      [],
    );
    expect(result).toBeNull();
  });
});

describe("isOneAway", () => {
  test("returns true when exactly 3 of 4 words match an unsolved group", () => {
    // 3 from fruits + 1 from animals
    const result = isOneAway(
      [
        "\u308A\u3093\u3054",
        "\u307F\u304B\u3093",
        "\u3076\u3069\u3046",
        "\u3044\u306C",
      ],
      samplePuzzle,
      [],
    );
    expect(result).toBe(true);
  });

  test("returns false when all 4 words match (exact match, not one away)", () => {
    const result = isOneAway(
      [
        "\u308A\u3093\u3054",
        "\u307F\u304B\u3093",
        "\u3076\u3069\u3046",
        "\u3082\u3082",
      ],
      samplePuzzle,
      [],
    );
    expect(result).toBe(false);
  });

  test("returns false when only 2 words match any group", () => {
    const result = isOneAway(
      [
        "\u308A\u3093\u3054",
        "\u307F\u304B\u3093",
        "\u3044\u306C",
        "\u306D\u3053",
      ],
      samplePuzzle,
      [],
    );
    expect(result).toBe(false);
  });

  test("returns false when fewer than 4 words are selected", () => {
    const result = isOneAway(
      ["\u308A\u3093\u3054", "\u307F\u304B\u3093", "\u3076\u3069\u3046"],
      samplePuzzle,
      [],
    );
    expect(result).toBe(false);
  });

  test("skips already-solved groups", () => {
    const solved: NakamawakeGroup[] = [sampleGroups[0]];
    const result = isOneAway(
      [
        "\u308A\u3093\u3054",
        "\u307F\u304B\u3093",
        "\u3076\u3069\u3046",
        "\u3044\u306C",
      ],
      samplePuzzle,
      solved,
    );
    expect(result).toBe(false);
  });
});

describe("shuffleArray", () => {
  test("returns an array of the same length", () => {
    const arr = [1, 2, 3, 4, 5];
    const shuffled = shuffleArray(arr);
    expect(shuffled).toHaveLength(arr.length);
  });

  test("returns a new array (does not mutate original)", () => {
    const arr = [1, 2, 3, 4, 5];
    const shuffled = shuffleArray(arr);
    expect(shuffled).not.toBe(arr);
    expect(arr).toEqual([1, 2, 3, 4, 5]);
  });

  test("contains the same elements", () => {
    const arr = [1, 2, 3, 4, 5];
    const shuffled = shuffleArray(arr);
    expect(shuffled.sort()).toEqual(arr.sort());
  });

  test("handles empty array", () => {
    const shuffled = shuffleArray([]);
    expect(shuffled).toEqual([]);
  });

  test("handles single-element array", () => {
    const shuffled = shuffleArray([42]);
    expect(shuffled).toEqual([42]);
  });
});

describe("getAllWords", () => {
  test("returns all 16 words from a puzzle", () => {
    const words = getAllWords(samplePuzzle);
    expect(words).toHaveLength(16);
  });

  test("contains all words from all groups", () => {
    const words = getAllWords(samplePuzzle);
    for (const group of samplePuzzle.groups) {
      for (const word of group.words) {
        expect(words).toContain(word);
      }
    }
  });
});

describe("getDifficultyColor", () => {
  test("returns yellow for difficulty 1", () => {
    expect(getDifficultyColor(1)).toBe("yellow");
  });

  test("returns green for difficulty 2", () => {
    expect(getDifficultyColor(2)).toBe("green");
  });

  test("returns blue for difficulty 3", () => {
    expect(getDifficultyColor(3)).toBe("blue");
  });

  test("returns purple for difficulty 4", () => {
    expect(getDifficultyColor(4)).toBe("purple");
  });
});

describe("getDifficultyEmoji", () => {
  test("returns yellow square for difficulty 1", () => {
    expect(getDifficultyEmoji(1)).toBe("\u{1F7E8}");
  });

  test("returns green square for difficulty 2", () => {
    expect(getDifficultyEmoji(2)).toBe("\u{1F7E9}");
  });

  test("returns blue square for difficulty 3", () => {
    expect(getDifficultyEmoji(3)).toBe("\u{1F7E6}");
  });

  test("returns purple square for difficulty 4", () => {
    expect(getDifficultyEmoji(4)).toBe("\u{1F7EA}");
  });
});
