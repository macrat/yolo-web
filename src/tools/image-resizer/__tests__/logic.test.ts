import { describe, it, expect } from "vitest";
import {
  calculateDimensions,
  calculateDimensionsFromPercent,
  formatFileSize,
  getOutputMimeType,
} from "../logic";

describe("calculateDimensions", () => {
  it("returns both specified dimensions when aspect ratio is unlocked", () => {
    const result = calculateDimensions(800, 600, 400, 300, false);
    expect(result).toEqual({ width: 400, height: 300 });
  });

  it("calculates height from width with aspect ratio locked", () => {
    const result = calculateDimensions(800, 600, 400, null, true);
    expect(result).toEqual({ width: 400, height: 300 });
  });

  it("calculates width from height with aspect ratio locked", () => {
    const result = calculateDimensions(800, 600, null, 300, true);
    expect(result).toEqual({ width: 400, height: 300 });
  });

  it("uses width as primary when both specified with aspect ratio locked", () => {
    const result = calculateDimensions(800, 600, 400, 500, true);
    expect(result).toEqual({ width: 400, height: 300 });
  });

  it("returns original dimensions when no target specified", () => {
    const result = calculateDimensions(800, 600, null, null, true);
    expect(result).toEqual({ width: 800, height: 600 });
  });

  it("enforces minimum 1px for width", () => {
    const result = calculateDimensions(800, 600, 0, 600, false);
    expect(result.width).toBe(1);
  });

  it("enforces minimum 1px for height", () => {
    const result = calculateDimensions(800, 600, 800, 0, false);
    expect(result.height).toBe(1);
  });

  it("enforces minimum 1px for negative values", () => {
    const result = calculateDimensions(800, 600, -10, -20, false);
    expect(result.width).toBe(1);
    expect(result.height).toBe(1);
  });

  it("rounds fractional dimensions", () => {
    const result = calculateDimensions(1000, 750, 333, null, true);
    expect(result.width).toBe(333);
    expect(result.height).toBe(250);
  });
});

describe("calculateDimensionsFromPercent", () => {
  it("scales to 50%", () => {
    const result = calculateDimensionsFromPercent(800, 600, 50);
    expect(result).toEqual({ width: 400, height: 300 });
  });

  it("keeps 100% unchanged", () => {
    const result = calculateDimensionsFromPercent(800, 600, 100);
    expect(result).toEqual({ width: 800, height: 600 });
  });

  it("scales to 200%", () => {
    const result = calculateDimensionsFromPercent(800, 600, 200);
    expect(result).toEqual({ width: 1600, height: 1200 });
  });

  it("clamps percent below 1 to 1", () => {
    const result = calculateDimensionsFromPercent(800, 600, 0);
    expect(result.width).toBeGreaterThanOrEqual(1);
    expect(result.height).toBeGreaterThanOrEqual(1);
  });

  it("clamps percent above 1000 to 1000", () => {
    const result = calculateDimensionsFromPercent(100, 100, 2000);
    expect(result).toEqual({ width: 1000, height: 1000 });
  });

  it("handles small images", () => {
    const result = calculateDimensionsFromPercent(2, 2, 50);
    expect(result).toEqual({ width: 1, height: 1 });
  });
});

describe("formatFileSize", () => {
  it("formats bytes", () => {
    expect(formatFileSize(500)).toBe("500 B");
  });

  it("formats 0 bytes", () => {
    expect(formatFileSize(0)).toBe("0 B");
  });

  it("formats KB", () => {
    expect(formatFileSize(1536)).toBe("1.5 KB");
  });

  it("formats exactly 1 KB", () => {
    expect(formatFileSize(1024)).toBe("1.0 KB");
  });

  it("formats MB", () => {
    expect(formatFileSize(1048576)).toBe("1.0 MB");
  });

  it("formats fractional MB", () => {
    expect(formatFileSize(2621440)).toBe("2.5 MB");
  });
});

describe("getOutputMimeType", () => {
  it("returns image/png for png", () => {
    expect(getOutputMimeType("image/png")).toBe("image/png");
  });

  it("returns image/jpeg for jpeg", () => {
    expect(getOutputMimeType("image/jpeg")).toBe("image/jpeg");
  });

  it("returns image/webp for webp", () => {
    expect(getOutputMimeType("image/webp")).toBe("image/webp");
  });

  it("defaults to image/png for unknown format", () => {
    expect(getOutputMimeType("image/gif")).toBe("image/png");
  });

  it("defaults to image/png for empty string", () => {
    expect(getOutputMimeType("")).toBe("image/png");
  });
});
