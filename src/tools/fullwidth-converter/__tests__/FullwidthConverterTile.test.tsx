import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import FullwidthConverterTile from "../FullwidthConverterTile";

describe("FullwidthConverterTile", () => {
  // (i) モード切替 → 入力保持（toHalfwidth → toFullwidth に切り替えても入力が保持される）
  it("モード切替: toHalfwidth → toFullwidth に切り替えても入力テキストが保持される", () => {
    render(<FullwidthConverterTile />);
    const input = screen.getByRole("textbox");

    // 全角テキストを入力
    fireEvent.change(input, { target: { value: "ＡＢＣ１２３" } });

    // デフォルトは「半角に変換」（toHalfwidth）ボタンが選択状態
    expect(screen.getByRole("button", { name: "半角に変換" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    // 「全角に変換」に切り替え
    const toFullwidthBtn = screen.getByRole("button", { name: "全角に変換" });
    fireEvent.click(toFullwidthBtn);

    // 入力テキストが保持されている
    expect(input).toHaveValue("ＡＢＣ１２３");

    // 「全角に変換」が選択状態になっている
    expect(toFullwidthBtn).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "半角に変換" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  // (ii) toHalfwidth デフォルト動作（全 ON）— 全角英数 + 全角カタカナ + 全角記号が半角化
  it("toHalfwidth 全 ON: 全角英数字・全角カタカナ・全角記号がすべて半角化される", () => {
    render(<FullwidthConverterTile />);
    const input = screen.getByRole("textbox");

    // 全角英数字 + 全角カタカナ + 全角記号の混在入力
    // ＡＢＣ（全角英字）+ アイウ（全角カタカナ）+ ！（全角感嘆符）
    fireEvent.change(input, { target: { value: "ＡＢＣアイウ！" } });

    const statusEl = screen.getByRole("status");
    // 半角化: ABC（半角英字）+ ｱｲｳ（半角カタカナ）+ !（半角感嘆符）
    expect(statusEl).toHaveTextContent("ABCｱｲｳ!");
  });

  // (iii) toFullwidth デフォルト動作（全 ON）— 半角英数字・半角カタカナ・半角記号が全角化
  it("toFullwidth 全 ON: 半角英数字・半角カタカナ・半角記号がすべて全角化される", () => {
    render(<FullwidthConverterTile />);

    // 「全角に変換」に切り替え
    const toFullwidthBtn = screen.getByRole("button", { name: "全角に変換" });
    fireEvent.click(toFullwidthBtn);

    const input = screen.getByRole("textbox");
    // 半角英数字 + 半角カタカナ + 半角記号の混在入力
    fireEvent.change(input, { target: { value: "ABCｱｲｳ!" } });

    const statusEl = screen.getByRole("status");
    // 全角化: ＡＢＣ（全角英字）+ アイウ（全角カタカナ）+ ！（全角感嘆符）
    expect(statusEl).toHaveTextContent("ＡＢＣアイウ！");
  });

  // (iv) 濁音カタカナの toHalfwidth（ガ → ｶﾞ などの +1 文字膨張エッジケース）
  it("濁音カタカナ toHalfwidth: 全角「ガ」が半角「ｶﾞ」(2 文字) に変換される", () => {
    render(<FullwidthConverterTile />);
    const input = screen.getByRole("textbox");

    // 全角濁音カタカナを入力: ガギグゲゴ
    fireEvent.change(input, { target: { value: "ガギグゲゴ" } });

    const statusEl = screen.getByRole("status");
    // 半角カタカナ濁音: ｶﾞｷﾞｸﾞｹﾞｺﾞ（各 2 文字、計 10 文字）
    expect(statusEl).toHaveTextContent("ｶﾞｷﾞｸﾞｹﾞｺﾞ");
  });

  // (v) 半濁音カタカナの toHalfwidth（パ → ﾊﾟ などの +1 文字膨張エッジケース）
  it("半濁音カタカナ toHalfwidth: 全角「パ」が半角「ﾊﾟ」(2 文字) に変換される", () => {
    render(<FullwidthConverterTile />);
    const input = screen.getByRole("textbox");

    // 全角半濁音カタカナを入力: パピプペポ
    fireEvent.change(input, { target: { value: "パピプペポ" } });

    const statusEl = screen.getByRole("status");
    // 半角カタカナ半濁音: ﾊﾟﾋﾟﾌﾟﾍﾟﾎﾟ（各 2 文字、計 10 文字）
    expect(statusEl).toHaveTextContent("ﾊﾟﾋﾟﾌﾟﾍﾟﾎﾟ");
  });

  // (vi) 空入力（結果欄が空表示で、role="status" を持つ要素として描画される）
  it("空入力: 結果欄が空で aria-live 要素が維持される", () => {
    render(<FullwidthConverterTile />);
    const statusEl = screen.getByRole("status");
    // 初期状態: 空入力 → 結果欄は空
    expect(statusEl).toHaveTextContent("");
    // aria-live="polite" が付与されていること
    expect(statusEl).toHaveAttribute("aria-live", "polite");
  });
});
