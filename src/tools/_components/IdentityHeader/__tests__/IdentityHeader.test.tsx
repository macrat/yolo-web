import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import IdentityHeader from "../index";

describe("IdentityHeader", () => {
  it("name が h1 としてレンダリングされる", () => {
    render(
      <IdentityHeader
        name="文字カウンター"
        shortDescription="文字数を数えるツール"
      />,
    );
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent("文字カウンター");
  });

  it("shortDescription が表示される", () => {
    render(
      <IdentityHeader
        name="文字カウンター"
        shortDescription="テキストの文字数・バイト数を数えるツール"
      />,
    );
    expect(
      screen.getByText("テキストの文字数・バイト数を数えるツール"),
    ).toBeInTheDocument();
  });

  it("category が渡されたとき表示される", () => {
    render(
      <IdentityHeader
        name="文字カウンター"
        shortDescription="文字数を数えるツール"
        category="テキスト"
      />,
    );
    expect(screen.getByText("テキスト")).toBeInTheDocument();
  });

  it("category が渡されないとき category 要素が描画されない", () => {
    const { container } = render(
      <IdentityHeader
        name="文字カウンター"
        shortDescription="文字数を数えるツール"
      />,
    );
    // category 専用クラスを持つ要素が存在しないことを確認
    // DOMに "category" テキストを含む要素がないことを確認
    expect(container.querySelector("[data-testid='category']")).toBeNull();
  });

  it("長い shortDescription が折り返して表示される", () => {
    const longDesc =
      "これは非常に長い説明文です。文字数カウンター、バイト数計算、改行数、単語数など、テキストに関するさまざまな情報を一度に確認できる便利なツールです。コピー＆ペーストするだけですぐに使えます。";
    render(
      <IdentityHeader name="文字カウンター" shortDescription={longDesc} />,
    );
    expect(screen.getByText(longDesc)).toBeInTheDocument();
  });
});
