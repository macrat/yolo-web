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
import {
  measure,
  verdictOf,
  MIN_VISIBLE_COMPONENT_PER_256,
  MIN_STROKE_SOLIDITY,
} from "../icon-metrics";
import { readdirSync } from "node:fs";

const FIXTURES = path.join(__dirname, "fixtures");
const PUBLIC = path.join(__dirname, "..", "..", "public");

/**
 * 出荷しているアイコン面を**走査して**拾う。
 * ハードコードしていると、E1 が予定している 96px 以上の層や新しいアイコン面が
 * 自動では守られない（6巡目 m-5）。
 */
function shippedIconSpecs(): string[] {
  const specs: string[] = [];
  for (const name of readdirSync(PUBLIC)) {
    const full = path.join(PUBLIC, name);
    if (name === "favicon.ico") {
      // ICO の層数はヘッダを読まないと分からないので、多めに積んで
      // 後段の `existingShippedIconSpecs` が実際に読めたものだけに絞る。
      // （当初ここに try/catch を書いていたが `push` は throw しないので無意味だった＝7巡目 m-1）
      for (let i = 0; i <= 16; i++) specs.push(`${full}[${i}]`);
      continue;
    }
    if (/^(apple-touch-icon|icon)[^/]*\.(png|jpg|jpeg)$/.test(name)) {
      specs.push(full);
    }
  }
  return specs;
}

