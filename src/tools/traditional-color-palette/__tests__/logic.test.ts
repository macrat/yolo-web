import { describe, test, expect } from "vitest";
import type { ColorEntry } from "@/dictionary/_lib/types";
import {
  hueDistance,
  findNearestColor,
  computeHarmony,
  isAchromatic,
  getAchromaticPalette,
  filterColors,
  filterByCategory,
} from "../logic";

// --- テスト用モックデータ ---

/** 有彩色のモックデータ */
const mockChromatic: ColorEntry[] = [
  {
    slug: "toki",
    name: "鴇",
    romaji: "toki",
    hex: "#eea9a9",
    rgb: [238, 169, 169],
    hsl: [0, 67, 80],
    category: "red",
  },
  {
    slug: "aotake",
    name: "青竹",
    romaji: "aotake",
    hex: "#268785",
    rgb: [38, 135, 133],
    hsl: [179, 56, 34],
    category: "blue",
  },
  {
    slug: "tsuyukusa",
    name: "露草",
    romaji: "tsuyukusa",
    hex: "#38a1db",
    rgb: [56, 161, 219],
    hsl: [201, 67, 54],
    category: "blue",
  },
  {
    slug: "fuji",
    name: "藤",
    romaji: "fuji",
    hex: "#bbbcde",
    rgb: [187, 188, 222],
    hsl: [238, 33, 80],
    category: "purple",
  },
  {
    slug: "yamabuki",
    name: "山吹",
    romaji: "yamabuki",
    hex: "#f8b500",
    rgb: [248, 181, 0],
    hsl: [44, 100, 49],
    category: "yellow",
  },
  {
    slug: "wasurenagusa",
    name: "勿忘草",
    romaji: "wasurenagusa",
    hex: "#89c3eb",
    rgb: [137, 195, 235],
    hsl: [205, 71, 73],
    category: "blue",
  },
  {
    slug: "tokiwa",
    name: "常磐",
    romaji: "tokiwa",
    hex: "#007b43",
    rgb: [0, 123, 67],
    hsl: [153, 100, 24],
    category: "green",
  },
  {
    slug: "sumire",
    name: "菫",
    romaji: "sumire",
    hex: "#7058a3",
    rgb: [112, 88, 163],
    hsl: [259, 30, 49],
    category: "purple",
  },
  {
    slug: "sakura",
    name: "桜",
    romaji: "sakura",
    hex: "#fef4f4",
    rgb: [254, 244, 244],
    hsl: [0, 77, 98],
    category: "red",
  },
  {
    slug: "moegi",
    name: "萌黄",
    romaji: "moegi",
    hex: "#aacf53",
    rgb: [170, 207, 83],
    hsl: [78, 56, 57],
    category: "green",
  },
  {
    slug: "benihi",
    name: "紅緋",
    romaji: "benihi",
    hex: "#e83929",
    rgb: [232, 57, 41],
    hsl: [5, 80, 54],
    category: "red",
  },
];

/** 無彩色のモックデータ */
const mockAchromatic: ColorEntry[] = [
  {
    slug: "kuro",
    name: "黒",
    romaji: "kuro",
    hex: "#080808",
    rgb: [8, 8, 8],
    hsl: [0, 0, 3],
    category: "achromatic",
  },
  {
    slug: "hai",
    name: "灰",
    romaji: "hai",
    hex: "#828282",
    rgb: [130, 130, 130],
    hsl: [0, 0, 51],
    category: "achromatic",
  },
  {
    slug: "namari",
    name: "鉛",
    romaji: "namari",
    hex: "#787878",
    rgb: [120, 120, 120],
    hsl: [0, 0, 47],
    category: "achromatic",
  },
  {
    slug: "nibi",
    name: "鈍",
    romaji: "nibi",
    hex: "#676767",
    rgb: [103, 103, 103],
    hsl: [120, 1, 40],
    category: "achromatic",
  },
];

/** S=5だがachromatic以外のカテゴリに属する色（境界ケース） */
const mockBorderlineColor: ColorEntry = {
  slug: "shironezumi",
  name: "白鼠",
  romaji: "shironezumi",
  hex: "#b9bdb6",
  rgb: [185, 189, 182],
  hsl: [90, 5, 74],
  category: "green",
};

