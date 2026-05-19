import { describe, expect, test } from "vitest";
import { TILE_CELL_PX, TILE_GAP_PX, tileSizeStyle } from "../tile-grid";

describe("TILE_CELL_PX", () => {
  test("128 であること", () => {
    expect(TILE_CELL_PX).toBe(128);
  });
});

describe("TILE_GAP_PX", () => {
  test("8 であること", () => {
    expect(TILE_GAP_PX).toBe(8);
  });
});

describe("tileSizeStyle", () => {
  test("tileSizeStyle(1, 1) → 128px × 128px（n=m=1 の境界）", () => {
    const result = tileSizeStyle(1, 1);
    expect(result.width).toBe("128px");
    expect(result.height).toBe("128px");
  });

  test("tileSizeStyle(2, 1) → 264px × 128px（128×2 + 8×1 = 264）", () => {
    const result = tileSizeStyle(2, 1);
    expect(result.width).toBe("264px");
    expect(result.height).toBe("128px");
  });

  test("tileSizeStyle(3, 2) → 400px × 264px（128×3 + 8×2 = 400, 128×2 + 8×1 = 264）", () => {
    const result = tileSizeStyle(3, 2);
    expect(result.width).toBe("400px");
    expect(result.height).toBe("264px");
  });

  test("tileSizeStyle(1, 3) → 128px × 400px（縦長ケース）", () => {
    const result = tileSizeStyle(1, 3);
    expect(result.width).toBe("128px");
    expect(result.height).toBe("400px");
  });

  test("tileSizeStyle(4, 4) → 536px × 536px（128×4 + 8×3 = 512 + 24 = 536）", () => {
    const result = tileSizeStyle(4, 4);
    expect(result.width).toBe("536px");
    expect(result.height).toBe("536px");
  });

  test("tileSizeStyle(2, 3) → 264px × 400px", () => {
    const result = tileSizeStyle(2, 3);
    expect(result.width).toBe("264px");
    expect(result.height).toBe("400px");
  });
});
