import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

// 各テストで何度も readFileSync するのを避けるため、モジュールロード時に一度だけ読む。
const pagePath = path.resolve(__dirname, "../page.tsx");
const cssPath = path.resolve(__dirname, "../page.module.css");
// 共有のボタンは共通の Button で組むので、タップの標的の大きさは Button の CSS が持つ。
const buttonCssPath = path.resolve(
  __dirname,
  "../../../../components/Button/Button.module.css",
);
const source = fs.readFileSync(pagePath, "utf-8");
const css = fs.readFileSync(cssPath, "utf-8");
const buttonCss = fs.readFileSync(buttonCssPath, "utf-8");

describe("app/blog/[slug]/page", () => {
  describe("page module exports", () => {
    it("page module is importable and exports required functions", async () => {
      const pageModule = await import("../page");
      expect(pageModule.default).toBeDefined();
      expect(pageModule.generateStaticParams).toBeDefined();
      expect(pageModule.generateMetadata).toBeDefined();
    });
  });

  describe("記事のページの組み立て", () => {
    it("パンくずを共有の Breadcrumb で組むこと", () => {
      expect(source).toContain('@/components/Breadcrumb"');
    });

    it("共有のボタンを共有の ShareButtons で組むこと", () => {
      expect(source).toContain('@/components/ShareButtons"');
    });

    // 連載の案内と目次はそれぞれ自分の罫線を持つので、ページ全体を枠で包まない。
    it("page.tsx は Panel を使わないこと（読み物は矩形パネルに包まない・§4）", () => {
      expect(source).not.toMatch(/<Panel\b/);
      expect(source).not.toContain('@/components/Panel"');
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

  describe("前後の記事のリンク", () => {
    it("連載の有無で隠さないこと", () => {
      expect(source).not.toMatch(
        /!hasSeries[\s\S]*?postNav|postNav[\s\S]*?!hasSeries/,
      );
      expect(source).toMatch(/postNav/);
    });

    it("ラベルは「前の記事」「次の記事」で、時系列順であることを読み上げに伝えること", () => {
      expect(source).toContain("前の記事");
      expect(source).toContain("次の記事");
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

    it(".articleBody の :has() セレクタが .articleAside 配下に絞り込まれていること（連載の案内や記事の本文の <details> を開閉しても grid が動かないため）", () => {
      // 目次を包む .articleAside の中の <details> だけを見る。
      expect(css).toMatch(
        /\.articleBody:has\(\.articleAside\s+details:not\(\[open\]\)\)/,
      );
    });
  });

  describe("エの字レイアウト — DOM 構造の検証", () => {
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

    it("page.tsx の最上位ラッパーが <article タグであること（記事のまとまりを読み上げに伝える）", () => {
      expect(source).toMatch(/<article\s+className=\{styles\.contentColumn\}/);
    });
  });

  describe("本文カラムの横幅", () => {
    it(".contentColumn に max-width: var(--max-width) が定義されていること（コンテナの最大幅・§5）", () => {
      expect(css).toMatch(
        /\.contentColumn[^{]*\{[^}]*max-width:\s*var\(--max-width\)/,
      );
    });

    it(".contentColumn の横パディングが var(--space-24) であること（余白は 8px の倍数・§5）", () => {
      expect(css).toMatch(
        /\.contentColumn[^{]*\{[^}]*padding:[^;}]*var\(--space-24\)/,
      );
    });

    it("page.module.css の SP ブレークポイントは 720px", () => {
      expect(css).toMatch(/@media\s*\(max-width:\s*720px\)/);
    });
  });

  describe("page.module.css — 読む幅とコードブロックの背景", () => {
    it(".prose が --measure（読む幅）に絞られていること（本文の幅・§5）", () => {
      expect(css).toMatch(/\.prose[^{]*\{[^}]*max-width:\s*var\(--measure\)/);
    });

    it("prose pre のフォールバック背景に --paper-2（コードのボックスの背景・§2）が使われていること", () => {
      expect(css).toMatch(/\.prose pre[^{]*\{[^}]*var\(--paper-2\)/);
    });

    it("Shiki dual-theme の dark 配色が端末の設定（prefers-color-scheme: dark）で当たること", () => {
      expect(css).toMatch(
        /@media \(prefers-color-scheme: dark\)\s*\{\s*\.prose\s*:global\(\.shiki\)/,
      );
    });
  });

  describe("共有のボタンのタップの標的が 44px 以上であること（§6）", () => {
    it("Button.module.css に min-height: 44px ルールが存在する", () => {
      expect(buttonCss).toMatch(/min-height:\s*44px/);
    });

    it("Button.module.css に min-width: 44px ルールが存在する", () => {
      expect(buttonCss).toMatch(/min-width:\s*44px/);
    });
  });
});
