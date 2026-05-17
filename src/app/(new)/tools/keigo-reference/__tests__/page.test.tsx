import { describe, it, expect, vi, beforeEach } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

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

// ソースコード静的検査（Component.tsx が DESIGN.md §5 準拠かを検証）
describe("page.tsx 静的検査", () => {
  const pageSource = readFileSync(
    join(process.cwd(), "src/app/(new)/tools/keigo-reference/page.tsx"),
    "utf8",
  );

  it("ToolDetailLayout を import している", () => {
    expect(pageSource).toContain("ToolDetailLayout");
  });

  it("ToolLayout を import していない（旧 (legacy) 系を使わない）", () => {
    expect(pageSource).not.toMatch(/import.*ToolLayout[^s]/);
  });

  it("ToolErrorBoundary を import していない（旧 (legacy) 系を使わない）", () => {
    // import 文に ToolErrorBoundary が含まれていないことを確認（コメントは除外）
    expect(pageSource).not.toMatch(/^import.*ToolErrorBoundary/m);
  });

  it("Breadcrumb を import している（致命2 対応: BreadcrumbList JSON-LD の可視 UI）", () => {
    expect(pageSource).toContain("Breadcrumb");
  });

  it("FaqSection を import している（致命2 対応: FAQ 可視 UI + FAQPage JSON-LD）", () => {
    expect(pageSource).toContain("FaqSection");
  });

  it("ShareButtons を import している（致命5 対応: 共有ボタン復活）", () => {
    expect(pageSource).toContain("ShareButtons");
  });

  it("RelatedTools を import している（致命5 対応: 関連ツール復活）", () => {
    expect(pageSource).toContain("RelatedTools");
  });

  it("RelatedBlogPosts を import している（致命5 対応: 関連記事復活）", () => {
    expect(pageSource).toContain("RelatedBlogPosts");
  });
});

describe("Component.tsx 静的検査（DESIGN.md §5 準拠確認）", () => {
  const componentSource = readFileSync(
    join(process.cwd(), "src/tools/keigo-reference/Component.tsx"),
    "utf8",
  );

  it("Button を @/components/Button から import している", () => {
    expect(componentSource).toContain('from "@/components/Button"');
  });

  it("Input を @/components/Input から import している", () => {
    expect(componentSource).toContain('from "@/components/Input"');
  });

  it("AccordionItem を import している（例文展開のキーボード対応）", () => {
    expect(componentSource).toContain("AccordionItem");
  });

  it("useToolStorage を import している（localStorage 永続化）", () => {
    expect(componentSource).toContain("useToolStorage");
  });

  it("生 <input> タグを直接書いていない（Input コンポーネントを経由する）", () => {
    // <Input は OK、<input は NG（生 HTML タグ直書き）
    expect(componentSource).not.toMatch(/<input\s/);
  });

  it("生 <button> タグを直接書いていない（Button コンポーネントを経由する）", () => {
    // <Button は OK、<button は NG（生 HTML タグ直書き）
    expect(componentSource).not.toMatch(/<button\s/);
  });
});

describe("Component.module.css 静的検査（旧 CSS トークン使用禁止）", () => {
  const cssSource = readFileSync(
    join(process.cwd(), "src/tools/keigo-reference/Component.module.css"),
    "utf8",
  );

  // var(--color-xxx) という実際の使用を検査する（コメント内の言及はヒットしない）
  it("旧トークン var(--color-border) を使っていない（致命1 対応）", () => {
    expect(cssSource).not.toMatch(/var\(--color-border\)/);
  });

  it("旧トークン var(--color-primary) を使っていない（致命1 対応）", () => {
    expect(cssSource).not.toMatch(/var\(--color-primary\)/);
  });

  it("旧トークン var(--color-bg) を使っていない（致命1 対応）", () => {
    expect(cssSource).not.toMatch(/var\(--color-bg\b/);
  });

  it("旧トークン var(--color-text) を使っていない（致命1 対応）", () => {
    expect(cssSource).not.toMatch(/var\(--color-text\b/);
  });

  it("旧トークン var(--color-text-muted) を使っていない（致命1 対応）", () => {
    expect(cssSource).not.toMatch(/var\(--color-text-muted\)/);
  });

  it("旧トークン var(--color-bg-secondary) を使っていない（致命1 対応）", () => {
    expect(cssSource).not.toMatch(/var\(--color-bg-secondary\)/);
  });

  it("新トークン --border を使っている（新体系確認）", () => {
    expect(cssSource).toContain("var(--border)");
  });

  it("新トークン --fg を使っている（新体系確認）", () => {
    expect(cssSource).toContain("var(--fg)");
  });
});
