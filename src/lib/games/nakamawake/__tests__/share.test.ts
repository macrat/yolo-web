import { describe, test, expect, vi, beforeEach } from "vitest";
import { generateShareText, generateTwitterShareUrl } from "../share";
import type { NakamawakeGameState, NakamawakePuzzle } from "../types";

const samplePuzzle: NakamawakePuzzle = {
  groups: [
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
  ],
};

beforeEach(() => {
  // Mock window.location.origin
  vi.stubGlobal("window", {
    location: { origin: "https://example.com" },
  });
});

describe("generateShareText", () => {
  test("generates correct text for a won game with no mistakes", () => {
    const state: NakamawakeGameState = {
      puzzleDate: "2026-03-01",
      puzzleNumber: 1,
      puzzle: samplePuzzle,
      solvedGroups: [...samplePuzzle.groups],
      mistakes: 0,
      status: "won",
      selectedWords: [],
      remainingWords: [],
      guessHistory: [
        {
          words: [
            "\u308A\u3093\u3054",
            "\u307F\u304B\u3093",
            "\u3076\u3069\u3046",
            "\u3082\u3082",
          ],
          correct: true,
        },
        {
          words: [
            "\u3044\u306C",
            "\u306D\u3053",
            "\u3046\u3055\u304E",
            "\u304F\u307E",
          ],
          correct: true,
        },
        {
          words: [
            "\u3042\u304B",
            "\u3042\u304A",
            "\u304D\u3044\u308D",
            "\u307F\u3069\u308A",
          ],
          correct: true,
        },
        {
          words: [
            "\u306F\u308B",
            "\u306A\u3064",
            "\u3042\u304D",
            "\u3075\u3086",
          ],
          correct: true,
        },
      ],
    };

    const text = generateShareText(state);
    expect(text).toContain(
      "\u30CA\u30AB\u30DE\u30EF\u30B1 #1 \u30D1\u30FC\u30D5\u30A7\u30AF\u30C8!",
    );
    // Row 1: difficulty 1 (yellow)
    expect(text).toContain("\u{1F7E8}\u{1F7E8}\u{1F7E8}\u{1F7E8}");
    // Row 2: difficulty 2 (green)
    expect(text).toContain("\u{1F7E9}\u{1F7E9}\u{1F7E9}\u{1F7E9}");
    // Row 3: difficulty 3 (blue)
    expect(text).toContain("\u{1F7E6}\u{1F7E6}\u{1F7E6}\u{1F7E6}");
    // Row 4: difficulty 4 (purple)
    expect(text).toContain("\u{1F7EA}\u{1F7EA}\u{1F7EA}\u{1F7EA}");
    expect(text).toContain("https://example.com/games/nakamawake");
  });

  test("generates correct text for a won game with mistakes", () => {
    const state: NakamawakeGameState = {
      puzzleDate: "2026-03-01",
      puzzleNumber: 42,
      puzzle: samplePuzzle,
      solvedGroups: [...samplePuzzle.groups],
      mistakes: 2,
      status: "won",
      selectedWords: [],
      remainingWords: [],
      guessHistory: [
        {
          words: [
            "\u308A\u3093\u3054",
            "\u307F\u304B\u3093",
            "\u3076\u3069\u3046",
            "\u3044\u306C",
          ],
          correct: false,
        },
        {
          words: [
            "\u308A\u3093\u3054",
            "\u307F\u304B\u3093",
            "\u3076\u3069\u3046",
            "\u306D\u3053",
          ],
          correct: false,
        },
        {
          words: [
            "\u308A\u3093\u3054",
            "\u307F\u304B\u3093",
            "\u3076\u3069\u3046",
            "\u3082\u3082",
          ],
          correct: true,
        },
        {
          words: [
            "\u3044\u306C",
            "\u306D\u3053",
            "\u3046\u3055\u304E",
            "\u304F\u307E",
          ],
          correct: true,
        },
        {
          words: [
            "\u3042\u304B",
            "\u3042\u304A",
            "\u304D\u3044\u308D",
            "\u307F\u3069\u308A",
          ],
          correct: true,
        },
        {
          words: [
            "\u306F\u308B",
            "\u306A\u3064",
            "\u3042\u304D",
            "\u3075\u3086",
          ],
          correct: true,
        },
      ],
    };

    const text = generateShareText(state);
    expect(text).toContain(
      "\u30CA\u30AB\u30DE\u30EF\u30B1 #42 \u30DF\u30B92\u56DE",
    );
  });

  test("generates correct text for a lost game", () => {
    const state: NakamawakeGameState = {
      puzzleDate: "2026-03-01",
      puzzleNumber: 10,
      puzzle: samplePuzzle,
      solvedGroups: [samplePuzzle.groups[0]],
      mistakes: 4,
      status: "lost",
      selectedWords: [],
      remainingWords: [],
      guessHistory: [
        {
          words: [
            "\u308A\u3093\u3054",
            "\u307F\u304B\u3093",
            "\u3076\u3069\u3046",
            "\u3082\u3082",
          ],
          correct: true,
        },
        {
          words: [
            "\u3044\u306C",
            "\u306D\u3053",
            "\u3042\u304B",
            "\u306F\u308B",
          ],
          correct: false,
        },
        {
          words: [
            "\u3044\u306C",
            "\u306D\u3053",
            "\u3042\u304A",
            "\u306A\u3064",
          ],
          correct: false,
        },
        {
          words: [
            "\u3044\u306C",
            "\u306D\u3053",
            "\u304D\u3044\u308D",
            "\u3042\u304D",
          ],
          correct: false,
        },
        {
          words: [
            "\u3044\u306C",
            "\u306D\u3053",
            "\u307F\u3069\u308A",
            "\u3075\u3086",
          ],
          correct: false,
        },
      ],
    };

    const text = generateShareText(state);
    expect(text).toContain("\u30CA\u30AB\u30DE\u30EF\u30B1 #10 X");
    // Only 1 correct row (fruits, difficulty 1)
    expect(text).toContain("\u{1F7E8}\u{1F7E8}\u{1F7E8}\u{1F7E8}");
  });

  test("includes puzzle number in header", () => {
    const state: NakamawakeGameState = {
      puzzleDate: "2026-03-15",
      puzzleNumber: 15,
      puzzle: samplePuzzle,
      solvedGroups: [...samplePuzzle.groups],
      mistakes: 1,
      status: "won",
      selectedWords: [],
      remainingWords: [],
      guessHistory: [
        {
          words: [
            "\u308A\u3093\u3054",
            "\u307F\u304B\u3093",
            "\u3076\u3069\u3046",
            "\u3044\u306C",
          ],
          correct: false,
        },
        {
          words: [
            "\u308A\u3093\u3054",
            "\u307F\u304B\u3093",
            "\u3076\u3069\u3046",
            "\u3082\u3082",
          ],
          correct: true,
        },
        {
          words: [
            "\u3044\u306C",
            "\u306D\u3053",
            "\u3046\u3055\u304E",
            "\u304F\u307E",
          ],
          correct: true,
        },
        {
          words: [
            "\u3042\u304B",
            "\u3042\u304A",
            "\u304D\u3044\u308D",
            "\u307F\u3069\u308A",
          ],
          correct: true,
        },
        {
          words: [
            "\u306F\u308B",
            "\u306A\u3064",
            "\u3042\u304D",
            "\u3075\u3086",
          ],
          correct: true,
        },
      ],
    };

    const text = generateShareText(state);
    expect(text).toContain(
      "\u30CA\u30AB\u30DE\u30EF\u30B1 #15 \u30DF\u30B91\u56DE",
    );
  });
});

