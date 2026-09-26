import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

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
  it("見出し「関連ツール」を名前に持つ一覧に、関連ツールが行として並ぶ", () => {
    render(
      <RelatedTools
        currentSlug="base64"
        relatedSlugs={["char-count", "byte-counter"]}
      />,
    );

    const list = screen.getByRole("list", { name: "関連ツール" });
    expect(list.querySelectorAll("li")).toHaveLength(2);
  });

  it("行のリンクの読み上げの名前はツール名だけで、説明を含まない", () => {
    render(
      <RelatedTools
        currentSlug="base64"
        relatedSlugs={["char-count", "byte-counter"]}
      />,
    );

    const names = screen.getAllByRole("link").map((link) => link.textContent);
    expect(names).toEqual(["文字数カウンター", "バイト数カウンター"]);
    expect(
      screen.getByRole("link", { name: "文字数カウンター" }),
    ).toHaveAccessibleName("文字数カウンター");
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

  it("各ツールの一行の説明が表示される", () => {
    render(
      <RelatedTools
        currentSlug="base64"
        relatedSlugs={["char-count", "byte-counter"]}
      />,
    );

    expect(
      screen.getByText("テキストの文字数・バイト数を数えるツール"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("テキストのバイト数を正確に計算するツール"),
    ).toBeInTheDocument();
  });

  it("リンクが /tools/<slug> の正しいパスを持つ", () => {
    render(<RelatedTools currentSlug="base64" relatedSlugs={["char-count"]} />);

    const link = screen.getByRole("link", { name: "文字数カウンター" });
    expect(link).toHaveAttribute("href", "/tools/char-count");
  });

  it("「関連ツール」の見出しが表示される", () => {
    render(<RelatedTools currentSlug="base64" relatedSlugs={["char-count"]} />);

    expect(screen.getByText("関連ツール")).toBeInTheDocument();
  });
});
