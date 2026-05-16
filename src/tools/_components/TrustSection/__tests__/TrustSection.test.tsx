import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import TrustSection from "../index";

describe("TrustSection", () => {
  it("howItWorks テキストが表示される", () => {
    render(<TrustSection howItWorks="ブラウザ内で完結するツールです。" />);
    expect(
      screen.getByText("ブラウザ内で完結するツールです。"),
    ).toBeInTheDocument();
  });

  it("privacy が未指定（デフォルト true）のとき PrivacyBadge が表示される", () => {
    render(<TrustSection howItWorks="動作原理テキスト" />);
    // PrivacyBadge のテキスト内容で確認
    expect(screen.getByText(/ブラウザ内で完結します/)).toBeInTheDocument();
  });

  it("privacy={true} のとき PrivacyBadge が表示される", () => {
    render(<TrustSection howItWorks="動作原理テキスト" privacy={true} />);
    expect(screen.getByText(/ブラウザ内で完結します/)).toBeInTheDocument();
  });

  it("privacy={false} のとき PrivacyBadge が表示されない", () => {
    render(<TrustSection howItWorks="動作原理テキスト" privacy={false} />);
    expect(
      screen.queryByText(/ブラウザ内で完結します/),
    ).not.toBeInTheDocument();
  });

  it("source が渡されたとき情報源テキストが表示される", () => {
    render(
      <TrustSection
        howItWorks="動作原理テキスト"
        source="文化庁「敬語の指針」(2007年) に基づく"
      />,
    );
    expect(
      screen.getByText("文化庁「敬語の指針」(2007年) に基づく"),
    ).toBeInTheDocument();
  });

  it("source が渡されないとき情報源セクションが描画されない", () => {
    const { queryByTestId } = render(
      <TrustSection howItWorks="動作原理テキスト" />,
    );
    expect(queryByTestId("trust-source")).not.toBeInTheDocument();
  });

  it("howItWorks に改行 \\n が含まれるとき複数の行に分割される", () => {
    render(<TrustSection howItWorks={"1行目\n2行目\n3行目"} />);
    // 分割後のテキスト断片がそれぞれ DOM に存在することを確認
    expect(screen.getByText("1行目")).toBeInTheDocument();
    expect(screen.getByText("2行目")).toBeInTheDocument();
    expect(screen.getByText("3行目")).toBeInTheDocument();
  });
});
