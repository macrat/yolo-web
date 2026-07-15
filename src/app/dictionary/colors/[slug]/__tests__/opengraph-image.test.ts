/**
 * /dictionary/colors/[slug] OGP 画像のテスト。
 *
 * この面は共有レンダラ {@link renderFudaImage}（札）で組み、その伝統色の hex を
 * `colorOverride`、印を "屋"（店の家印）で渡す（B-579・純増した色個別ページの OGP）。ここでは
 * import が通り generateStaticParams が全色 slug を返すこと・メタ export が正しいこと
 * （非ネットワーク部分）を確認する。記号面の固有色・前景コントラストの検証は
 * 共有レンダラのテスト（src/lib/__tests__/fuda-image.test.tsx）で網羅する。
 */

import { describe, it, expect } from "vitest";
import { getAllColorSlugs } from "@/dictionary/_lib/colors";

describe("dictionary/colors opengraph-image", () => {
  it("モジュールが正常にインポートでき、メタ export が正しい", async () => {
    const mod = await import("../opengraph-image");
    expect(typeof mod.generateStaticParams).toBe("function");
    expect(mod.alt).toBe("日本の伝統色");
    expect(mod.size).toEqual({ width: 1200, height: 630 });
    expect(mod.contentType).toBe("image/png");
  });

  it("generateStaticParams が全色 slug を返す", async () => {
    const mod = await import("../opengraph-image");
    const params = mod.generateStaticParams();
    expect(params.length).toBe(getAllColorSlugs().length);
    expect(params.length).toBeGreaterThan(0);
    expect(params[0]).toHaveProperty("slug");
  });
});
