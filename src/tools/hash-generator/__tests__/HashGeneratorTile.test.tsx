import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import HashGeneratorTile from "../HashGeneratorTile";

describe("HashGeneratorTile", () => {
  // (i) 空入力時は計算せず結果欄が空であることを確認
  it("空入力 → 計算なし / 結果欄は空表示", async () => {
    render(<HashGeneratorTile />);
    // デフォルトで SHA-256 が選択されている状態でテキストなし → ハッシュ計算
    // 空文字列を明示的に入力して結果を確認する
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: " " } });
    // 一度何か入力してから空にする
    fireEvent.change(input, { target: { value: "" } });
    // 空入力時は結果欄が空
    const statusEl = screen.getByRole("status");
    await waitFor(() => {
      expect(statusEl).toHaveTextContent("");
    });
  });

  // (i) 既知ベクトル: 'hello' → SHA-256 の固定値
  it("既知ベクトル: 'hello' の SHA-256 ハッシュ値が正しく表示される", async () => {
    render(<HashGeneratorTile />);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "hello" } });
    const statusEl = screen.getByRole("status");
    await waitFor(() => {
      expect(statusEl).toHaveTextContent(
        "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824",
      );
    });
  });

  // (ii) セグメント切替: SHA-256 デフォルト → SHA-512 に切り替えると結果桁数が変わる
  it("セグメント切替: SHA-256 → SHA-512 に切り替えると結果桁数が 64 → 128 になる", async () => {
    render(<HashGeneratorTile />);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "hello" } });

    // デフォルト SHA-256: 64 文字
    const statusEl = screen.getByRole("status");
    await waitFor(() => {
      expect(statusEl.textContent?.length).toBe(64);
    });

    // SHA-512 に切り替え
    const sha512Btn = screen.getByRole("button", { name: "SHA-512" });
    fireEvent.click(sha512Btn);

    // SHA-512: 128 文字
    await waitFor(() => {
      expect(statusEl.textContent?.length).toBe(128);
    });
  });

  // (iii) 空入力時の結果欄空表示
  it("空入力時: 結果欄が空で表示される", async () => {
    render(<HashGeneratorTile />);
    const statusEl = screen.getByRole("status");
    // 初期状態では入力欄も空なので結果欄も空
    expect(statusEl).toHaveTextContent("");
  });

  // (iv) アルゴリズム別出力桁数の検証（SHA-1=40 / SHA-256=64 / SHA-384=96 / SHA-512=128）
  it("SHA-1: 出力が 40 hex 文字になる", async () => {
    render(<HashGeneratorTile />);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "hello" } });

    const sha1Btn = screen.getByRole("button", { name: "SHA-1" });
    fireEvent.click(sha1Btn);

    const statusEl = screen.getByRole("status");
    await waitFor(() => {
      expect(statusEl.textContent?.length).toBe(40);
    });
  });

  it("SHA-384: 出力が 96 hex 文字になる", async () => {
    render(<HashGeneratorTile />);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "hello" } });

    const sha384Btn = screen.getByRole("button", { name: "SHA-384" });
    fireEvent.click(sha384Btn);

    const statusEl = screen.getByRole("status");
    await waitFor(() => {
      expect(statusEl.textContent?.length).toBe(96);
    });
  });

  // デフォルト SHA-256 が選択状態であることを確認
  it("デフォルト: SHA-256 ボタンが選択状態（aria-pressed=true）になっている", () => {
    render(<HashGeneratorTile />);
    const sha256Btn = screen.getByRole("button", { name: "SHA-256" });
    expect(sha256Btn).toHaveAttribute("aria-pressed", "true");

    const sha1Btn = screen.getByRole("button", { name: "SHA-1" });
    expect(sha1Btn).toHaveAttribute("aria-pressed", "false");
  });

  // リンク確認
  it("リンク: 詳細ページへのリンクが /tools/hash-generator を指している", () => {
    render(<HashGeneratorTile />);
    const link = screen.getByRole("link", { name: /詳細ページで開く/ });
    expect(link).toHaveAttribute("href", "/tools/hash-generator");
  });
});