/** 実在するサブイメージだけに絞る（ICO の層数は数えないと分からない）。 */
async function existingShippedIconSpecs(): Promise<string[]> {
  const found: string[] = [];
  for (const spec of shippedIconSpecs()) {
    try {
      await measure(spec);
      found.push(spec);
    } catch {
      /* 存在しない層は飛ばす */
    }
  }
  return found;
}

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
    const targets = await existingShippedIconSpecs();
    expect(targets.length, "出荷アイコンが1つも見つからない").toBeGreaterThan(
      0,
    );
    for (const target of targets) {
      expect(
        verdictOf(await measure(target)).pass,
        `${target} が不合格になった`,
      ).toBe(true);
    }
  });

  test("出荷しているアイコンの有彩色要素は WCAG 1.4.11 の 3:1 を満たす", async () => {
    // cycle-302 E0 の当初版はライト用の朱（#af3622）を暗地に当てて
    // 16px 2.652 / 32px・apple 2.796 まで落ち、WCAG の 3:1 を割ってレビューで捕捉された。
    // 暗地用の朱（#e87a65）へ替えて 5.845 / 6.135 になった経緯を守る。
    // ※ 当初このコメントに書いた「2.686」はどの実測にも存在しない数値だった（6巡目 m-1）。
    const targets = await existingShippedIconSpecs();
    expect(targets.length, "出荷アイコンが1つも見つからない").toBeGreaterThan(
      0,
    );
    for (const target of targets) {
      expect(
        (await measure(target)).chromaticContrastToOwnGround,
        `${target} の有彩色要素のコントラストが 3:1 未満`,
      ).toBeGreaterThanOrEqual(3.0);
    }
  });

  test("出荷しているアイコンに旧ブランドの青（DESIGN §8-1 の禁止色）が残っていない", async () => {
    const targets = await existingShippedIconSpecs();
    expect(targets.length, "出荷アイコンが1つも見つからない").toBeGreaterThan(
      0,
    );
    for (const target of targets) {
      expect(
        (await measure(target)).bluishPixels,
        `${target} に青みの画素が残っている`,
      ).toBe(0);
    }
  });

  // 6巡目 m-4: 「しきい値が緩めば落ちる」は、そのままでは成り立たなかった
  // （20 → 17 に緩めてもテストは全通した）。**較正の主張そのものを検査する。**
  test("しきい値が、落とすべきものの最悪と通すべきものの最悪の間にある", async () => {
    // fixture はすべて 16×16（面積 256）なので、塊の画素数がそのまま /256 換算の値になる。
    const worstBlob = async (spec: string): Promise<number> =>
      Math.min(
        ...(await measure(spec)).presenceByGround.map(
          (p) => p.largestVisibleComponent,
        ),
      );
    // **落とすべき側は「最も通りやすい（最大の）値」を採る。**
    // 最小を採ると、落とすべき実例が複数あるとき1件しか担保できない。
    // 当初 Math.min で書いていたため、実効の下限が 1 になり 2〜26 のどこでも通る
    // 状態だった（7巡目 B-1/B-2）。
    const failingHardest = Math.max(
      await worstBlob(path.join(FIXTURES, "cycle299-shipped-16.png")),
      await worstBlob(path.join(FIXTURES, "control-thin-on-paper-16.png")),
    );
    const passingWorst = await worstBlob(
      path.join(FIXTURES, "pre-conversion-favicon-16.png"),
    );

    expect(
      MIN_VISIBLE_COMPONENT_PER_256,
      "しきい値が、落とすべきものを通す位置まで緩んでいる",
    ).toBeGreaterThan(failingHardest);
    expect(
      MIN_VISIBLE_COMPONENT_PER_256,
      "しきい値が、通すべきものを落とす位置まで厳しくなっている",
    ).toBeLessThanOrEqual(passingWorst);
  });

  test("ストロークのしきい値も、両側の実測の間にある", async () => {
    // 同じ理由で、落とすべき側は複数の対照のうち**最大**を採る。
    const failing = Math.max(
      (await measure(path.join(FIXTURES, "cycle299-shipped-16.png")))
        .strokeSolidity,
      (await measure(path.join(FIXTURES, "control-thin-on-paper-16.png")))
        .strokeSolidity,
    );
    const passing = (
      await measure(path.join(FIXTURES, "pre-conversion-favicon-16.png"))
    ).strokeSolidity;
    expect(MIN_STROKE_SOLIDITY).toBeGreaterThan(failing);
    expect(MIN_STROKE_SOLIDITY).toBeLessThanOrEqual(passing);
  });

  // 7巡目のブログレビュー B1: 透過を無視して素の RGB を測ると、完全透過の画素が
  // その RGB で「見えている」ことになり、**安全でない方向へ誤って合格を返していた**。
  // 地の上に合成してから測る形へ直した。透過ファビコンは web で珍しくない。
  test("対照: 透過背景＋白い図は、白い地では落ち、暗い地では通る", async () => {
    const m = await measure(
      path.join(FIXTURES, "control-transparent-white-16.png"),
    );
    expect(m.hasTransparency).toBe(true);
    const v = verdictOf(m);
    expect(v.pass).toBe(false);
    // 白い図は白い地（G1 ライトタブ・G3 純白）で消える。
    expect(v.failedGrounds).toEqual(expect.arrayContaining(["G1", "G3"]));
    // 暗い地では見えるので、そちらは落ちない。
    expect(v.failedGrounds).not.toContain("G2");
  });

  // 7巡目のブログ再レビュー B-1: 透過領域に保存されている RGB は書き出しツールの副産物で、
  // 人間にもブラウザにも見えない。これを最頻色の計算に入れると**「図」の定義そのものが
  // その保存値に支配される**（同じ見た目のファイルが、保存値の違いだけで別の評決になる）。
  test("見た目が同じなら、透過領域に保存された RGB が違っても同じ評決になる", async () => {
    const a = await measure(
      path.join(FIXTURES, "control-transparent-white-16.png"),
    );
    // 同じ見た目で、透過画素の保存 RGB だけを白に置き換えた版。
    const b = await measure(
      path.join(FIXTURES, "control-transparent-white-onwhite-16.png"),
    );
    expect(b.ownGround).toEqual(a.ownGround);
    expect(b.figurePixels).toBe(a.figurePixels);
    expect(b.strokeSolidity).toBe(a.strokeSolidity);
    expect(verdictOf(b)).toEqual(verdictOf(a));
    // NaN を出さないこと（図が 0 のときの除算）。
    expect(Number.isNaN(b.strokeSolidity)).toBe(false);
    expect(Number.isNaN(b.outsideInscribedCircle)).toBe(false);
  });
});
