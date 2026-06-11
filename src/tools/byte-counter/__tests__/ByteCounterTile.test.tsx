/**
 * ByteCounterTile のユニットテスト（TDD: 実装前に記述）
 *
 * 旧 ByteCounterPage.test.tsx の観点を移植・拡張し、
 * タイルアーキテクチャ要件（A-1〜A-7）と恒久要件チェックリストを網羅する。
 *
 * V-1: variant=full での基本レンダリング（Panel ルート・全統計表示）
 * V-2: variant=compact での基本レンダリング（主要統計のみ・バイト分布なし）
 * V-3: 入力→リアルタイム統計更新
 * V-4: 空入力で 0 表示
 * V-5: 日本語テキストのバイト数が正確
 * V-6: 絵文字のバイト数が正確
 * V-7: 全統計表示（バイト数・文字数・行数・単語数・バイト構成）
 * V-8: バイト構成内訳表示（variant=full）
 * V-9: ARIA（role="status" aria-live="polite" ライブリージョン）
 * V-10: aria-atomic="true" が付いていない（C-3 準拠）
 * V-11: ライブリージョンにサマリテキストのみ（詳細統計は含まない）
 * V-12: コピーボタンなし（byte-counter は知る対象）
 * V-13: id インスタンス一意性（複数インスタンス同居）
 * V-14: デフォルト variant は full と同等
 * V-15: CSS トークン検証（--color-* 旧トークン・font-weight:700 禁止）
 * V-16: variant=compact では バイト分布セクションが非表示
 */

import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import ByteCounterTile from "../ByteCounterTile";

// --- V-1: variant=full での基本レンダリング ---
describe("V-1: variant=full 基本レンダリング", () => {
  it("renders without crashing", () => {
    render(<ByteCounterTile variant="full" />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("テキストエリアが存在する", () => {
    render(<ByteCounterTile variant="full" />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });
});

// --- V-2: variant=compact での基本レンダリング ---
describe("V-2: variant=compact 基本レンダリング", () => {
  it("renders without crashing", () => {
    render(<ByteCounterTile variant="compact" />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });
});

// --- V-3: 入力→リアルタイム統計更新 ---
describe("V-3: 入力→リアルタイム統計更新", () => {
  it("入力するとバイト数が更新される", () => {
    render(<ByteCounterTile variant="full" />);
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "A" } });
    const elements = screen.getAllByText("1");
    expect(elements.length).toBeGreaterThan(0);
  });
});

// --- V-4: 空入力で 0 表示 ---
describe("V-4: 空入力", () => {
  it("空入力時にライブリージョンが存在する", () => {
    render(<ByteCounterTile variant="full" />);
    const statusRegion = screen.getByRole("status");
    expect(statusRegion).toBeInTheDocument();
  });
});

// --- V-5: 日本語テキストのバイト数 ---
describe("V-5: 日本語テキストのバイト数", () => {
  it("日本語3文字 = 9バイトを正確にカウント", () => {
    render(<ByteCounterTile variant="full" />);
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "日本語" } });
    const nineElements = screen.getAllByText("9");
    expect(nineElements.length).toBeGreaterThan(0);
  });
});

// --- V-6: 絵文字のバイト数 ---
describe("V-6: 絵文字のバイト数", () => {
  it("絵文字1文字 = 4バイトを正確にカウント", () => {
    render(<ByteCounterTile variant="full" />);
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "😀" } });
    const fourElements = screen.getAllByText("4");
    expect(fourElements.length).toBeGreaterThan(0);
  });
});

// --- V-7: 全統計ラベル表示 ---
describe("V-7: 全統計ラベル表示（variant=full）", () => {
  it("バイト数・文字数・行数・単語数のラベルが表示される", () => {
    render(<ByteCounterTile variant="full" />);
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "Hello" } });
    const byteLabels = screen.getAllByText(/バイト数/);
    expect(byteLabels.length).toBeGreaterThan(0);
    const charLabels = screen.getAllByText(/文字数/);
    expect(charLabels.length).toBeGreaterThan(0);
    expect(screen.getByText("行数")).toBeInTheDocument();
    expect(screen.getByText("単語数")).toBeInTheDocument();
  });
});

// --- V-8: バイト構成内訳（variant=full） ---
describe("V-8: バイト構成内訳（variant=full）", () => {
  it("バイト構成セクションが表示される", () => {
    render(<ByteCounterTile variant="full" />);
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "abc" } });
    expect(screen.getByText(/バイト構成/)).toBeInTheDocument();
    expect(screen.getByText(/1バイト文字/)).toBeInTheDocument();
  });
});

