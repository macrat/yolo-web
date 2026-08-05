/**
 * `scripts/icon-metrics.ts` の較正が壊れていないことを守るテスト。
 *
 * この計器は、cycle-302 が「アイコンの可否を判定できる装置」として作ったものである
 * （`docs/cycles/cycle-302/criteria.md`「基準 v2 への改訂」）。**しきい値が緩んで
 * 既知の不合格品を通すようになったら、装置としての意味が消える**ので、機械的に守る。
 *
 * fixtures の出所:
 * - `cycle299-shipped-16.png` … cycle-299 が実際に出荷した favicon（commit `fd088fa1`）の 16px 層。
 *   人間が「y の下半分が切れて v に見える／細すぎる」と観測した**唯一の固定点**（incident-1 §2）。
 * - `control-*.png` … cycle-302 で意図的に欠陥を持たせて作った対照。
 */

import { describe, test, expect } from "vitest";
import * as path from "node:path";
import { measure, verdictOf } from "../icon-metrics";

const FIXTURES = path.join(__dirname, "fixtures");
const PUBLIC = path.join(__dirname, "..", "..", "public");

describe("icon-metrics の較正", () => {
  test("cycle-299 が出荷した favicon を不合格にする（人間の観測に対する固定点）", async () => {
    const v = verdictOf(
      await measure(path.join(FIXTURES, "cycle299-shipped-16.png")),
    );
    expect(v.pass).toBe(false);
    // 明るい地で溶けることが失敗の中身。地を取り違えていないことも確かめる。
    expect(v.failedGrounds).toContain("G1");
    expect(v.failedGrounds).toContain("G3");
  });

  test("対照: 紙地に極細の墨図は、明るい地で落ちる", async () => {
    const v = verdictOf(
      await measure(path.join(FIXTURES, "control-thin-on-paper-16.png")),
    );
    expect(v.pass).toBe(false);
    expect(v.failedGrounds).toEqual(expect.arrayContaining(["G1", "G3"]));
  });

  test("対照: 四隅に情報を置いた図は、円マスクで落ちる（N3 は 32px 以上にのみ課す）", async () => {
    const v48 = verdictOf(
      await measure(path.join(FIXTURES, "control-corners-48.png")),
    );
    expect(v48.maskFails).toBe(true);
    // 16px 層には N3 を課さない（criteria.md【M-4】の凍結済みの判断）。
    // 実効の図領域が約 11×11 に落ち、実在が確定した 16px 可読を、
    // 実在が未確認の円マスクで損なうため。計器がこれに従っていることを守る。
    const v16 = verdictOf(
      await measure(path.join(FIXTURES, "control-corners-16.png")),
    );
    expect(v16.maskFails).toBe(false);
  });

  test("対照: 中間トーンだけの図は、明暗どちらにも寄れず落ちる", async () => {
    const v = verdictOf(
      await measure(path.join(FIXTURES, "control-midtone-16.png")),
    );
    expect(v.pass).toBe(false);
    expect(v.failedGrounds).toEqual(expect.arrayContaining(["G1", "G4"]));
  });

  test("いま出荷しているアイコンは合格する（陰性対照＝落としてはいけないもの）", async () => {
    for (const target of [
      `${path.join(PUBLIC, "favicon.ico")}[0]`,
      `${path.join(PUBLIC, "favicon.ico")}[1]`,
      path.join(PUBLIC, "apple-touch-icon.png"),
    ]) {
      expect(
        verdictOf(await measure(target)).pass,
        `${target} が不合格になった`,
      ).toBe(true);
    }
  });

  test("出荷しているアイコンの有彩色要素は WCAG 1.4.11 の 3:1 を満たす", async () => {
    // cycle-302 E0 の当初版はライト用の朱を暗地に当てて 2.686 まで落ち、
    // レビューで捕捉された。暗地用の朱へ替えて 5.776 / 6.135 になった経緯を守る。
    for (const target of [
      `${path.join(PUBLIC, "favicon.ico")}[0]`,
      `${path.join(PUBLIC, "favicon.ico")}[1]`,
      path.join(PUBLIC, "apple-touch-icon.png"),
    ]) {
      expect(
        (await measure(target)).chromaticContrastToOwnGround,
        `${target} の有彩色要素のコントラストが 3:1 未満`,
      ).toBeGreaterThanOrEqual(3.0);
    }
  });

  test("出荷しているアイコンに旧ブランドの青（DESIGN §8-1 の禁止色）が残っていない", async () => {
    for (const target of [
      `${path.join(PUBLIC, "favicon.ico")}[0]`,
      `${path.join(PUBLIC, "favicon.ico")}[1]`,
      path.join(PUBLIC, "apple-touch-icon.png"),
    ]) {
      expect(
        (await measure(target)).bluishPixels,
        `${target} に青みの画素が残っている`,
      ).toBe(0);
    }
  });
});
