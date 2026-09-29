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

    // 記事はセクションとそのあいだの全幅の罫線で組み（DESIGN.md §5 ページの割り方）、連載の案内と目次はそれぞれ
    // 自分のボックスを持つので、ページ全体を枠で包まない。
    it("page.tsx は Panel を使わないこと（記事はセクションと全幅の罫線で組む・§5）", () => {
      expect(source).not.toMatch(/<Panel\b/);
      expect(source).not.toContain('@/components/Panel"');
    });

    it("page.tsx に <RelatedArticles JSX タグが存在すること", () => {
      expect(source).toMatch(/<RelatedArticles\b/);
    });

    it("page.tsx に <SeriesNav JSX タグが存在すること", () => {
      expect(source).toMatch(/<SeriesNav\b/);
    });

    it("記事の頭・目次・連載の案内・本文を1つのセクションに置き、共有・関連記事・前後の記事をそれぞれセクションにすること（§5）", () => {
      expect(source).toContain('@/components/Section"');
      const order = [
        "<Breadcrumb",
        "<CollapsibleTOC",
        "<SeriesNav",
        "<Prose",
        "</Section>",
        "<ShareButtons",
        "</Section>",
        "<RelatedArticles",
        'aria-label="前後の記事（時系列順）"',
        "</Section>",
      ];
      let from = 0;
      for (const marker of order) {
        const at = source.indexOf(marker, from);
        expect(at, marker).toBeGreaterThanOrEqual(from);
        from = at + marker.length;
      }
    });

    it("目次に記事の slug を渡し、目次の計測の content_id にすること", () => {
      expect(source).toMatch(
        /<CollapsibleTOC\s+headings=\{post\.headings\}\s+contentId=\{post\.slug\}/,
      );
    });

    it("目次を本文と同じ要素の中に置き、本文を読み終えるまで目次が上端に留まること（§5）", () => {
      // 留まる要素は、自分を包む要素の中でだけ留まる。目次と本文を同じ .body に置く。
      const bodyStart = source.indexOf("<div className={styles.body}>");
      const bodyEnd = source.indexOf("</Section>", bodyStart);
      expect(bodyStart).toBeGreaterThanOrEqual(0);
      const body = source.slice(bodyStart, bodyEnd);
      expect(body).toContain("<CollapsibleTOC");
      expect(body).toContain("<Prose");
    });

    it("パンくずと主見出しのあいだを 16px にすること", () => {
      expect(css).toMatch(/\.header\s*\{[^}]*gap:\s*var\(--space-16\)/);
    });

    it("補助情報の字を §4 の下限（0.875rem）より小さくしないこと", () => {
      const sizes = [...css.matchAll(/font-size:\s*([^;]+);/g)].map(
        ([, value]) => value.trim(),
      );
      expect(sizes.every((size) => size === "var(--text-small)")).toBe(true);
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

  describe("構造化データ", () => {
    it("記事の JSON-LD の image と openGraph.images の url が、同じ画像の URL であること", async () => {
      const {
        default: BlogPostPage,
        generateMetadata,
        generateStaticParams,
      } = await import("../page");
      const [{ slug }] = generateStaticParams();
      const params = Promise.resolve({ slug });
      const page = await BlogPostPage({ params });
      const [script] = page.props.children;
      const jsonLd = JSON.parse(script.props.dangerouslySetInnerHTML.__html);
      const metadata = await generateMetadata({ params });
      const images = metadata.openGraph?.images as { url: string }[];
      expect(images).toHaveLength(1);
      expect(jsonLd.image).toBe(images[0].url);
      expect(jsonLd.image).toMatch(
        new RegExp(`/blog/${slug}/opengraph-image\\?v=[0-9a-f]{16}$`),
      );
    }, 60_000); // 記事の本文を Shiki で組むので、初めの1回は既定の時間を超えうる。

    it("記事のディレクトリに規約の画像のファイルを置かない（画像は Route Handler が描く）", () => {
      const dir = path.resolve(__dirname, "..");
      expect(fs.existsSync(path.join(dir, "opengraph-image.tsx"))).toBe(false);
      expect(fs.existsSync(path.join(dir, "twitter-image.tsx"))).toBe(false);
      expect(
        fs.existsSync(path.join(dir, "opengraph-image", "route.tsx")),
      ).toBe(true);
    });
  });

  describe("本文", () => {
    it("本文を markdown-preview と同じ組み方の Prose で出すこと", () => {
      expect(source).toMatch(/<Prose\s[^>]*html=\{post\.contentHtml\}/);
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