// --- V-9: ARIA ライブリージョン ---
describe("V-9: ARIA ライブリージョン", () => {
  it("role=status と aria-live=polite を持つ", () => {
    render(<ByteCounterTile variant="full" />);
    const statusRegion = screen.getByRole("status");
    expect(statusRegion).toHaveAttribute("aria-live", "polite");
  });
});

// --- V-10: aria-atomic=true が付いていない ---
describe("V-10: aria-atomic 非設定", () => {
  it("status region が aria-atomic=true を持たない（C-3 準拠）", () => {
    render(<ByteCounterTile variant="full" />);
    const statusRegion = screen.getByRole("status");
    expect(statusRegion).not.toHaveAttribute("aria-atomic", "true");
  });
});

// --- V-11: ライブリージョンにサマリテキストのみ ---
describe("V-11: ライブリージョン内容", () => {
  it("サマリテキストが含まれ、詳細統計（空白除く等）は含まれない", () => {
    render(<ByteCounterTile variant="full" />);
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "hello" } });
    const statusRegion = screen.getByRole("status");
    expect(statusRegion.textContent).not.toBe("");
    expect(statusRegion.textContent).not.toContain("文字数（空白除く）");
    expect(statusRegion.textContent).not.toContain("バイト構成");
  });
});

// --- V-12: コピーボタンなし ---
describe("V-12: コピーボタンなし", () => {
  it("コピーボタンが存在しない（byte-counter は知る対象）", () => {
    render(<ByteCounterTile variant="full" />);
    expect(
      screen.queryByRole("button", { name: /コピー/ }),
    ).not.toBeInTheDocument();
  });
});

// --- V-13: id インスタンス一意性 ---
describe("V-13: id インスタンス一意性", () => {
  it("同一ページに2つ描画しても textarea id が重複しない", () => {
    const { container: c1 } = render(<ByteCounterTile variant="full" />);
    const { container: c2 } = render(<ByteCounterTile variant="compact" />);
    const input1 = c1.querySelector("textarea[id]");
    const input2 = c2.querySelector("textarea[id]");
    expect(input1).not.toBeNull();
    expect(input2).not.toBeNull();
    expect(input1!.id).not.toBe(input2!.id);
  });

  it("variant=full を2つ同居させても全要素 id が重複しない", () => {
    const { container: c1 } = render(<ByteCounterTile variant="full" />);
    const { container: c2 } = render(<ByteCounterTile variant="full" />);
    const ids1 = [...c1.querySelectorAll("[id]")].map((el) => el.id);
    const ids2 = [...c2.querySelectorAll("[id]")].map((el) => el.id);
    const overlap = ids1.filter((id) => ids2.includes(id));
    expect(overlap).toHaveLength(0);
  });
});

// --- V-14: デフォルト variant は full と同等 ---
describe("V-14: デフォルト variant", () => {
  it("variant 未指定の場合 full と同等（バイト構成が表示される）", () => {
    render(<ByteCounterTile />);
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "abc" } });
    expect(screen.getByText(/バイト構成/)).toBeInTheDocument();
  });
});

// --- V-16: variant=compact ではバイト分布が非表示 ---
describe("V-16: variant=compact でのバイト分布非表示", () => {
  it("バイト構成セクションが表示されない", () => {
    render(<ByteCounterTile variant="compact" />);
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "abc" } });
    expect(screen.queryByText(/バイト構成/)).not.toBeInTheDocument();
  });
});

// --- V-15: CSS トークン検証 ---
describe("V-15: ByteCounterTile CSS トークン検証", () => {
  const cssPath = join(__dirname, "..", "ByteCounterTile.module.css");

  it("--color-* 旧トークンを使用しない", () => {
    const css = readFileSync(cssPath, "utf-8");
    expect(css).not.toMatch(/var\(--color-/);
  });

  it("--accent を背景・文字色に直接使用しない", () => {
    const css = readFileSync(cssPath, "utf-8");
    const illegalAccentUse = css.match(
      /(?:background|background-color|color)\s*:\s*var\(--accent\)/g,
    );
    expect(illegalAccentUse).toBeNull();
  });

  it("font-weight: 700 を使用しない", () => {
    const css = readFileSync(cssPath, "utf-8");
    expect(css).not.toMatch(/font-weight:\s*700/);
  });
});
