import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

// 各テストで何度も readFileSync するのを避けるため、モジュールロード時に一度だけ読む。
const pagePath = path.resolve(__dirname, "../page.tsx");
const cssPath = path.resolve(__dirname, "../page.module.css");
const footerCssPath = path.resolve(
  __dirname,
  "../../../../../components/Footer/Footer.module.css",
);
const headerCssPath = path.resolve(
  __dirname,
  "../../../../../components/Header/Header.module.css",
);
const buttonCssPath = path.resolve(
  __dirname,
  "../../../../../components/Button/Button.module.css",
);
const source = fs.readFileSync(pagePath, "utf-8");
const css = fs.readFileSync(cssPath, "utf-8");
const footerCss = fs.readFileSync(footerCssPath, "utf-8");
const headerCss = fs.readFileSync(headerCssPath, "utf-8");
const buttonCss = fs.readFileSync(buttonCssPath, "utf-8");

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
      expect(source).not.toContain("PlayRecommendBlock");
    });

    it("page.tsx does NOT import getPlayRecommendationsForBlog", () => {
      expect(source).not.toContain("getPlayRecommendationsForBlog");
    });
  });

  describe("新デザイン構造の検証", () => {
    it("page.tsx imports new-system Breadcrumb (@/components/Breadcrumb)", () => {
      expect(source).toContain('@/components/Breadcrumb"');
    });

    it("page.tsx imports new-system ShareButtons (@/components/ShareButtons)", () => {
      expect(source).toContain('@/components/ShareButtons"');
    });

    it("page.tsx に <Panel JSX タグが存在すること（コメントのみのマッチを除外）", () => {
      // "Panel" 文字列ではなく <Panel JSX 開始タグで検証する
      expect(source).toMatch(/<Panel\b/);
    });

    it("page.tsx does NOT import TrustLevelBadge", () => {
      expect(source).not.toContain("TrustLevelBadge");
    });

    it("page.tsx does NOT import from @/components/common/", () => {
      expect(source).not.toContain("@/components/common/");
    });

    it("page.tsx に <RelatedArticles JSX タグが存在すること", () => {
      expect(source).toMatch(/<RelatedArticles\b/);
    });

    it("page.tsx に <SeriesNav JSX タグが存在すること", () => {
      expect(source).toMatch(/<SeriesNav\b/);
    });

    it("page.tsx に contentColumn クラスの div が存在すること（Grid 右カラム wrapper）", () => {
      expect(source).toContain("contentColumn");
    });
  });

  describe("postNav は hasSeries に関わらず常時表示されること", () => {
    it("page.tsx の前後ナビが !hasSeries 条件なしで常時表示される", () => {
      // !hasSeries 条件でpostNavを隠す実装がないこと
      expect(source).not.toMatch(
        /!hasSeries[\s\S]*?postNav|postNav[\s\S]*?!hasSeries/,
      );
      expect(source).toMatch(/postNav/);
    });

    it("postNav ラベルはシリーズ有無に関わらず固定文言（前の記事 / 次の記事）であること", () => {
      // series ? "すべての記事から：..." : "..." の三項演算子が除去されていること
      expect(source).not.toContain("すべての記事から");
      // 固定文言「前の記事」「次の記事」が存在すること
      expect(source).toContain("前の記事");
      expect(source).toContain("次の記事");
      // aria-label による時系列順の明示は維持されること
      expect(source).toContain("時系列順");
    });
  });

  describe("page.module.css — CSS Grid によるレイアウト構造", () => {
    it("articleBody に display:grid が定義されていること（デスクトップ 2カラム Grid）", () => {
      expect(css).toContain("display: grid");
    });

    it("grid-template-columns: 1fr 220px が定義されていること（本文左・TOC右の配置）", () => {
      // 本文が残り全幅を占め TOC が 220px 固定で右端に配置される
      expect(css).toContain("1fr 220px");
    });

    it("articleMain に grid-column: 1 が定義されていること（左カラム固定）", () => {
      expect(css).toMatch(/\.articleMain[^{]*\{[^}]*grid-column:\s*1/);
    });

    it("articleAside に position:sticky が定義されていること（スクロール追従）", () => {
      expect(css).toMatch(/\.articleAside[^{]*\{[^}]*position:\s*sticky/);
    });

    it(".articleBody の :has() セレクタが .articleAside 配下に絞り込まれていること（SeriesNav 開閉や記事本文中の <details> で grid が動かない退行防止）", () => {
      // <details> 単独だと SeriesNav や記事本文中の <details> でも誤発火する。
      // .articleAside（TOC ラッパー専用クラス）配下に限定することで誤マッチを防ぐ。
      expect(css).toMatch(
        /\.articleBody:has\(\.articleAside\s+details:not\(\[open\]\)\)/,
      );
    });
  });

  describe("エの字レイアウト — DOM 構造の検証", () => {
    it("page.tsx に mobileToc クラスが存在しないこと（TOC 重複レンダリング撤廃）", () => {
      expect(source).not.toContain("mobileToc");
    });

    it("page.tsx に <CollapsibleTOC が1箇所のみ存在すること（a11y: nav ランドマーク重複なし）", () => {
      const matches = source.match(/<CollapsibleTOC\b/g);
      expect(matches).not.toBeNull();
      expect(matches!.length).toBe(1);
    });

    it("page.tsx は <TableOfContents を直接呼ばないこと（CollapsibleTOC 経由で1インスタンスにまとめる）", () => {
      // 直接 <TableOfContents JSX があると CollapsibleTOC 内のものと合わせて二重になる
      expect(source).not.toMatch(/<TableOfContents\b/);
    });

    it("page.tsx に articleBody クラスが存在すること（エの字中央ボディ）", () => {
      expect(source).toContain("articleBody");
    });

    it("page.tsx に articleAside クラスが存在すること（TOC サイドバー）", () => {
      expect(source).toContain("articleAside");
    });

    it("page.tsx に articleFooter クラスが存在すること（フッター横幅いっぱい）", () => {
      expect(source).toContain("articleFooter");
    });

    it("page.tsx の最上位ラッパーが <article タグであること（セマンティクス改善）", () => {
      expect(source).toMatch(/<article\s+className=\{styles\.contentColumn\}/);
    });
  });

  describe("contentColumn の幅・パディングがグローバルヘッダー/フッターと同期していること（cycle-188/189 で発生した右端ズレの退行防止）", () => {
    it(".contentColumn に max-width: 1200px が定義されていること", () => {
      expect(css).toMatch(/\.contentColumn[^{]*\{[^}]*max-width:\s*1200px/);
    });

    it(".contentColumn に padding: 2rem 1.25rem が定義されていること（左右 1.25rem は Header/Footer .inner と同値）", () => {
      expect(css).toMatch(
        /\.contentColumn[^{]*\{[^}]*padding:\s*2rem\s+1\.25rem/,
      );
    });

    it("Footer.module.css の .inner padding 横幅が 1.25rem であること（contentColumn と一致）", () => {
      expect(footerCss).toMatch(/\.inner[^{]*\{[^}]*padding:[^;}]*1\.25rem/);
    });

    it("Header.module.css の .inner padding 横幅が 1.25rem であること（contentColumn と一致）", () => {
      expect(headerCss).toMatch(/\.inner[^{]*\{[^}]*padding:[^;}]*1\.25rem/);
    });

    it("page.module.css の SP ブレークポイントは 720px（Header/Footer と一致）", () => {
      // サイト共通の SP ブレークポイントは 720px
      expect(css).toMatch(/@media\s*\(max-width:\s*720px\)/);
      expect(css).not.toMatch(/@media\s*\(max-width:\s*768px\)/);
    });
  });

  describe("page.module.css — ダーク pre 背景色", () => {
    it("ダーク時の prose pre に --bg-softer（body と異なる）背景が定義されていること", () => {
      // :global(.dark) .prose pre ルールが存在し、--bg-softer を使うこと
      expect(css).toMatch(
        /dark[\s\S]*?prose[\s\S]*?pre|prose[\s\S]*?pre[\s\S]*?dark/,
      );
      // --bg-softer（body と同色の --bg-soft ではない）が使われていること
      expect(css).toContain("--bg-softer");
    });
  });

  describe("WCAG 2.5.5: Button.module.css に min-height / min-width: 44px が定義されていること（cycle-193 案 10-α 根本対応）", () => {
    it("Button.module.css に min-height: 44px ルールが存在する", () => {
      expect(buttonCss).toMatch(/min-height:\s*44px/);
    });

    it("Button.module.css に min-width: 44px ルールが存在する", () => {
      expect(buttonCss).toMatch(/min-width:\s*44px/);
    });
  });
});
