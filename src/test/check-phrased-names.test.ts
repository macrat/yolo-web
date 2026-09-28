/**
 * `npm run check:phrased-names` の本体。区切りの並びで渡すべき名前と面を数える（unphrased-names.ts）。
 *
 * 数え方は server-only の splitIntoPhrases を使うので、vitest の上で走らせる。数えるのは、スクリプトが
 * CHECK_PHRASED_NAMES を立てたときだけで、ふだんの `npm test` では何も数えずに通る。
 *
 * - PHRASED_NAMES_PATHS: 数えるファイルかディレクトリ（空白かカンマで区切る。既定は `src`）。
 *   vitest の位置引数は試験のファイルの絞り込みに使われるので、パスは環境変数で渡す。
 * - PHRASED_NAMES_REPORT_ONLY=1: 字で渡すものがあっても失敗させず、出すだけにする。
 */
import { describe, expect, test } from "vitest";
import { findUnphrasedNames, formatFinding } from "./unphrased-names";

const enabled = process.env.CHECK_PHRASED_NAMES === "1";

describe.runIf(enabled)("check:phrased-names", () => {
  test("字で渡す2文節以上の名前と面が無い", () => {
    const targets = (process.env.PHRASED_NAMES_PATHS ?? "src")
      .split(/[\s,]+/)
      .filter((target) => target !== "");
    const report = findUnphrasedNames(targets);
    const lines = [
      `数えたパス: ${targets.join(" ")}`,
      "",
      `字で渡すもの（直すもの）: ${report.literals.length}`,
      ...report.literals.map(formatFinding),
      "",
      `値で渡すもの（名前が出る状態を開いて 320px の既定と 200% で測るもの）: ${report.values.length}`,
      ...report.values.map(formatFinding),
      "",
      `字で渡した名前と面（1文節のものを含む）: ${report.literalCount}`,
    ];
    process.stdout.write(`${lines.join("\n")}\n`);
    if (process.env.PHRASED_NAMES_REPORT_ONLY !== "1") {
      expect(report.literals.map(formatFinding)).toEqual([]);
    }
  });
});
