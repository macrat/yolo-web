import { describe, expect, it } from "vitest";
import { calcTilePixels } from "../tile-grid";

/**
 * タイルグリッド定数のヘルパー関数境界値テスト。
 * 原典 docs/archive/design-migration-plan.md Phase 7.2 の式を検証する:
 *   実サイズ = (128n + 8(n-1))px × (128m + 8(m-1))px
 */
describe("calcTilePixels", () => {
  it("1×1: width=128, height=128", () => {
    const { width, height } = calcTilePixels(1, 1);
    expect(width).toBe(128);
    expect(height).toBe(128);
  });

  it("1×2: width=128, height=264", () => {
    const { width, height } = calcTilePixels(1, 2);
    expect(width).toBe(128);
    // 128×2 + 8×(2-1) = 256 + 8 = 264
    expect(height).toBe(264);
  });

  it("2×1: width=264, height=128", () => {
    const { width, height } = calcTilePixels(2, 1);
    // 128×2 + 8×(2-1) = 256 + 8 = 264
    expect(width).toBe(264);
    expect(height).toBe(128);
  });

  it("3×3: width=400, height=400", () => {
    const { width, height } = calcTilePixels(3, 3);
    // 128×3 + 8×(3-1) = 384 + 16 = 400
    expect(width).toBe(400);
    expect(height).toBe(400);
  });
});
