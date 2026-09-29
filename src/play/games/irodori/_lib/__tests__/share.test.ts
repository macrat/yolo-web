import { describe, expect, test } from "vitest";
import {
  fontLoadRequests,
  generateShareText,
  layoutResultImage,
  rankPhrases,
  splitByFontRange,
  type FontFamilies,
  type ImageText,
  type MeasureText,
} from "../share";
import { hslToHex } from "../color-utils";
import type { IrodoriGameState } from "../types";
import * as frame from "@/lib/share-image-frame";
import { followsPhraseRules } from "@/lib/phrase-breaks";
import { INK, INK_2, RULE, RULE_2 } from "@/lib/token-hex";

const mockGameState: IrodoriGameState = {
  puzzleDate: "2026-02-20",
  puzzleNumber: 1,
  rounds: [
    {
      target: { h: 0, s: 100, l: 50, hex: "#ff0000" },
      answer: { h: 5, s: 95, l: 48 },
      deltaE: 3,
      score: 94,
    },
    {
      target: { h: 120, s: 80, l: 40, hex: "#1a8c1a" },
      answer: { h: 115, s: 75, l: 42 },
      deltaE: 5,
      score: 90,
    },
    {
      target: { h: 240, s: 60, l: 60, hex: "#6666cc" },
      answer: { h: 230, s: 50, l: 55 },
      deltaE: 12,
      score: 76,
    },
    {
      target: { h: 60, s: 90, l: 50, hex: "#f2e60d" },
      answer: { h: 55, s: 80, l: 45 },
      deltaE: 20,
      score: 60,
    },
    {
      target: { h: 300, s: 70, l: 45, hex: "#c422c4" },
      answer: { h: 280, s: 50, l: 35 },
      deltaE: 30,
      score: 40,
    },
  ],
  currentRound: 5,
  status: "completed",
  initialSliderValues: [],
};

describe("generateShareText", () => {
  test("1行目に、問題の番号と合計点とランクを言う", () => {
    const text = generateShareText(mockGameState);
    expect(text.split("\n")[0]).toBe("イロドリ #1 スコア: 72/100 (Bランク)");
  });

  test("2行目に、結果の画面と同じ問ごとの点数を並べ、絵文字を使わない", () => {
    const text = generateShareText(mockGameState);
    expect(text.split("\n")[1]).toBe("94 90 76 60 40");
    expect(text).not.toMatch(/\p{Extended_Pictographic}/u);
  });

  test("ハッシュタグの行で終わり、ページの URL は共有のボタンに任せる", () => {
    const text = generateShareText(mockGameState);
    expect(text.split("\n").at(-1)).toBe("#イロドリ #yolosnet");
    expect(text).not.toContain("http");
  });
});

/** 欧文の基本範囲の字を字の大きさの 0.6 倍、ほかの字を字の大きさの幅と見る。 */
const measure: MeasureText = (text, font) =>
  [...text].reduce(
    (sum, char) => sum + font.size * (char.codePointAt(0)! <= 0x7f ? 0.6 : 1),
    0,
  );

function withRounds(
  update: (round: IrodoriGameState["rounds"][number], index: number) => object,
): IrodoriGameState {
  return {
    ...mockGameState,
    rounds: mockGameState.rounds.map((round, index) => ({
      ...round,
      ...update(round, index),
    })),
  };
}

const EXAMPLES: Record<string, IrodoriGameState> = {
  "5問を答えた回": mockGameState,
  回答の無い問を含む回: withRounds((_, index) =>
    index >= 3 ? { answer: null, deltaE: null, score: null } : {},
  ),
  "全問 100点の回": withRounds(() => ({ score: 100 })),
  "全問 0点の回": withRounds(() => ({ score: 0 })),
};

const CONTENT_RIGHT = frame.CONTENT_LEFT + frame.CONTENT_WIDTH;

function textBox(item: ImageText) {
  const width = measure(item.text, item);
  const left = item.align === "left" ? item.x : item.x - width;
  return {
    left,
    right: left + width,
    top: item.top,
    bottom: item.top + item.lineHeight,
  };
}

