import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import KanaConverterTile from "../KanaConverterTile";

describe("KanaConverterTile", () => {
  // (i) モード切替 → 入力保持（モード A → モード B に切り替えても入力テキストが保持される）
  it("モード切替: ひらがな→カタカナ から カタカナ→ひらがな に切り替えても入力テキストが保持される", () => {
    render(<KanaConverterTile />);
    const input = screen.getByRole("textbox");

    // ひらがなテキストを入力
    fireEvent.change(input, { target: { value: "あいうえお" } });

    // デフォルトは「ひらがな → カタカナ」ボタンが選択状態
    expect(
      screen.getByRole("button", { name: "ひらがな → カタカナ" }),
    ).toHaveAttribute("aria-pressed", "true");

    // 「カタカナ → ひらがな」に切り替え
    const katakanaToHiraganaBtn = screen.getByRole("button", {
      name: "カタカナ → ひらがな",
    });
    fireEvent.click(katakanaToHiraganaBtn);

    // 入力テキストが保持されている
    expect(input).toHaveValue("あいうえお");

    // 「カタカナ → ひらがな」が選択状態になっている
    expect(katakanaToHiraganaBtn).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByRole("button", { name: "ひらがな → カタカナ" }),
    ).toHaveAttribute("aria-pressed", "false");
  });

  // (ii) hiragana-to-katakana デフォルト動作
  it("hiragana-to-katakana: ひらがな入力 → カタカナ出力", () => {
    render(<KanaConverterTile />);
    const input = screen.getByRole("textbox");

    fireEvent.change(input, { target: { value: "あいうえお" } });

    const statusEl = screen.getByRole("status");
    expect(statusEl).toHaveTextContent("アイウエオ");
  });

  // (iii) katakana-to-hiragana 動作
  it("katakana-to-hiragana: カタカナ入力 → ひらがな出力", () => {
    render(<KanaConverterTile />);

    // 「カタカナ → ひらがな」に切り替え
    fireEvent.click(
      screen.getByRole("button", { name: "カタカナ → ひらがな" }),
    );

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "アイウエオ" } });

    const statusEl = screen.getByRole("status");
    expect(statusEl).toHaveTextContent("あいうえお");
  });

  // (iv) to-fullwidth-katakana（縮小ケース: 濁音「ｶﾞ」→「ガ」）
  it("to-fullwidth-katakana: 半角濁音「ｶﾞ」(2文字) が全角「ガ」(1文字) に縮小変換される", () => {
    render(<KanaConverterTile />);

    // 「半角カナ → 全角カナ」に切り替え
    fireEvent.click(
      screen.getByRole("button", { name: "半角カナ → 全角カナ" }),
    );

    const input = screen.getByRole("textbox");
    // 半角濁音カナを入力: ｶﾞｷﾞｸﾞｹﾞｺﾞ（各 2 文字 = 計 10 文字）
    fireEvent.change(input, { target: { value: "ｶﾞｷﾞｸﾞｹﾞｺﾞ" } });

    const statusEl = screen.getByRole("status");
    // 全角カナに縮小: ガギグゲゴ（各 1 文字 = 計 5 文字）
    expect(statusEl).toHaveTextContent("ガギグゲゴ");
  });

  // (v) to-halfwidth-katakana（膨張ケース: 濁音「ガ」→「ｶﾞ」）
  it("to-halfwidth-katakana: 全角濁音「ガ」(1文字) が半角「ｶﾞ」(2文字) に膨張変換される", () => {
    render(<KanaConverterTile />);

    // 「全角カナ → 半角カナ」に切り替え
    fireEvent.click(
      screen.getByRole("button", { name: "全角カナ → 半角カナ" }),
    );

    const input = screen.getByRole("textbox");
    // 全角濁音カタカナを入力: ガギグゲゴ
    fireEvent.change(input, { target: { value: "ガギグゲゴ" } });

    const statusEl = screen.getByRole("status");
    // 半角カタカナ濁音に膨張: ｶﾞｷﾞｸﾞｹﾞｺﾞ（各 2 文字 = 計 10 文字）
    expect(statusEl).toHaveTextContent("ｶﾞｷﾞｸﾞｹﾞｺﾞ");
  });

  // (vi) 空入力 + role="status" aria-live="polite" の確認
  it("空入力: 結果欄が空で aria-live 要素が維持される", () => {
    render(<KanaConverterTile />);
    const statusEl = screen.getByRole("status");
    // 初期状態: 空入力 → 結果欄は空
    expect(statusEl).toHaveTextContent("");
    // aria-live="polite" が付与されていること
    expect(statusEl).toHaveAttribute("aria-live", "polite");
  });

  // (vii) ARIA button トグルセマンティクス（論点 5b 採択案 b 検証）
  it("ARIA: role=group が 1 件、role=button が 4 件、選択中の aria-pressed=true 他 3 件 false", () => {
    render(<KanaConverterTile />);

    // role="group" が 1 件検出されること
    const groups = screen.getAllByRole("group");
    expect(groups).toHaveLength(1);

    // role="button" が 4 件検出されること
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(4);

    // デフォルトでは「ひらがな → カタカナ」が選択済（aria-pressed="true"）
    expect(
      screen.getByRole("button", { name: "ひらがな → カタカナ" }),
    ).toHaveAttribute("aria-pressed", "true");

    // 他 3 件は aria-pressed="false"
    expect(
      screen.getByRole("button", { name: "カタカナ → ひらがな" }),
    ).toHaveAttribute("aria-pressed", "false");
    expect(
      screen.getByRole("button", { name: "半角カナ → 全角カナ" }),
    ).toHaveAttribute("aria-pressed", "false");
    expect(
      screen.getByRole("button", { name: "全角カナ → 半角カナ" }),
    ).toHaveAttribute("aria-pressed", "false");
  });
});
