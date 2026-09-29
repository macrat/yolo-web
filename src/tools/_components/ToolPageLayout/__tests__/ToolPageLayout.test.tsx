import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { readFileSync } from "fs";
import { resolve } from "path";

// --- モック設定 ---

// allToolMetas と registry のモック
vi.mock("@/tools/registry", () => ({
  allToolMetas: [
    {
      slug: "base64",
      name: "Base64エンコード・デコード",
      shortDescription: "テキストをBase64形式に変換・復元するツール",
      nameEn: "Base64 Encoder/Decoder",
      description: "テスト用",
      keywords: [],
      category: "data",
      relatedSlugs: ["char-count"],
      publishedAt: "2026-01-01T00:00:00+09:00",
      structuredDataType: "WebApplication",
      howItWorks: "テスト用",
    },
    {
      slug: "char-count",
      name: "文字数カウンター",
      shortDescription: "テキストの文字数・バイト数を数えるツール",
      nameEn: "Character Counter",
      description: "テスト用",
      keywords: [],
      category: "text",
      relatedSlugs: [],
      publishedAt: "2026-01-01T00:00:00+09:00",
      structuredDataType: "WebApplication",
      howItWorks: "テスト用",
    },
  ],
}));

// cross-links のモック
vi.mock("@/lib/cross-links", () => ({
  getBlogPostsReferencing: vi.fn().mockReturnValue([]),
}));

// date のモック
vi.mock("@/lib/date", () => ({
  formatDate: vi.fn((s: string) => s.slice(0, 10)),
}));

// seo ライブラリのモック（JSON-LDが出力されるかを確認するため簡易実装）
vi.mock("@/lib/seo", () => ({
  generateBreadcrumbJsonLd: vi.fn(() => ({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [],
  })),
  generateFaqPageJsonLd: vi.fn((faq) => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f: { question: string; answer: string }) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  })),
  safeJsonLdStringify: vi.fn((data) => JSON.stringify(data)),
}));

import ToolPageLayout from "../index";
import type { ToolMeta } from "@/tools/types";
import { followsPhraseRules, splitIntoPhrases } from "@/lib/phrase-breaks";

// テスト用の最小 ToolMeta
const baseMeta: ToolMeta = {
  slug: "base64",
  name: "Base64エンコード・デコード",
  nameEn: "Base64 Encoder/Decoder",
  description: "テスト用の description",
  shortDescription: "テキストをBase64形式に変換・復元するツール",
  keywords: ["base64", "エンコード"],
  category: "data",
  relatedSlugs: ["char-count"],
  publishedAt: "2026-01-01T00:00:00+09:00",
  howItWorks: "ブラウザ上でBase64のエンコード・デコードを処理します。",
  faq: [
    { question: "テスト質問1", answer: "テスト回答1" },
    { question: "テスト質問2", answer: "テスト回答2" },
  ],
};