describe("layoutResultImage", () => {
  test.each(Object.entries(EXAMPLES))(
    "%s: どの見本と字も、中身の枠の中に入る",
    (_, state) => {
      const layout = layoutResultImage(state, measure);
      for (const swatch of layout.swatches) {
        expect(swatch.x).toBeGreaterThanOrEqual(frame.CONTENT_LEFT);
        expect(swatch.x + swatch.width).toBeLessThanOrEqual(CONTENT_RIGHT);
        expect(swatch.y).toBeGreaterThanOrEqual(frame.CONTENT_TOP);
        expect(swatch.y + swatch.height).toBeLessThanOrEqual(
          frame.BOTTOM_RULE_Y,
        );
      }
      for (const item of layout.texts.filter((t) => t.text !== "yolos.net")) {
        const box = textBox(item);
        expect(box.left).toBeGreaterThanOrEqual(frame.CONTENT_LEFT);
        expect(box.right).toBeLessThanOrEqual(CONTENT_RIGHT);
        expect(box.top).toBeGreaterThanOrEqual(frame.CONTENT_TOP);
        expect(box.bottom).toBeLessThanOrEqual(frame.BOTTOM_RULE_Y);
      }
    },
  );

  test.each(Object.entries(EXAMPLES))(
    "%s: 問ごとに、お題の見本と、回答の見本か「記録なし」と、点を持つ",
    (_, state) => {
      const layout = layoutResultImage(state, measure);
      const expected = state.rounds.flatMap((round) =>
        round.answer
          ? [
              round.target.hex,
              hslToHex(round.answer.h, round.answer.s, round.answer.l),
            ]
          : [round.target.hex],
      );
      expect(layout.swatches.map((swatch) => swatch.color)).toEqual(expected);
      const texts = layout.texts.map((item) => item.text);
      expect(texts.filter((text) => text === "記録なし")).toHaveLength(
        state.rounds.filter((round) => round.answer === null).length,
      );
      for (const round of state.rounds) {
        expect(texts).toContain(`${round.score ?? 0}点`);
      }
    },
  );

  test("見本は角を持たない正方形で、細い線で囲む", () => {
    const layout = layoutResultImage(mockGameState, measure);
    for (const swatch of layout.swatches) {
      expect(swatch.width).toBe(swatch.height);
      expect(swatch.border).toEqual({ width: frame.THIN_RULE, color: RULE_2 });
    }
  });

  test("見本の上に字を置かない", () => {
    const layout = layoutResultImage(EXAMPLES["回答の無い問を含む回"], measure);
    for (const swatch of layout.swatches) {
      for (const item of layout.texts) {
        const box = textBox(item);
        const overlaps =
          box.left < swatch.x + swatch.width &&
          box.right > swatch.x &&
          box.top < swatch.y + swatch.height &&
          box.bottom > swatch.y;
        expect(overlaps).toBe(false);
      }
    }
  });

  test("枠の罫線は、OGP 画像と同じ位置と太さで引く", () => {
    const layout = layoutResultImage(mockGameState, measure);
    const thick = layout.rects.filter((rect) => rect.color === RULE);
    expect(thick).toEqual([
      expect.objectContaining({
        x: frame.LEFT_RULE_X,
        y: 0,
        width: frame.THICK_RULE,
        height: frame.SHARE_IMAGE_HEIGHT,
      }),
      expect.objectContaining({
        x: frame.RIGHT_RULE_X,
        y: 0,
        width: frame.THICK_RULE,
        height: frame.SHARE_IMAGE_HEIGHT,
      }),
      expect.objectContaining({
        x: 0,
        y: frame.TOP_RULE_Y,
        width: frame.SHARE_IMAGE_WIDTH,
        height: frame.THICK_RULE,
      }),
      expect.objectContaining({
        x: 0,
        y: frame.BOTTOM_RULE_Y,
        width: frame.SHARE_IMAGE_WIDTH,
        height: frame.THICK_RULE,
      }),
    ]);
  });

  test("合計点を、数字の結果として見出しの書体の決まった大きさで、補助情報のすぐ下に組む", () => {
    const layout = layoutResultImage(mockGameState, measure);
    const [aux, total] = layout.texts.filter(
      (item) => item.x === frame.CONTENT_LEFT && item.top > frame.TOP_RULE_Y,
    );
    expect(aux).toMatchObject({
      text: "イロドリ #1の結果",
      role: "body",
      size: frame.AUX_SIZE,
      color: INK_2,
    });
    expect(total).toMatchObject({
      text: "72点",
      role: "heading",
      size: frame.NUMERIC_SIZE,
      lineHeight: frame.NUMERIC_LINE_HEIGHT,
      color: INK,
      top: aux.top + frame.AUX_LINE_HEIGHT + frame.GAP_AFTER_AUX,
    });
  });

  test("字はどれも補助情報の大きさ以上で、サイト名を上端の罫線の上に置く", () => {
    const layout = layoutResultImage(mockGameState, measure);
    for (const item of layout.texts) {
      expect(item.size).toBeGreaterThanOrEqual(frame.AUX_SIZE);
    }
    const siteName = layout.texts.find((item) => item.text === "yolos.net")!;
    expect(siteName.x).toBe(frame.CONTENT_LEFT);
    expect(siteName.top).toBeGreaterThanOrEqual(frame.CROP_BAND);
    expect(siteName.top + siteName.lineHeight).toBeLessThanOrEqual(
      frame.TOP_RULE_Y,
    );
  });

  test("ランクの文が1行に収まらないときは、文節の区切りで折る", () => {
    const narrow: MeasureText = (text, font) =>
      text.includes("ランク、") && text.endsWith("。")
        ? 10_000
        : measure(text, font);
    const lines = layoutResultImage(mockGameState, narrow)
      .texts.filter(
        (item) => item.text.includes("ランク") || item.text.endsWith("です。"),
      )
      .map((item) => item.text);
    expect(lines).toEqual(rankPhrases("B"));
  });
});