/** テスト用の全色データ（有彩色 + 無彩色 + 境界色） */
const allMockColors: ColorEntry[] = [
  ...mockChromatic,
  ...mockAchromatic,
  mockBorderlineColor,
];

// --- テスト ---

describe("hueDistance", () => {
  test("同一色相の距離は0", () => {
    expect(hueDistance(0, 0)).toBe(0);
  });

  test("正反対の色相の距離は180", () => {
    expect(hueDistance(0, 180)).toBe(180);
  });

  test("360度ラップアラウンド: hueDistance(10, 350) === 20", () => {
    expect(hueDistance(10, 350)).toBe(20);
  });

  test("逆方向でも同じ: hueDistance(350, 10) === 20", () => {
    expect(hueDistance(350, 10)).toBe(20);
  });

  test("90度の距離", () => {
    expect(hueDistance(0, 90)).toBe(90);
  });

  test("270度は90度として扱われる（短い方）", () => {
    expect(hueDistance(0, 270)).toBe(90);
  });
});

describe("findNearestColor", () => {
  test("正確な色相一致がある場合、その色を返す", () => {
    // 鴇はH=0、targetHue=0で完全一致
    const result = findNearestColor(0, mockChromatic);
    expect(result?.slug).toBe("toki");
  });

  test("最近傍の色が選ばれる", () => {
    // targetHue=180に最も近いのは青竹(H=179)
    const result = findNearestColor(180, mockChromatic);
    expect(result?.slug).toBe("aotake");
  });

  test("excludeSlugsで指定した色は除外される", () => {
    // targetHue=0で鴇(H=0)が最近傍だが、除外指定
    const result = findNearestColor(0, mockChromatic, new Set(["toki"]));
    // 鴇を除外すると、次にH=0に近い色が選ばれる（桜H=0か紅緋H=5）
    expect(result?.slug).not.toBe("toki");
  });

  test("無彩色(category=achromatic)は候補から除外される", () => {
    const result = findNearestColor(0, allMockColors);
    // 無彩色にH=0の色(黒,灰,鉛)があるが、それらは候補にならない
    expect(result?.category).not.toBe("achromatic");
  });

  test("S=5でcategory!=achromaticの色は候補に含まれる", () => {
    // 白鼠(S=5, category=green, H=90)が候補に含まれることを確認
    const colorsWithBorderline = [mockBorderlineColor];
    const result = findNearestColor(90, colorsWithBorderline);
    expect(result?.slug).toBe("shironezumi");
  });

  test("候補がない場合undefinedを返す", () => {
    const result = findNearestColor(0, []);
    expect(result).toBeUndefined();
  });

  test("全色がexcludeSlugsにある場合undefinedを返す", () => {
    const allSlugs = new Set(mockChromatic.map((c) => c.slug));
    const result = findNearestColor(0, mockChromatic, allSlugs);
    expect(result).toBeUndefined();
  });

  test("無彩色のみの配列でundefinedを返す", () => {
    const result = findNearestColor(0, mockAchromatic);
    expect(result).toBeUndefined();
  });
});

describe("computeHarmony - complementary", () => {
  test("結果は2色で、先頭が基準色", () => {
    const toki = mockChromatic[0]; // H=0
    const result = computeHarmony(toki, "complementary", allMockColors);
    expect(result.colors).toHaveLength(2);
    expect(result.colors[0].slug).toBe("toki");
    expect(result.baseColor.slug).toBe("toki");
    expect(result.harmonyType).toBe("complementary");
  });

  test("2番目の色がH=180付近", () => {
    const toki = mockChromatic[0]; // H=0
    const result = computeHarmony(toki, "complementary", allMockColors);
    // 補色はH=180付近の色（青竹 H=179）が選ばれるはず
    const secondColor = result.colors[1];
    expect(hueDistance(180, secondColor.hsl[0])).toBeLessThanOrEqual(30);
  });
});

