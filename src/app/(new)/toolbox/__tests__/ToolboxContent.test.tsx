/**
 * ToolboxContent のユニットテスト（T-2 TDD）
 *
 * 検証観点:
 * - TB-1: 生きたタイル3つ（full/encode/decode）がレンダリングされる
 *   → 各 variant の UrlEncodeTile が描画されること（入力欄・出力欄の存在で確認）
 * - TB-2: タイルはリンクではない（<a> タグが道具箱コンテナに存在しない）
 *   → ページ遷移なしに機能することの構造的確認
 * - TB-3: ダミータイル2枚が「準備中」テキストを表示する
 * - TB-4: 複数 UrlEncodeTile の DOM id 重複ゼロ（3インスタンス同居時）
 *   → cycle-226 T-1 で確立した useId 一意化が道具箱文脈でも成立することを確認
 */
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import ToolboxContent from "../ToolboxContent";

// --- TB-1: 生きたタイル3つのレンダリング ---
describe("TB-1: 生きたタイル3つ（full/encode/decode）のレンダリング", () => {
  it("入力欄が3つ存在する（各タイルに1つ）", () => {
    render(<ToolboxContent />);
    // 各 UrlEncodeTile に「入力」ラベルの textarea が1つある
    // getAllByLabelText で全件取得してカウント
    const inputs = screen.getAllByLabelText("入力");
    expect(inputs).toHaveLength(3);
  });

  it("出力欄が3つ存在する（各タイルに1つ）", () => {
    render(<ToolboxContent />);
    const outputs = screen.getAllByLabelText("出力");
    expect(outputs).toHaveLength(3);
  });

  it("variant=full のタイルには方向トグル（radiogroup）が1つ存在する", () => {
    render(<ToolboxContent />);
    // full タイルのみトグルを持つ。encode/decode は非表示なので全体で1つのはず
    const radiogroups = screen.getAllByRole("radiogroup");
    expect(radiogroups).toHaveLength(1);
  });
});

// --- TB-2: タイルはリンクではない ---
describe("TB-2: タイルはリンク/カードではない（ページ遷移なしの構造的確認）", () => {
  it("道具箱コンテナ内に <a> タグが存在しない", () => {
    const { container } = render(<ToolboxContent />);
    const anchors = container.querySelectorAll("a");
    expect(anchors).toHaveLength(0);
  });

  it("役割が link のインタラクティブ要素が存在しない", () => {
    render(<ToolboxContent />);
    expect(screen.queryAllByRole("link")).toHaveLength(0);
  });
});

// --- TB-3: ダミータイル2枚 ---
describe("TB-3: ダミータイル2枚のレンダリング", () => {
  it("「準備中のタイル」テキストが2つ表示される", () => {
    render(<ToolboxContent />);
    const dummyLabels = screen.getAllByText("（準備中のタイル）");
    expect(dummyLabels).toHaveLength(2);
  });
});

// --- TB-4: DOM id 重複ゼロ（3インスタンス同居） ---
describe("TB-4: 3インスタンス同居時の DOM id 重複ゼロ", () => {
  it("全 id 付き要素の id が一意である", () => {
    const { container } = render(<ToolboxContent />);
    const allIds = [...container.querySelectorAll("[id]")].map((el) => el.id);
    // id が1つでも存在していること（入力欄・出力欄・モード選択等）
    expect(allIds.length).toBeGreaterThan(0);
    // 重複がないこと
    const uniqueIds = new Set(allIds);
    expect(uniqueIds.size).toBe(allIds.length);
  });
});
