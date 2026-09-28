/**
 * /dictionary/colors/[slug] OGP 画像のテスト。
 *
 * この面は共有レンダラ {@link renderFudaImage}（札）で組み、その伝統色の hex を
 * `colorOverride`、印を内容印 CONTENT_SEAL_CHAR（＝内容を表す一字「色」）で渡す。ここでは
 * import が通り generateStaticParams が全色 slug を返すこと・メタ export が正しいこと・
 * 内容印が「色」で店の看板印「試」ではないことを確認する（非ネットワーク部分）。
 * 記号面の固有色・前景コントラストの検証は
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

  it("内容印が内容を表す一字「色」で、店の看板印「試」ではない", async () => {
    const mod = await import("../opengraph-image");
    expect(mod.CONTENT_SEAL_CHAR).toBe("色");
    // 店の看板印「試」は内容 fuda に使わない。
    expect(mod.CONTENT_SEAL_CHAR).not.toBe("試");
  });
});
