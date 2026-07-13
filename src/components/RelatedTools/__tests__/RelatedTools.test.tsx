import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { readFileSync } from "fs";
import { resolve } from "path";

// allToolMetas をモックする
vi.mock("@/tools/registry", () => ({
  allToolMetas: [
    {
      slug: "base64",
      name: "Base64エンコード・デコード",
      shortDescription: "テキストをBase64形式に変換・復元するツール",
      nameEn: "Base64 Encoder/Decoder",
      description: "テスト用",
      keywords: [],
      category: "encoding",
      relatedSlugs: [],
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
    {
      slug: "byte-counter",
      name: "バイト数カウンター",
      shortDescription: "テキストのバイト数を正確に計算するツール",
      nameEn: "Byte Counter",
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

import RelatedTools from "../index";

describe("RelatedTools", () => {
  it("関連ツールのカードリンクをレンダリングする", () => {
    render(
      <RelatedTools
        currentSlug="base64"
        relatedSlugs={["char-count", "byte-counter"]}
      />,
    );

    // ナビゲーション要素が存在する
    expect(screen.getByRole("navigation")).toBeInTheDocument();

    // 関連ツール2件がリンクとして表示される
    expect(
      screen.getByRole("link", { name: /文字数カウンター/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /バイト数カウンター/ }),
    ).toBeInTheDocument();
  });

  it("currentSlug のツールは表示されない", () => {
    render(
      <RelatedTools
        currentSlug="base64"
        relatedSlugs={["base64", "char-count"]}
      />,
    );

    // currentSlug のツール名は表示されない
    expect(
      screen.queryByText("Base64エンコード・デコード"),
    ).not.toBeInTheDocument();

    // 関連の他のツールは表示される
    expect(screen.getByText("文字数カウンター")).toBeInTheDocument();
  });

  it("relatedSlugs が空のとき null を返す（何もレンダリングしない）", () => {
    const { container } = render(
      <RelatedTools currentSlug="base64" relatedSlugs={[]} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("relatedSlugs に合致するツールが存在しないとき null を返す", () => {
    const { container } = render(
      <RelatedTools currentSlug="base64" relatedSlugs={["nonexistent-tool"]} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("各ツールの shortDescription（一行説明）が表示される（M-3: 遷移先が何かを判断できる導線）", () => {
    render(
      <RelatedTools
        currentSlug="base64"
        relatedSlugs={["char-count", "byte-counter"]}
      />,
    );

    // 一行説明が表示されること（リンク名だけに簡素化しない）
    expect(
      screen.getByText("テキストの文字数・バイト数を数えるツール"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("テキストのバイト数を正確に計算するツール"),
    ).toBeInTheDocument();
  });

  it("リンクが /tools/<slug> の正しいパスを持つ", () => {
    render(<RelatedTools currentSlug="base64" relatedSlugs={["char-count"]} />);

    const link = screen.getByRole("link", { name: /文字数カウンター/ });
    expect(link).toHaveAttribute("href", "/tools/char-count");
  });

  it("「関連ツール」の見出しが表示される", () => {
    render(<RelatedTools currentSlug="base64" relatedSlugs={["char-count"]} />);

    expect(screen.getByText("関連ツール")).toBeInTheDocument();
  });

  // CSS 規約: 新トークンのみ使用（--color-* 旧トークン不使用）
  it("CSS に旧 --color-* トークンが含まれていない", () => {
    const cssPath = resolve(__dirname, "../RelatedTools.module.css");
    const css = readFileSync(cssPath, "utf-8");
    expect(css).not.toMatch(/--color-/);
  });

  // CSS 規約（DESIGN.md フェーズ R・店構え）: 新トークン（--ink, --ink-2, --rule, --accent）を使用
  it("CSS に新デザイントークンが含まれている", () => {
    const cssPath = resolve(__dirname, "../RelatedTools.module.css");
    const css = readFileSync(cssPath, "utf-8");
    // いずれかの新トークンが使われていること
    const hasNewToken =
      css.includes("--ink") ||
      css.includes("--rule") ||
      css.includes("--accent");
    expect(hasNewToken).toBe(true);
  });

  // CSS 規約: 旧トークン（--fg / --border / --bg 等）が残っていないこと
  it("CSS に旧デザイントークンが含まれていない", () => {
    const cssPath = resolve(__dirname, "../RelatedTools.module.css");
    const css = readFileSync(cssPath, "utf-8");
    expect(css).not.toMatch(
      /--fg\b|--bg\b|--border\b|--r-normal|--r-interactive/,
    );
  });

  // CSS 規約: カードリンクのフォーカス可視（WCAG 2.4.7）
  it("CSS に focus-visible のフォーカス outline 定義が含まれている", () => {
    const cssPath = resolve(__dirname, "../RelatedTools.module.css");
    const css = readFileSync(cssPath, "utf-8");
    expect(css).toContain("focus-visible");
    expect(css).toContain("outline");
  });
});
