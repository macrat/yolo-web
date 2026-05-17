import { describe, it, expect, vi, beforeEach } from "vitest";

// next/navigation モック
vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("notFound");
  }),
}));

describe("keigo-reference page.tsx (new)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("page.tsx モジュールが存在する（インポート可能）", async () => {
    const mod = await import("../page");
    expect(mod).toBeDefined();
    expect(typeof mod.default).toBe("function");
  });

  it("metadata がエクスポートされている", async () => {
    const mod = await import("../page");
    expect(mod.metadata).toBeDefined();
  });
});
