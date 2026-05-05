/**
 * traditional-color OGP 画像のテスト。
 *
 * 注: テキストコントラスト（getRelativeLuminance, getTextColorForBackground）の
 * ユニットテストは src/lib/__tests__/ogp-image.test.tsx に移動済み。
 * createOgpImageResponse が自動でテキスト色を判定するため、
 * ここでは traditional-color 固有のロジック（result.color の使用など）をテストする。
 */

import { describe, it, expect } from "vitest";

// traditional-color OGP 固有のロジックが正しいことを確認するプレースホルダー。
// createOgpImageResponse の自動テキスト色判定は ogp-image.test.tsx でテスト済み。
describe("traditional-color opengraph-image", () => {
  it("モジュールが正常にインポートできる", async () => {
    // opengraph-image.tsx が import エラーなく読み込めることを確認
    // (generateStaticParams など、非ネットワーク部分のみを確認)
    const mod = await import("../opengraph-image");
    expect(typeof mod.generateStaticParams).toBe("function");
    expect(mod.alt).toBe("クイズ結果");
    expect(mod.size).toEqual({ width: 1200, height: 630 });
    expect(mod.contentType).toBe("image/png");
  });
});