describe("computeHarmony - analogous", () => {
  test("結果は3色", () => {
    const toki = mockChromatic[0]; // H=0
    const result = computeHarmony(toki, "analogous", allMockColors);
    expect(result.colors).toHaveLength(3);
    expect(result.colors[0].slug).toBe("toki");
  });

  test("調和色がH=-30とH=+30付近の色を含む", () => {
    const toki = mockChromatic[0]; // H=0
    const result = computeHarmony(toki, "analogous", allMockColors);
    // targetHue=330(=-30)とtargetHue=30に近い色が選ばれるはず
    const hues = result.colors.slice(1).map((c) => c.hsl[0]);
    // 少なくとも基準色の近傍に位置する色であること
    hues.forEach((h) => {
      const distFrom0 = hueDistance(0, h);
      expect(distFrom0).toBeLessThanOrEqual(60);
    });
  });
});

describe("computeHarmony - triadic", () => {
  test("結果は3色", () => {
    const toki = mockChromatic[0]; // H=0
    const result = computeHarmony(toki, "triadic", allMockColors);
    expect(result.colors).toHaveLength(3);
    expect(result.colors[0].slug).toBe("toki");
  });

  test("調和色がH=120とH=240付近の色を含む", () => {
    const toki = mockChromatic[0]; // H=0
    const result = computeHarmony(toki, "triadic", allMockColors);
    const hues = result.colors.slice(1).map((c) => c.hsl[0]);
    // H=120付近の色が含まれる
    expect(hues.some((h) => hueDistance(120, h) <= 40)).toBe(true);
    // H=240付近の色が含まれる
    expect(hues.some((h) => hueDistance(240, h) <= 40)).toBe(true);
  });
});

describe("computeHarmony - tetradic", () => {
  test("結果は4色", () => {
    const toki = mockChromatic[0]; // H=0
    const result = computeHarmony(toki, "tetradic", allMockColors);
    expect(result.colors).toHaveLength(4);
    expect(result.colors[0].slug).toBe("toki");
  });

  test("調和色がH=90, H=180, H=270付近の色を含む", () => {
    const toki = mockChromatic[0]; // H=0
    const result = computeHarmony(toki, "tetradic", allMockColors);
    const hues = result.colors.slice(1).map((c) => c.hsl[0]);
    expect(hues.some((h) => hueDistance(90, h) <= 40)).toBe(true);
    expect(hues.some((h) => hueDistance(180, h) <= 40)).toBe(true);
    expect(hues.some((h) => hueDistance(270, h) <= 40)).toBe(true);
  });
});

describe("computeHarmony - split_complementary", () => {
  test("結果は3色", () => {
    const toki = mockChromatic[0]; // H=0
    const result = computeHarmony(toki, "split_complementary", allMockColors);
    expect(result.colors).toHaveLength(3);
    expect(result.colors[0].slug).toBe("toki");
  });

  test("調和色がH=150とH=210付近の色を含む", () => {
    const toki = mockChromatic[0]; // H=0
    const result = computeHarmony(toki, "split_complementary", allMockColors);
    const hues = result.colors.slice(1).map((c) => c.hsl[0]);
    expect(hues.some((h) => hueDistance(150, h) <= 40)).toBe(true);
    expect(hues.some((h) => hueDistance(210, h) <= 40)).toBe(true);
  });
});

describe("computeHarmony - 無彩色の場合", () => {
  test("無彩色が渡されると基準色のみを含む結果を返す", () => {
    const kuro = mockAchromatic[0]; // 黒, achromatic
    const result = computeHarmony(kuro, "complementary", allMockColors);
    expect(result.colors).toHaveLength(1);
    expect(result.colors[0].slug).toBe("kuro");
    expect(result.baseColor.slug).toBe("kuro");
    expect(result.harmonyType).toBe("complementary");
  });
});

