import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

describe("(new)/blog/[slug]/page", () => {
  describe("page module exports", () => {
    it("page module is importable and exports required functions", async () => {
      const pageModule = await import("../page");
      expect(pageModule.default).toBeDefined();
      expect(pageModule.generateStaticParams).toBeDefined();
      expect(pageModule.generateMetadata).toBeDefined();
    });
  });

  describe("PlayRecommendBlock が撤去されていること（コンセプト不整合撤去）", () => {
    it("page.tsx does NOT import PlayRecommendBlock", () => {
      const pagePath = path.resolve(__dirname, "../page.tsx");
      const source = fs.readFileSync(pagePath, "utf-8");
      expect(source).not.toContain("PlayRecommendBlock");
    });

    it("page.tsx does NOT import getPlayRecommendationsForBlog", () => {
      const pagePath = path.resolve(__dirname, "../page.tsx");
      const source = fs.readFileSync(pagePath, "utf-8");
      expect(source).not.toContain("getPlayRecommendationsForBlog");
    });
  });

  describe("新デザイン構造の検証", () => {
    it("page.tsx imports new-system Breadcrumb (@/components/Breadcrumb)", () => {
      const pagePath = path.resolve(__dirname, "../page.tsx");
      const source = fs.readFileSync(pagePath, "utf-8");
      expect(source).toContain('@/components/Breadcrumb"');
    });

    it("page.tsx imports new-system ShareButtons (@/components/ShareButtons)", () => {
      const pagePath = path.resolve(__dirname, "../page.tsx");
      const source = fs.readFileSync(pagePath, "utf-8");
      expect(source).toContain('@/components/ShareButtons"');
    });

    it("page.tsx に <Panel JSX タグが存在すること（コメントのみのマッチを除外）", () => {
      const pagePath = path.resolve(__dirname, "../page.tsx");
      const source = fs.readFileSync(pagePath, "utf-8");
      // "Panel" 文字列ではなく <Panel JSX 開始タグで検証する
      expect(source).toMatch(/<Panel\b/);
    });

    it("page.tsx does NOT import TrustLevelBadge", () => {
      const pagePath = path.resolve(__dirname, "../page.tsx");
      const source = fs.readFileSync(pagePath, "utf-8");
      expect(source).not.toContain("TrustLevelBadge");
    });

    it("page.tsx does NOT import from @/components/common/", () => {
      const pagePath = path.resolve(__dirname, "../page.tsx");
      const source = fs.readFileSync(pagePath, "utf-8");
      expect(source).not.toContain("@/components/common/");
    });

    it("page.tsx に <RelatedArticles JSX タグが存在すること", () => {
      const pagePath = path.resolve(__dirname, "../page.tsx");
      const source = fs.readFileSync(pagePath, "utf-8");
      expect(source).toMatch(/<RelatedArticles\b/);
    });

    it("page.tsx に <SeriesNav JSX タグが存在すること", () => {
      const pagePath = path.resolve(__dirname, "../page.tsx");
      const source = fs.readFileSync(pagePath, "utf-8");
      expect(source).toMatch(/<SeriesNav\b/);
    });

    it("page.tsx に contentColumn クラスの div が存在すること（Grid 右カラム wrapper）", () => {
      const pagePath = path.resolve(__dirname, "../page.tsx");
      const source = fs.readFileSync(pagePath, "utf-8");
      // contentColumn wrapper で Next.js 注入 script による Grid ズレを防ぐ
      expect(source).toContain("contentColumn");
    });
  });

  describe("postNav は hasSeries に関わらず常時表示されること", () => {
    it("page.tsx の前後ナビが !hasSeries 条件なしで常時表示される", () => {
      const pagePath = path.resolve(__dirname, "../page.tsx");
      const source = fs.readFileSync(pagePath, "utf-8");
      // !hasSeries 条件でpostNavを隠す実装がないこと
      expect(source).not.toMatch(
        /!hasSeries[\s\S]*?postNav|postNav[\s\S]*?!hasSeries/,
      );
      // postNav JSX が存在すること
      expect(source).toMatch(/postNav/);
    });

    it("シリーズ記事での postNav ラベルは時系列であることが明示されること", () => {
      const pagePath = path.resolve(__dirname, "../page.tsx");
      const source = fs.readFileSync(pagePath, "utf-8");
      // 「すべての記事から」または「時系列」のラベルが存在すること
      expect(source).toMatch(/すべての記事|時系列/);
    });
  });

  describe("page.module.css — CSS Grid によるレイアウト構造", () => {
    it("proseWrapper に display:grid が定義されていること（デスクトップ 2カラム Grid）", () => {
      const cssPath = path.resolve(__dirname, "../page.module.css");
      const css = fs.readFileSync(cssPath, "utf-8");
      // @media ブロック内で display: grid が存在すればよい
      expect(css).toContain("display: grid");
    });

    it("grid-template-columns: 220px 720px が定義されていること（TOC + 本文幅の固定）", () => {
      const cssPath = path.resolve(__dirname, "../page.module.css");
      const css = fs.readFileSync(cssPath, "utf-8");
      expect(css).toContain("220px 720px");
    });

    it("contentColumn に grid-column: 2 が定義されていること（Next.js 注入 script の影響回避）", () => {
      const cssPath = path.resolve(__dirname, "../page.module.css");
      const css = fs.readFileSync(cssPath, "utf-8");
      // contentColumn が grid-column: 2 を明示して右カラムを固定すること
      expect(css).toMatch(/\.contentColumn[^{]*\{[^}]*grid-column:\s*2/);
    });

    it("tocSidebar に position:sticky が定義されていること（スクロール追従）", () => {
      const cssPath = path.resolve(__dirname, "../page.module.css");
      const css = fs.readFileSync(cssPath, "utf-8");
      // tocSidebar が sticky で追従すること
      expect(css).toMatch(/\.tocSidebar[^{]*\{[^}]*position:\s*sticky/);
    });

    it("ライトモードの articlePanel border-color は --border（弱め）であること", () => {
      const cssPath = path.resolve(__dirname, "../page.module.css");
      const css = fs.readFileSync(cssPath, "utf-8");
      // .articlePanel のデフォルト border-color は --border（--border-strong ではない）
      // ダーク専用に --border-strong を使う
      expect(css).toMatch(
        /\.articlePanel[^{]*\{[^}]*border-color:\s*var\(--border\)/,
      );
    });
  });

  describe("page.module.css — ダーク pre 背景色", () => {
    it("ダーク時の prose pre に --bg-softer（body と異なる）背景が定義されていること", () => {
      const cssPath = path.resolve(__dirname, "../page.module.css");
      const css = fs.readFileSync(cssPath, "utf-8");
      // :global(.dark) .prose pre ルールが存在し、--bg-softer を使うこと
      expect(css).toMatch(
        /dark[\s\S]*?prose[\s\S]*?pre|prose[\s\S]*?pre[\s\S]*?dark/,
      );
      // --bg-softer（body と同色の --bg-soft ではない）が使われていること
      expect(css).toContain("--bg-softer");
    });
  });

  describe("WCAG 2.5.5: ShareButtons.module.css に min-height: 44px が定義されていること", () => {
    it("ShareButtons.module.css に min-height: 44px ルールが存在する", () => {
      // __tests__/ → [slug]/ → blog/ → (new)/ → app/ → src/ → components/
      const cssPath = path.resolve(
        __dirname,
        "../../../../../components/ShareButtons/ShareButtons.module.css",
      );
      const css = fs.readFileSync(cssPath, "utf-8");
      expect(css).toMatch(/min-height:\s*44px/);
    });

    it("ShareButtons.module.css に min-width: 44px ルールが存在する", () => {
      const cssPath = path.resolve(
        __dirname,
        "../../../../../components/ShareButtons/ShareButtons.module.css",
      );
      const css = fs.readFileSync(cssPath, "utf-8");
      expect(css).toMatch(/min-width:\s*44px/);
    });
  });
});
