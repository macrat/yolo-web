/**
 * traditional-color OGP 画像のテスト。
 *
 * この面は共有レンダラ {@link renderFudaImage}（札）で組み、タイプ固有の伝統色 hex を
 * `colorOverride` で渡す（cycle-282 の回帰修正 B-579・色＝中身の復元）。ここでは
 * import が通り generateStaticParams / メタ export が正しいこと（非ネットワーク部分）を確認する。
 * 記号面の固有色・前景コントラストの検証は共有レンダラのテスト
 * （src/lib/__tests__/fuda-image.test.tsx）で網羅する。
 */

import { describe, it, expect } from "vitest";

describe("traditional-color opengraph-image", () => {
  it("モジュールが正常にインポートでき、メタ export が正しい", async () => {
    // opengraph-image.tsx が import エラーなく読み込めることを確認
    // (generateStaticParams など、非ネットワーク部分のみを確認)
    const mod = await import("../opengraph-image");
    expect(typeof mod.generateStaticParams).toBe("function");
    expect(mod.alt).toBe("クイズ結果");
    expect(mod.size).toEqual({ width: 1200, height: 630 });
    expect(mod.contentType).toBe("image/png");
  });
});
