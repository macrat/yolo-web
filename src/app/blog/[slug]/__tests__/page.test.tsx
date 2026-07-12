import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

// 各テストで何度も readFileSync するのを避けるため、モジュールロード時に一度だけ読む。
const pagePath = path.resolve(__dirname, "../page.tsx");
const cssPath = path.resolve(__dirname, "../page.module.css");
const footerCssPath = path.resolve(
  __dirname,
  "../../../../components/Footer/Footer.module.css",
);
const headerCssPath = path.resolve(
  __dirname,
  "../../../../components/Header/Header.module.css",
);
const shareButtonsCssPath = path.resolve(
  __dirname,
  "../../../../components/ShareButtons/ShareButtons.module.css",
);
const source = fs.readFileSync(pagePath, "utf-8");
const css = fs.readFileSync(cssPath, "utf-8");
const footerCss = fs.readFileSync(footerCssPath, "utf-8");
const headerCss = fs.readFileSync(headerCssPath, "utf-8");
const shareButtonsCss = fs.readFileSync(shareButtonsCssPath, "utf-8");

describe("app/blog/[slug]/page", () => {
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

    // DESIGN.md フェーズ R（C5・cycle-279）: 読み物本文を Panel の矩形コンテナから
    // 解放し、読む幅 --measure に絞ったテキスト列として直接置く構造へ変換した。
    // SeriesNav・TOC 等の区画は各コンポーネント自身が罫囲みを持つため、
    // page.tsx から Panel への依存はなくなった。
    it("page.tsx は Panel を使わないこと（読み物は矩形パネルに包まない・§4）", () => {
      expect(source).not.toMatch(/<Panel\b/);
      expect(source).not.toContain('@/components/Panel"');
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

  // cycle-188/189 の右端ズレ退行防止ガード。cycle-279 フェーズR で のれん/Footer(chrome) は
  // 新デザイン（横パディング=var(--space-16)=§4 の 8px スケール・--max-width）へ移行済み。
  // C5（blog 移行・本テスト更新時点）で blog 本文カラムも新デザイン基準（--max-width・
  // --space スケール）へ揃えた。
  describe("グローバルヘッダー/フッターと本文カラムの横幅整列（cycle-188/189 退行防止・C5で本文も新デザインへ移行）", () => {
    it(".contentColumn に max-width: var(--max-width) が定義されていること（新デザイン・操作面の最大幅）", () => {
      expect(css).toMatch(
        /\.contentColumn[^{]*\{[^}]*max-width:\s*var\(--max-width\)/,
      );
    });

    it(".contentColumn の横パディングが var(--space-24) であること（新デザインの 8px スケール）", () => {
      expect(css).toMatch(
        /\.contentColumn[^{]*\{[^}]*padding:[^;}]*var\(--space-24\)/,
      );
    });

    it("Footer.module.css の .inner 横パディングが var(--space-16) であること（新デザイン chrome の一貫性）", () => {
      expect(footerCss).toMatch(
        /\.inner[^{]*\{[^}]*padding:[^;}]*var\(--space-16\)/,
      );
    });

    it("Header.module.css の .inner 横パディングが var(--space-16) であること（新デザイン chrome の一貫性）", () => {
      expect(headerCss).toMatch(
        /\.inner[^{]*\{[^}]*padding:[^;}]*var\(--space-16\)/,
      );
    });

    it("page.module.css の SP ブレークポイントは 720px（Header/Footer と一致）", () => {
      // サイト共通の SP ブレークポイントは 720px
      expect(css).toMatch(/@media\s*\(max-width:\s*720px\)/);
      expect(css).not.toMatch(/@media\s*\(max-width:\s*768px\)/);
    });
  });

  describe("page.module.css — 読む幅とコードブロックの背景", () => {
    it(".prose が --measure（読む幅）に絞られていること（DESIGN.md §4「本文幅と操作幅」）", () => {
      expect(css).toMatch(/\.prose[^{]*\{[^}]*max-width:\s*var\(--measure\)/);
    });

    it("prose pre のフォールバック背景に --paper-2（一段沈む面・light/dark 両対応）が使われていること", () => {
      expect(css).toMatch(/\.prose pre[^{]*\{[^}]*var\(--paper-2\)/);
    });

    it("Shiki dual-theme 切替（:global(.dark) .shiki）は維持されていること", () => {
      expect(css).toMatch(/:global\(\.dark\)\s*\.prose\s*:global\(\.shiki\)/);
    });
  });

  describe("WCAG 2.5.5: ShareButtons.module.css に min-height: 44px が定義されていること", () => {
    it("ShareButtons.module.css に min-height: 44px ルールが存在する", () => {
      expect(shareButtonsCss).toMatch(/min-height:\s*44px/);
    });

    it("ShareButtons.module.css に min-width: 44px ルールが存在する", () => {
      expect(shareButtonsCss).toMatch(/min-width:\s*44px/);
    });
  });
});
