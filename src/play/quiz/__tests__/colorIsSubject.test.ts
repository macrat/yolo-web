import { describe, expect, test } from "vitest";
import { quizBySlug } from "../registry";
import { getContrastTextColor } from "@/play/color-utils";

/**
 * DESIGN.md §2「主題が色そのものである面」のゲート。
 *
 * 色の診断で色が違うのは、来訪者から見れば壊れているのと同じである。包みの地を
 * id のハッシュから和色8色へ写像すると、「あなたは藍色です」という本文の横に
 * 紅の面が出る。持ち帰る画像が固有色で描かれていれば、画面と画像も食い違う。
 * 主題が色である面では、色は装飾ではなく中身だからこうなる。
 *
 * `colorIsSubject` を立てた診断は、全結果が固有色を持つことをここで担保する。
 * 色を足すときに人が確かめるのではなく、機械が落とす。
 *
 * 文字色の AA も確かめるが、これは色の選び方ではなく前景の決め方を見張るものである
 * ——`getContrastTextColor` は墨と白の良いほうを採るので、地の色が何であれ 4.5:1 は
 * ほぼ満たされる。この検査が落ちるのは、前景の決め方を変えたときである。
 */
describe("主題が色そのものである診断（DESIGN.md §2）", () => {
  const colorQuizzes = [...quizBySlug.values()].filter(
    (quiz) => quiz.meta.colorIsSubject,
  );

  test("colorIsSubject の診断が実在すること", () => {
    // 0件のまま通ると、このファイルは何も検査していないのに緑になる。
    expect(colorQuizzes.length).toBeGreaterThan(0);
  });

  for (const quiz of colorQuizzes) {
    describe(quiz.meta.slug, () => {
      test.each(quiz.results.map((result) => [result.id, result.color]))(
        "%s が固有色を持つ",
        (_id, color) => {
          expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
        },
      );

      test.each(quiz.results.map((result) => [result.id, result.color]))(
        "%s の固有色の上の文字が AA（4.5:1）を満たす",
        (_id, color) => {
          expect(
            contrastRatio(color!, getContrastTextColor(color!)),
          ).toBeGreaterThanOrEqual(4.5);
        },
      );
    });
  }
});

/** WCAG 2.1 の相対輝度からコントラスト比を出す（sRGB hex）。 */
function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

function relativeLuminance(hex: string): number {
  const n = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(n.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
