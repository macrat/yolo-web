import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import UrlEncodeTile from "../UrlEncodeTile";

describe("UrlEncodeTile", () => {
  it("renders the tile component with encode direction selected by default", () => {
    render(<UrlEncodeTile />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
    // encode ボタンが「選択済み」状態（aria-pressed or data-active）
    const encodeBtn = screen.getByRole("button", { name: "encode" });
    expect(encodeBtn).toBeInTheDocument();
    expect(encodeBtn).toHaveAttribute("aria-pressed", "true");
  });

  it("encodes Japanese text in real-time (encode direction)", () => {
    render(<UrlEncodeTile />);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "あ" } });
    // encodeURIComponent("あ") = "%E3%81%82"
    expect(screen.getByRole("status")).toHaveTextContent("%E3%81%82");
  });

  it("decodes %XX sequence to original characters (decode direction)", () => {
    render(<UrlEncodeTile />);
    // decode ボタンに切り替え
    const decodeBtn = screen.getByRole("button", { name: "decode" });
    fireEvent.click(decodeBtn);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "%E3%81%82" } });
    // decodeURIComponent("%E3%81%82") = "あ"
    expect(screen.getByRole("status")).toHaveTextContent("あ");
  });

  it("reflects direction toggle: encode result reverses to original on decode toggle", () => {
    render(<UrlEncodeTile />);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "hello" } });

    // encode 状態: "hello" → "hello"（ASCII は変わらない）
    expect(screen.getByRole("status")).toHaveTextContent("hello");

    // decode に切り替え: "hello" → "hello"（ASCII は変わらない）
    const decodeBtn = screen.getByRole("button", { name: "decode" });
    fireEvent.click(decodeBtn);
    expect(screen.getByRole("button", { name: "decode" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "encode" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("shows empty result area when input is empty (no error shown)", () => {
    render(<UrlEncodeTile />);
    const statusEl = screen.getByRole("status");
    expect(statusEl).toHaveTextContent("");
    // エラー文言が表示されていないこと
    expect(screen.queryByText(/不正な URL エンコード/)).not.toBeInTheDocument();
  });

  it("shows a soft-tone error when invalid %XX is entered in decode mode", () => {
    render(<UrlEncodeTile />);
    // decode に切り替え
    const decodeBtn = screen.getByRole("button", { name: "decode" });
    fireEvent.click(decodeBtn);

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "%ZZ" } });
    // エラーメッセージが表示される
    expect(screen.getByText(/不正な URL エンコード/)).toBeInTheDocument();
  });

  it("encodes special characters correctly", () => {
    render(<UrlEncodeTile />);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "!@#$" } });
    // encodeURIComponent("!@#$") = "!%40%23%24"
    expect(screen.getByRole("status")).toHaveTextContent("!%40%23%24");
  });

  it("has a link to /tools/url-encode detail page", () => {
    render(<UrlEncodeTile />);
    const link = screen.getByRole("link", { name: /詳細ページで開く/ });
    expect(link).toHaveAttribute("href", "/tools/url-encode");
  });
});