describe("computeHarmony - 重複回避", () => {
  test("基準色に近い色相の色が複数あっても同一色が重複選択されない", () => {
    // 鴇(H=0)と桜(H=0)と紅緋(H=5)は色相が非常に近い
    // analogous(-30, +30)で2つの調和色が必要だが、同一色が選ばれないこと
    const toki = mockChromatic[0]; // H=0
    const result = computeHarmony(toki, "analogous", allMockColors);
    const slugs = result.colors.map((c) => c.slug);
    // 重複がないことを確認
    const uniqueSlugs = new Set(slugs);
    expect(uniqueSlugs.size).toBe(slugs.length);
  });

  test("tetradicでも全色がユニーク", () => {
    const toki = mockChromatic[0]; // H=0
    const result = computeHarmony(toki, "tetradic", allMockColors);
    const slugs = result.colors.map((c) => c.slug);
    const uniqueSlugs = new Set(slugs);
    expect(uniqueSlugs.size).toBe(slugs.length);
  });
});

describe("isAchromatic", () => {
  test("category=achromaticの色はtrue", () => {
    expect(isAchromatic(mockAchromatic[0])).toBe(true); // 黒
    expect(isAchromatic(mockAchromatic[1])).toBe(true); // 灰
  });

  test("category!=achromaticの色はfalse", () => {
    expect(isAchromatic(mockChromatic[0])).toBe(false); // 鴇 (red)
    expect(isAchromatic(mockChromatic[4])).toBe(false); // 山吹 (yellow)
  });

  test("S=5でcategory=greenの色はfalse（白鼠のケース）", () => {
    // S値が低くても、categoryがachromatic以外なら有彩色として扱う
    expect(isAchromatic(mockBorderlineColor)).toBe(false);
  });

  test("S=1でcategory=achromaticの色はtrue（鈍のケース）", () => {
    // S値が低く、categoryもachromaticなら無彩色
    expect(isAchromatic(mockAchromatic[3])).toBe(true); // 鈍 S=1
  });
});

describe("getAchromaticPalette", () => {
  test("無彩色のみが返される", () => {
    const result = getAchromaticPalette(mockAchromatic[0], allMockColors);
    result.forEach((c) => {
      expect(c.category).toBe("achromatic");
    });
  });

  test("明度（L値）の昇順にソートされている", () => {
    const result = getAchromaticPalette(mockAchromatic[0], allMockColors);
    for (let i = 1; i < result.length; i++) {
      expect(result[i].hsl[2]).toBeGreaterThanOrEqual(result[i - 1].hsl[2]);
    }
  });

  test("S=5でcategory!=achromaticの色は含まれない", () => {
    const result = getAchromaticPalette(mockBorderlineColor, allMockColors);
    expect(result.find((c) => c.slug === "shironezumi")).toBeUndefined();
  });
});

describe("filterColors", () => {
  test("日本語名での検索", () => {
    const result = filterColors("鴇", mockChromatic);
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe("toki");
  });

  test("ローマ字での検索", () => {
    const result = filterColors("toki", mockChromatic);
    // "toki" は 鴇(toki) と 常磐(tokiwa) にマッチ
    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result.some((c) => c.slug === "toki")).toBe(true);
  });

  test("大文字小文字を区別しない", () => {
    const result = filterColors("TOKI", mockChromatic);
    expect(result.some((c) => c.slug === "toki")).toBe(true);
  });

  test("空文字列で全件返却", () => {
    const result = filterColors("", mockChromatic);
    expect(result).toHaveLength(mockChromatic.length);
  });

  test("マッチしない検索語で空配列", () => {
    const result = filterColors("存在しない色", mockChromatic);
    expect(result).toHaveLength(0);
  });
});

describe("filterByCategory", () => {
  test('"all"で全件を返す', () => {
    const result = filterByCategory("all", allMockColors);
    expect(result).toHaveLength(allMockColors.length);
  });

  test("特定カテゴリでフィルタリング", () => {
    const result = filterByCategory("red", allMockColors);
    result.forEach((c) => {
      expect(c.category).toBe("red");
    });
    expect(result.length).toBeGreaterThan(0);
  });

  test("achromaticカテゴリでフィルタリング", () => {
    const result = filterByCategory("achromatic", allMockColors);
    result.forEach((c) => {
      expect(c.category).toBe("achromatic");
    });
    expect(result.length).toBe(mockAchromatic.length);
  });

  test("該当なしのカテゴリで空配列", () => {
    // orangeカテゴリのモックデータがない
    const result = filterByCategory("orange", allMockColors);
    expect(result).toHaveLength(0);
  });
});
