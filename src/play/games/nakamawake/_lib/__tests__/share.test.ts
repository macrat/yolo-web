import { describe, test, expect } from "vitest";
import { generateShareText } from "../share";
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
    expect(text).toBe(
      [
        "ナカマワケ #1 4組すべて正解（間違い0回）",
        "当てた順（難易度）: 1→2→3→4",
        "#ナカマワケ #yolosnet",
      ].join("\n"),
    );
    // 絵文字を持たない
    expect(text).not.toMatch(/\p{Extended_Pictographic}/u);
    expect(text.split("\n").at(-1)).toBe(
      "#\u30CA\u30AB\u30DE\u30EF\u30B1 #yolosnet",
    );
    expect(text).not.toContain("http");
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

    expect(generateShareText(state).split("\n")[0]).toBe(
      "ナカマワケ #42 4組すべて正解（間違い2回）",
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

    // 当てた1組（難易度1）だけを並べる
    expect(generateShareText(state)).toBe(
      [
        "ナカマワケ #10 4回間違えて終了（1組正解）",
        "当てた順（難易度）: 1",
        "#ナカマワケ #yolosnet",
      ].join("\n"),
    );
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

    expect(generateShareText(state).split("\n")[0]).toBe(
      "ナカマワケ #15 4組すべて正解（間違い1回）",
    );
  });
});

describe("generateShareText solve order", () => {
  test("lists the solved groups' difficulty in the order they were solved", () => {
    const [easy, medium, hard, hardest] = samplePuzzle.groups;
    const state: NakamawakeGameState = {
      puzzleDate: "2026-03-01",
      puzzleNumber: 226,
      puzzle: samplePuzzle,
      solvedGroups: [easy, hard, medium, hardest],
      mistakes: 1,
      status: "won",
      selectedWords: [],
      remainingWords: [],
      guessHistory: [],
    };

    expect(generateShareText(state).split("\n")[1]).toBe(
      "当てた順（難易度）: 1→3→2→4",
    );
  });

  test("does not use wording that is not on the screen", () => {
    const state: NakamawakeGameState = {
      puzzleDate: "2026-03-01",
      puzzleNumber: 226,
      puzzle: samplePuzzle,
      solvedGroups: [samplePuzzle.groups[1]],
      mistakes: 4,
      status: "lost",
      selectedWords: [],
      remainingWords: [],
      guessHistory: [],
    };

    const text = generateShareText(state);
    expect(text).not.toMatch(/\bX\b/);
    expect(text).not.toContain("パーフェクト");
  });
});

describe("generateShareText with no solved group", () => {
  test("has no order line and no empty line", () => {
    const state: NakamawakeGameState = {
      puzzleDate: "2026-03-01",
      puzzleNumber: 7,
      puzzle: samplePuzzle,
      solvedGroups: [],
      mistakes: 4,
      status: "lost",
      selectedWords: [],
      remainingWords: [],
      guessHistory: [
        {
          words: ["いぬ", "ねこ", "あか", "はる"],
          correct: false,
        },
      ],
    };

    expect(generateShareText(state)).toBe(
      "ナカマワケ #7 4回間違えて終了（0組正解）\n#ナカマワケ #yolosnet",
    );
  });
});