describe("rankPhrases", () => {
  test.each(["S", "A", "B", "C", "D"] as const)(
    "%sランクの文の区切りは、見出しの折り方の規則を満たす",
    (rank) => {
      expect(followsPhraseRules(rankPhrases(rank))).toBe(true);
    },
  );
});

describe("書体の読み込み", () => {
  const FAMILIES: FontFamilies = {
    heading: {
      all: '"plexSans", "IBM Plex Sans Fallback", "Zen Antique", "BIZ UDGothic", sans-serif',
      ja: '"Zen Antique", "BIZ UDGothic", sans-serif',
    },
    body: {
      all: '"plexSans", "IBM Plex Sans Fallback", "BIZ UDPGothic", sans-serif',
      ja: '"BIZ UDPGothic", sans-serif',
    },
  };

  test("欧文の基本範囲の字と、ほかの字に分ける", () => {
    expect(splitByFontRange("イロドリ #212の結果")).toEqual({
      latin: " #212",
      ja: "イロドリの結果",
    });
    expect(splitByFontRange("72点")).toEqual({ latin: "72", ja: "点" });
  });

  test("書体ごとに、その書体で組む字だけを渡す", () => {
    const texts = layoutResultImage(mockGameState, measure).texts.filter(
      (item) => item.text === "72点",
    );
    expect(fontLoadRequests(texts, FAMILIES)).toEqual([
      { font: '400 134px "plexSans"', text: "72" },
      { font: '400 134px "IBM Plex Sans Fallback"', text: "72" },
      { font: '400 134px "Zen Antique"', text: "点" },
      { font: '400 134px "BIZ UDGothic"', text: "点" },
      { font: "400 134px sans-serif", text: "点" },
    ]);
  });

  test("和文の書体には欧文の基本範囲の字を、欧文の書体にはほかの字を渡さない", () => {
    const requests = fontLoadRequests(
      layoutResultImage(EXAMPLES["回答の無い問を含む回"], measure).texts,
      FAMILIES,
    );
    for (const { font, text } of requests) {
      const { latin, ja } = splitByFontRange(text);
      if (/plexSans|IBM Plex Sans Fallback/.test(font)) expect(ja).toBe("");
      else expect(latin).toBe("");
    }
    expect(requests.some(({ text }) => text.includes("記録なし"))).toBe(true);
  });
});
