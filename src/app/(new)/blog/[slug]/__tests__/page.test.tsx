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
    it("articleBody に display:grid が定義されていること（デスクトップ 2カラム Grid）", () => {
      const cssPath = path.resolve(__dirname, "../page.module.css");
      const css = fs.readFileSync(cssPath, "utf-8");
      // @media ブロック内で display: grid が存在すればよい
      expect(css).toContain("display: grid");
    });

    it("grid-template-columns: 1fr 220px が定義されていること（本文左・TOC右の配置）", () => {
      const cssPath = path.resolve(__dirname, "../page.module.css");
      const css = fs.readFileSync(cssPath, "utf-8");
      // 本文が残り全幅を占め TOC が 220px 固定で右端に配置される
      expect(css).toContain("1fr 220px");
    });

    it("articleMain に grid-column: 1 が定義されていること（左カラム固定）", () => {
      const cssPath = path.resolve(__dirname, "../page.module.css");
      const css = fs.readFileSync(cssPath, "utf-8");
      // articleMain が grid-column: 1 を明示して左カラムに固定されること
      expect(css).toMatch(/\.articleMain[^{]*\{[^}]*grid-column:\s*1/);
    });

    it("articleAside に position:sticky が定義されていること（スクロール追従）", () => {
      const cssPath = path.resolve(__dirname, "../page.module.css");
      const css = fs.readFileSync(cssPath, "utf-8");
      // articleAside が sticky で記事読み進めても TOC が追従すること
      expect(css).toMatch(/\.articleAside[^{]*\{[^}]*position:\s*sticky/);
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

  describe("エの字レイアウト — DOM 構造の検証", () => {
    it("page.tsx に mobileToc クラスが存在しないこと（TOC 重複レンダリング撤廃）", () => {
      const pagePath = path.resolve(__dirname, "../page.tsx");
      const source = fs.readFileSync(pagePath, "utf-8");
      // mobileToc の <details> ブロックが削除されていること
      expect(source).not.toContain("mobileToc");
    });

    it("page.tsx に <CollapsibleTOC が1箇所のみ存在すること（a11y: nav ランドマーク重複なし）", () => {
      const pagePath = path.resolve(__dirname, "../page.tsx");
      const source = fs.readFileSync(pagePath, "utf-8");
      // TOC が1インスタンスのみで aria-label="Table of contents" nav が重複しない
      const matches = source.match(/<CollapsibleTOC\b/g);
      expect(matches).not.toBeNull();
      expect(matches!.length).toBe(1);
    });

    it("page.tsx は <TableOfContents を直接呼ばないこと（CollapsibleTOC 経由で1インスタンスにまとめる）", () => {
      const pagePath = path.resolve(__dirname, "../page.tsx");
      const source = fs.readFileSync(pagePath, "utf-8");
      // 直接 <TableOfContents JSX があると、CollapsibleTOC 内のものと合わせて
      // DOM に nav ランドマークが二重に出る
      expect(source).not.toMatch(/<TableOfContents\b/);
    });

    it("page.tsx に articleBody クラスが存在すること（エの字中央ボディ）", () => {
      const pagePath = path.resolve(__dirname, "../page.tsx");
      const source = fs.readFileSync(pagePath, "utf-8");
      expect(source).toContain("articleBody");
    });

    it("page.tsx に articleAside クラスが存在すること（TOC サイドバー）", () => {
      const pagePath = path.resolve(__dirname, "../page.tsx");
      const source = fs.readFileSync(pagePath, "utf-8");
      expect(source).toContain("articleAside");
    });

    it("page.tsx に articleFooter クラスが存在すること（フッター横幅いっぱい）", () => {
      const pagePath = path.resolve(__dirname, "../page.tsx");
      const source = fs.readFileSync(pagePath, "utf-8");
      expect(source).toContain("articleFooter");
    });

    it("page.tsx の最上位ラッパーが <article タグであること（セマンティクス改善）", () => {
      const pagePath = path.resolve(__dirname, "../page.tsx");
      const source = fs.readFileSync(pagePath, "utf-8");
      // return 直後の最上位要素が <article
      expect(source).toMatch(/<article\s+className=\{styles\.contentColumn\}/);
    });
  });

  describe("contentColumn の幅・パディングがグローバルヘッダー/フッターと同期していること（cycle-188/189 で発生した右端ズレの退行防止）", () => {
    it(".contentColumn に max-width: 1200px が定義されていること", () => {
      const cssPath = path.resolve(__dirname, "../page.module.css");
      const css = fs.readFileSync(cssPath, "utf-8");
      expect(css).toMatch(/\.contentColumn[^{]*\{[^}]*max-width:\s*1200px/);
    });

    it(".contentColumn に padding: 2rem 1.25rem が定義されていること（左右 1.25rem は Header/Footer .inner と同値）", () => {
      const cssPath = path.resolve(__dirname, "../page.module.css");
      const css = fs.readFileSync(cssPath, "utf-8");
      expect(css).toMatch(
        /\.contentColumn[^{]*\{[^}]*padding:\s*2rem\s+1\.25rem/,
      );
    });

    it("Footer.module.css の .inner padding 横幅が 1.25rem であること（contentColumn と一致）", () => {
      const footerCssPath = path.resolve(
        __dirname,
        "../../../../../components/Footer/Footer.module.css",
      );
      const footerCss = fs.readFileSync(footerCssPath, "utf-8");
      // padding の左右値が 1.25rem であること（Header と Footer の .inner で揃える）
      expect(footerCss).toMatch(/\.inner[^{]*\{[^}]*padding:[^;}]*1\.25rem/);
    });

    it("Header.module.css の .inner padding 横幅が 1.25rem であること（contentColumn と一致）", () => {
      const headerCssPath = path.resolve(
        __dirname,
        "../../../../../components/Header/Header.module.css",
      );
      const headerCss = fs.readFileSync(headerCssPath, "utf-8");
      expect(headerCss).toMatch(/\.inner[^{]*\{[^}]*padding:[^;}]*1\.25rem/);
    });

    it("page.module.css の SP ブレークポイントは 720px（Header/Footer と一致）", () => {
      const cssPath = path.resolve(__dirname, "../page.module.css");
      const css = fs.readFileSync(cssPath, "utf-8");
      // サイト共通の SP ブレークポイントは 720px。ここだけ 768px などにしない
      expect(css).toMatch(/@media\s*\(max-width:\s*720px\)/);
      expect(css).not.toMatch(/@media\s*\(max-width:\s*768px\)/);
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
