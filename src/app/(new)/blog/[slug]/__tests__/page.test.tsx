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

  describe("PlayRecommendBlock must be removed (cycle-188 要件: コンセプト不整合撤去)", () => {
    /**
     * cycle-188 再着手条件5: PlayRecommendBlock はブログ詳細から撤去する。
     * 「占い・診断ツールへの誘導」は新コンセプト「日常の傍にある道具」と整合しない。
     * コンポーネント本体 (dictionary 詳細等で継続利用) は削除しないが、
     * (new)/blog/[slug]/page.tsx からの import と JSX を削除する。
     */
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

    it("PlayRecommendBlock component itself is still importable (not deleted)", async () => {
      // コンポーネント本体は dictionary 詳細等で継続利用のため削除しない
      const imported = await import("@/play/_components/PlayRecommendBlock");
      expect(imported.default).toBeDefined();
    });
  });

  describe("新デザイン構造の検証 (cycle-188 採用案C)", () => {
    /**
     * 採用案 C: Panel コンポーネントで本文を囲む構造
     * - 新コンポーネント (@/components/Breadcrumb, @/components/ShareButtons, @/components/Panel) を使う
     * - TrustLevelBadge は撤去済み
     * - PlayRecommendBlock は撤去済み
     */
    it("page.tsx imports new-system Breadcrumb (@/components/Breadcrumb)", () => {
      const pagePath = path.resolve(__dirname, "../page.tsx");
      const source = fs.readFileSync(pagePath, "utf-8");
      // 旧コンポーネントパス (@/components/common/Breadcrumb) ではなく新パスを使うこと
      expect(source).toContain('@/components/Breadcrumb"');
    });

    it("page.tsx imports new-system ShareButtons (@/components/ShareButtons)", () => {
      const pagePath = path.resolve(__dirname, "../page.tsx");
      const source = fs.readFileSync(pagePath, "utf-8");
      // 旧コンポーネントパス (@/components/common/ShareButtons) ではなく新パスを使うこと
      expect(source).toContain('@/components/ShareButtons"');
    });

    it("page.tsx imports Panel component", () => {
      const pagePath = path.resolve(__dirname, "../page.tsx");
      const source = fs.readFileSync(pagePath, "utf-8");
      expect(source).toContain("Panel");
    });

    it("page.tsx does NOT import TrustLevelBadge", () => {
      const pagePath = path.resolve(__dirname, "../page.tsx");
      const source = fs.readFileSync(pagePath, "utf-8");
      expect(source).not.toContain("TrustLevelBadge");
    });

    it("page.tsx does NOT import from @/components/common/", () => {
      const pagePath = path.resolve(__dirname, "../page.tsx");
      const source = fs.readFileSync(pagePath, "utf-8");
      // 旧コンポーネントシステムを使わないこと
      expect(source).not.toContain("@/components/common/");
    });

    it("page.tsx includes RelatedArticles in JSX", () => {
      const pagePath = path.resolve(__dirname, "../page.tsx");
      const source = fs.readFileSync(pagePath, "utf-8");
      expect(source).toContain("RelatedArticles");
    });

    it("page.tsx includes SeriesNav in JSX", () => {
      const pagePath = path.resolve(__dirname, "../page.tsx");
      const source = fs.readFileSync(pagePath, "utf-8");
      expect(source).toContain("SeriesNav");
    });
  });
});
