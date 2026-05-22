import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import HtmlEntityTile from "../HtmlEntityTile";

describe("HtmlEntityTile", () => {
  // (i) encode: HTML 特殊文字を含む基本ケース
  it('encode 基本: HTML 特殊文字 <script>alert("xss")</script> がエンコードされる', () => {
    render(<HtmlEntityTile />);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, {
      target: { value: '<script>alert("xss")</script>' },
    });
    expect(screen.getByRole("status")).toHaveTextContent(
      "&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;",
    );
  });

  // (ii) encode: 通常日本語で膨張ゼロを確認
  it("encode 日本語: 日本語文字列はエンコードで変化しない（膨張ゼロ）", () => {
    render(<HtmlEntityTile />);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "こんにちは世界" } });
    expect(screen.getByRole("status")).toHaveTextContent("こんにちは世界");
  });

  // (iii) decode: 基本ケース
  it("decode 基本: HTML エンティティ文字列が正しくデコードされる", () => {
    render(<HtmlEntityTile />);
    // decode に切り替え
    const decodeBtn = screen.getByRole("button", { name: "decode" });
    fireEvent.click(decodeBtn);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, {
      target: { value: "&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;" },
    });
    expect(screen.getByRole("status")).toHaveTextContent(
      '<script>alert("xss")</script>',
    );
  });

  // (iv) トグル切替: encode → decode で結果が再計算される
  it("トグル切替: encode → decode の方向切替で結果が再計算される", () => {
    render(<HtmlEntityTile />);
    const input = screen.getByRole("textbox");
    // encode 状態でエンティティ文字列を入力
    fireEvent.change(input, {
      target: { value: "&lt;b&gt;" },
    });

    // encode ボタンが選択状態であることを確認
    expect(screen.getByRole("button", { name: "encode" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "decode" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );

    // encode 結果を確認 (&lt; と &gt; がさらにエスケープされる)
    expect(screen.getByRole("status")).toHaveTextContent("&amp;lt;b&amp;gt;");

    // decode に切り替え
    const decodeBtn = screen.getByRole("button", { name: "decode" });
    fireEvent.click(decodeBtn);

    // decode ボタンが選択状態になったことを確認
    expect(screen.getByRole("button", { name: "decode" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "encode" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );

    // decode 結果が "<b>" になっていることを確認
    expect(screen.getByRole("status")).toHaveTextContent("<b>");
  });

  // 追加: 空入力エッジケース
  it("エッジ: 空入力時は結果欄が空", () => {
    render(<HtmlEntityTile />);
    const statusEl = screen.getByRole("status");
    expect(statusEl).toHaveTextContent("");
  });

  // 追加: 詳細ページへのリンク確認
  it("リンク: 詳細ページへのリンクが /tools/html-entity を指している", () => {
    render(<HtmlEntityTile />);
    const link = screen.getByRole("link", { name: /詳細ページで開く/ });
    expect(link).toHaveAttribute("href", "/tools/html-entity");
  });
});
