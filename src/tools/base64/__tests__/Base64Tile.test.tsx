import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Base64Tile from "../Base64Tile";

describe("Base64Tile", () => {
  it("encode 基本: ASCII 入力 'hello' で base64 結果が反映される", () => {
    render(<Base64Tile />);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "hello" } });
    // btoa("hello") = "aGVsbG8="
    expect(screen.getByRole("status")).toHaveTextContent("aGVsbG8=");
  });

  it("encode 日本語: UTF-8 マルチバイト（平仮名）でも正しく encode される", () => {
    render(<Base64Tile />);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "あ" } });
    // "あ" = UTF-8 e3 81 82 → base64 = "44GC"
    const statusEl = screen.getByRole("status");
    // base64 変換が何らかの値を返すことを確認（空でないこと）
    expect(statusEl.textContent).not.toBe("");
    // TextEncoder → btoa 経由の正しい結果を確認
    const bytes = new TextEncoder().encode("あ");
    const binary = Array.from(bytes)
      .map((b) => String.fromCharCode(b))
      .join("");
    const expected = btoa(binary);
    expect(statusEl).toHaveTextContent(expected);
  });

  it("encode エッジ: 空入力時はエラー非表示・結果欄空", () => {
    render(<Base64Tile />);
    const statusEl = screen.getByRole("status");
    expect(statusEl).toHaveTextContent("");
    // エラー文言が表示されていないこと
    expect(
      screen.queryByText(/不正な Base64 文字列です/),
    ).not.toBeInTheDocument();
  });

  it("decode 基本: 正常な base64 入力 'aGVsbG8=' で decode 結果 'hello' が反映される", () => {
    render(<Base64Tile />);
    // decode に切り替え
    const decodeBtn = screen.getByRole("button", { name: "decode" });
    fireEvent.click(decodeBtn);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "aGVsbG8=" } });
    // atob("aGVsbG8=") = "hello"
    expect(screen.getByRole("status")).toHaveTextContent("hello");
  });

  it("トグル切替: encode → decode の方向切替で結果が再計算される", () => {
    render(<Base64Tile />);
    const input = screen.getByRole("textbox");
    // encode 状態で base64 入力
    fireEvent.change(input, { target: { value: "aGVsbG8=" } });

    // encode ボタンが選択状態であることを確認
    expect(screen.getByRole("button", { name: "encode" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "decode" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );

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

    // decode 結果が "hello" になっていることを確認
    expect(screen.getByRole("status")).toHaveTextContent("hello");
  });

  it("decode 失敗 (a): 文法不正な base64（不正文字 '!@#'）→ 「不正な Base64 文字列です」表示", () => {
    render(<Base64Tile />);
    // decode に切り替え
    const decodeBtn = screen.getByRole("button", { name: "decode" });
    fireEvent.click(decodeBtn);

    const input = screen.getByRole("textbox");
    // atob が失敗する不正文字を含む文字列
    fireEvent.change(input, { target: { value: "!@#$%" } });

    // 固定の日本語エラー文言が表示されること
    expect(screen.getByText(/不正な Base64 文字列です/)).toBeInTheDocument();
    // 英語の例外メッセージが直接表示されていないこと
    expect(screen.queryByText(/Invalid character/)).not.toBeInTheDocument();
    expect(screen.queryByText(/correctly encoded/)).not.toBeInTheDocument();
  });

  it("decode 失敗 (b): base64 有効だが UTF-8 として復元不能（'/w==' = 0xff 単独）→ 「不正な Base64 文字列です」表示", () => {
    render(<Base64Tile />);
    // decode に切り替え
    const decodeBtn = screen.getByRole("button", { name: "decode" });
    fireEvent.click(decodeBtn);

    const input = screen.getByRole("textbox");
    // "/w==" は有効な base64 だが 0xff 単独で UTF-8 として不正
    fireEvent.change(input, { target: { value: "/w==" } });

    // 固定の日本語エラー文言が表示されること
    expect(screen.getByText(/不正な Base64 文字列です/)).toBeInTheDocument();
  });

  it("任意: 絵文字（4 バイト UTF-8）の encode が正常に動作する", () => {
    render(<Base64Tile />);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "😀" } });

    const statusEl = screen.getByRole("status");
    // 絵文字が base64 encode されて空でない結果が返ること
    expect(statusEl.textContent).not.toBe("");
    // base64 文字のみで構成されていること（A-Z, a-z, 0-9, +, /, =）
    expect(statusEl.textContent).toMatch(/^[A-Za-z0-9+/]+=*$/);
  });

  it("任意: 詳細ページへのリンクが /tools/base64 を指している", () => {
    render(<Base64Tile />);
    const link = screen.getByRole("link", { name: /詳細ページで開く/ });
    expect(link).toHaveAttribute("href", "/tools/base64");
  });
});