describe("generateTwitterShareUrl", () => {
  test("generates correct Twitter intent URL without pageUrl", () => {
    const text = "Test share text";
    const url = generateTwitterShareUrl(text);
    expect(url).toBe(
      "https://twitter.com/intent/tweet?text=Test%20share%20text",
    );
  });

  test("separates text and url when pageUrl is provided", () => {
    const pageUrl = "https://example.com/games/nakamawake";
    const text = `\u30CA\u30AB\u30DE\u30EF\u30B1 #1 \u30D1\u30FC\u30D5\u30A7\u30AF\u30C8!\n\u{1F7E8}\u{1F7E8}\u{1F7E8}\u{1F7E8}\n${pageUrl}`;
    const url = generateTwitterShareUrl(text, pageUrl);
    // text param should not contain the page URL
    expect(url).toContain(
      `text=${encodeURIComponent("\u30CA\u30AB\u30DE\u30EF\u30B1 #1 \u30D1\u30FC\u30D5\u30A7\u30AF\u30C8!\n\u{1F7E8}\u{1F7E8}\u{1F7E8}\u{1F7E8}")}`,
    );
    // url param should contain the page URL
    expect(url).toContain(`&url=${encodeURIComponent(pageUrl)}`);
  });

  test("encodes special characters without pageUrl", () => {
    const text =
      "\u30CA\u30AB\u30DE\u30EF\u30B1 #1 \u30D1\u30FC\u30D5\u30A7\u30AF\u30C8!\nhttps://example.com";
    const url = generateTwitterShareUrl(text);
    expect(url).toContain("https://twitter.com/intent/tweet?text=");
    // Should be properly encoded
    expect(url).toContain(encodeURIComponent(text));
  });
});