describe("ToolPageLayout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // --- 並ぶ要素 ---

  it("パンくずリスト（Breadcrumb）が描画される", () => {
    render(
      <ToolPageLayout meta={baseMeta}>
        <div>ツール本体</div>
      </ToolPageLayout>,
    );
    expect(
      screen.getByRole("navigation", { name: "パンくずリスト" }),
    ).toBeInTheDocument();
  });

  it("h1 に meta.name が描画される", () => {
    render(
      <ToolPageLayout meta={baseMeta}>
        <div>ツール本体</div>
      </ToolPageLayout>,
    );
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Base64エンコード・デコード",
      }),
    ).toBeInTheDocument();
  });

  it("「このツールについて」は短い説明・仕組み・プライバシーの注記の順の段落で、見出しを名前に持つ", () => {
    render(
      <ToolPageLayout meta={baseMeta}>
        <div>ツール本体</div>
      </ToolPageLayout>,
    );
    const about = screen.getByRole("region", { name: "このツールについて" });
    const paragraphs = Array.from(about.querySelectorAll("p")).map(
      (p) => p.textContent,
    );
    expect(paragraphs).toEqual([
      "テキストをBase64形式に変換・復元するツール",
      "ブラウザ上でBase64のエンコード・デコードを処理します。",
      "このツールはブラウザ上で動作します。入力データがサーバーに送信されることはありません。",
    ]);
  });

  it("短い説明は頭（パンくずと h1 と道具の本体のセクション）に置かない", () => {
    const { container } = render(
      <ToolPageLayout meta={baseMeta}>
        <div data-testid="tool-body">ツール本体</div>
      </ToolPageLayout>,
    );
    const firstSection = container.querySelector("section");
    expect(firstSection).toContainElement(
      screen.getByRole("heading", { level: 1 }),
    );
    expect(firstSection).toContainElement(screen.getByTestId("tool-body"));
    expect(firstSection).not.toHaveTextContent(
      "テキストをBase64形式に変換・復元するツール",
    );
  });

  it("ページはセクションを兄弟として並べ、道具の本体を h1 と同じ最初のセクションに置く（DESIGN.md §5）", () => {
    const { container } = render(
      <ToolPageLayout meta={baseMeta}>
        <div data-testid="tool-body">ツール本体</div>
      </ToolPageLayout>,
    );
    const sections = Array.from(container.children).filter(
      (el) => el.tagName === "SECTION",
    );
    const headings = sections.map(
      (section) => section.querySelector("h1, h2")?.textContent,
    );
    expect(headings).toEqual([
      "Base64エンコード・デコード",
      "このツールについて",
      "よくある質問",
      "このツールを勧める",
      "関連ツール",
    ]);
  });

  it("children（ツール本体）が描画される", () => {
    render(
      <ToolPageLayout meta={baseMeta}>
        <div data-testid="tool-body">ツール本体コンテンツ</div>
      </ToolPageLayout>,
    );
    expect(screen.getByTestId("tool-body")).toBeInTheDocument();
    expect(screen.getByText("ツール本体コンテンツ")).toBeInTheDocument();
  });

  it("「このツールについて」のセクションが描画される", () => {
    render(
      <ToolPageLayout meta={baseMeta}>
        <div>ツール本体</div>
      </ToolPageLayout>,
    );
    expect(
      screen.getByText(
        "ブラウザ上でBase64のエンコード・デコードを処理します。",
      ),
    ).toBeInTheDocument();
  });

  it("プライバシーノートが描画される（固定文言）", () => {
    render(
      <ToolPageLayout meta={baseMeta}>
        <div>ツール本体</div>
      </ToolPageLayout>,
    );
    expect(
      screen.getByText(
        "このツールはブラウザ上で動作します。入力データがサーバーに送信されることはありません。",
      ),
    ).toBeInTheDocument();
  });

  it("FAQ セクション（FaqSection）が描画される（meta.faq がある場合）", () => {
    render(
      <ToolPageLayout meta={baseMeta}>
        <div>ツール本体</div>
      </ToolPageLayout>,
    );
    expect(
      screen.getByRole("region", { name: "よくある質問" }),
    ).toBeInTheDocument();
    expect(screen.getByText("テスト質問1")).toBeInTheDocument();
  });

  it("ShareButtons が描画される（「このツールを勧める」のセクション）", () => {
    render(
      <ToolPageLayout meta={baseMeta}>
        <div>ツール本体</div>
      </ToolPageLayout>,
    );
    expect(
      screen.getByRole("heading", { level: 2, name: "このツールを勧める" }),
    ).toBeInTheDocument();
    expect(screen.getByText("X でシェア")).toBeInTheDocument();
  });

  it("関連ツール（RelatedTools）が描画される（relatedSlugs がある場合）", () => {
    render(
      <ToolPageLayout meta={baseMeta}>
        <div>ツール本体</div>
      </ToolPageLayout>,
    );
    expect(
      screen.getByRole("list", { name: "関連ツール" }),
    ).toBeInTheDocument();
  });

  // --- 要素並び順の検証（DOM 上の順序） ---

  it("パンくず→h1→children→「このツールについて」の順序で DOM に出現する", () => {
    const { container } = render(
      <ToolPageLayout meta={baseMeta}>
        <div data-testid="tool-body">ツール本体</div>
      </ToolPageLayout>,
    );

    const allElements = container.querySelectorAll(
      "nav[aria-label='パンくずリスト'], h1, [data-testid='tool-body'], [aria-labelledby='about-tool-heading']",
    );

    // パンくず → h1 → ツール本体 → 「このツールについて」の順
    const breadcrumbIdx = Array.from(allElements).findIndex(
      (el) => el.getAttribute("aria-label") === "パンくずリスト",
    );
    const h1Idx = Array.from(allElements).findIndex(
      (el) => el.tagName.toLowerCase() === "h1",
    );
    const toolBodyIdx = Array.from(allElements).findIndex(
      (el) => el.getAttribute("data-testid") === "tool-body",
    );
    const aboutIdx = Array.from(allElements).findIndex(
      (el) => el.getAttribute("aria-labelledby") === "about-tool-heading",
    );

    expect(breadcrumbIdx).toBeLessThan(h1Idx);
    expect(h1Idx).toBeLessThan(toolBodyIdx);
    expect(toolBodyIdx).toBeLessThan(aboutIdx);
  });

  // --- children が空でも並びが崩れない ---

  it("children が null でも「このツールについて」以降が描画される", () => {
    render(<ToolPageLayout meta={baseMeta}>{null}</ToolPageLayout>);
    // 「このツールについて」が描画される
    expect(
      screen.getByText(
        "ブラウザ上でBase64のエンコード・デコードを処理します。",
      ),
    ).toBeInTheDocument();
    // プライバシーノートが描画される
    expect(
      screen.getByText(
        "このツールはブラウザ上で動作します。入力データがサーバーに送信されることはありません。",
      ),
    ).toBeInTheDocument();
    // FAQ が描画される
    expect(
      screen.getByRole("region", { name: "よくある質問" }),
    ).toBeInTheDocument();
  });

  it("children が空要素でも「このツールについて」以降が描画される", () => {
    render(
      <ToolPageLayout meta={baseMeta}>
        <></>
      </ToolPageLayout>,
    );
    expect(
      screen.getByText(
        "ブラウザ上でBase64のエンコード・デコードを処理します。",
      ),
    ).toBeInTheDocument();
  });

  // --- JSON-LD の保持 ---

  it("BreadcrumbList JSON-LD が出力される（Breadcrumb 経由）", () => {
    const { container } = render(
      <ToolPageLayout meta={baseMeta}>
        <div>ツール本体</div>
      </ToolPageLayout>,
    );
    const scripts = container.querySelectorAll(
      'script[type="application/ld+json"]',
    );
    const jsonLdTexts = Array.from(scripts).map((s) => s.textContent ?? "");
    const hasBreadcrumb = jsonLdTexts.some((text) => {
      try {
        const parsed = JSON.parse(text);
        return parsed["@type"] === "BreadcrumbList";
      } catch {
        return false;
      }
    });
    expect(hasBreadcrumb).toBe(true);
  });

  it("FAQPage JSON-LD が出力される（FaqSection 経由）", () => {
    const { container } = render(
      <ToolPageLayout meta={baseMeta}>
        <div>ツール本体</div>
      </ToolPageLayout>,
    );
    const scripts = container.querySelectorAll(
      'script[type="application/ld+json"]',
    );
    const jsonLdTexts = Array.from(scripts).map((s) => s.textContent ?? "");
    const hasFaqPage = jsonLdTexts.some((text) => {
      try {
        const parsed = JSON.parse(text);
        return parsed["@type"] === "FAQPage";
      } catch {
        return false;
      }
    });
    expect(hasFaqPage).toBe(true);
  });

  it("WebApplication JSON-LD をこの器自体は出力しない（page.tsx 側に委ねる）", () => {
    const { container } = render(
      <ToolPageLayout meta={baseMeta}>
        <div>ツール本体</div>
      </ToolPageLayout>,
    );
    const scripts = container.querySelectorAll(
      'script[type="application/ld+json"]',
    );
    const jsonLdTexts = Array.from(scripts).map((s) => s.textContent ?? "");
    const hasWebApp = jsonLdTexts.some((text) => {
      try {
        const parsed = JSON.parse(text);
        return parsed["@type"] === "WebApplication";
      } catch {
        return false;
      }
    });
    expect(hasWebApp).toBe(false);
  });

  // --- meta.faq が undefined の場合 ---

  it("meta.faq が undefined のとき FAQ セクションが描画されない", () => {
    const metaWithoutFaq: ToolMeta = { ...baseMeta, faq: undefined };
    render(
      <ToolPageLayout meta={metaWithoutFaq}>
        <div>ツール本体</div>
      </ToolPageLayout>,
    );
    expect(
      screen.queryByRole("region", { name: "よくある質問" }),
    ).not.toBeInTheDocument();
  });

  // --- CSS 規約チェック ---

  it("CSS: 見出しの大きさを上書きせず、h1・h2 の既定（§4 の主見出し・セクションの見出し）に任せる", () => {
    const cssPath = resolve(__dirname, "../ToolPageLayout.module.css");
    const css = readFileSync(cssPath, "utf-8");
    const sizes = css.match(/font-size\s*:[^;]*/g) ?? [];
    expect(sizes).toEqual(["font-size: var(--text-small)"]);
  });

  it("CSS: 長文テキストに --measure（読む面）制限が含まれる（DESIGN.md §5）", () => {
    const cssPath = resolve(__dirname, "../ToolPageLayout.module.css");
    const css = readFileSync(cssPath, "utf-8");
    expect(css).toContain("var(--measure)");
  });

  it("CSS が --color-* トークンを参照しない", () => {
    const cssPath = resolve(__dirname, "../ToolPageLayout.module.css");
    const css = readFileSync(cssPath, "utf-8");
    expect(css).not.toMatch(/var\(--color-/);
  });

  it("CSS: box-shadow を使用しない（影なし、DESIGN.md §5）", () => {
    const cssPath = resolve(__dirname, "../ToolPageLayout.module.css");
    const css = readFileSync(cssPath, "utf-8");
    expect(css).not.toMatch(/box-shadow/);
  });

  it("CSS: font-weight: 700 を使用しない", () => {
    const cssPath = resolve(__dirname, "../ToolPageLayout.module.css");
    const css = readFileSync(cssPath, "utf-8");
    expect(css).not.toMatch(/font-weight:\s*700/);
  });

  it("見出しは文節の切れ目でだけ折れる（DESIGN.md §4）", () => {
    render(
      <ToolPageLayout meta={baseMeta}>
        <div>ツール本体</div>
      </ToolPageLayout>,
    );
    const title = screen.getByRole("heading", { level: 1 });
    expect(title.innerHTML).toBe(
      splitIntoPhrases(title.textContent ?? "").join("<wbr>"),
    );
    const headings: string[][] = [
      ["この", "ツールに", "ついて"],
      ["この", "ツールを", "勧める"],
    ];
    for (const phrases of headings) {
      expect(followsPhraseRules(phrases), phrases.join("|")).toBe(true);
      const heading = screen.getByRole("heading", { name: phrases.join("") });
      expect(heading.innerHTML).toBe(phrases.join("<wbr>"));
    }
  });
});
