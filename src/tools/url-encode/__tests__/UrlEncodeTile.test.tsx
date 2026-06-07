/**
 * UrlEncodeTile のユニットテスト（T-1 TDD: 実装前に書く）
 *
 * 検証観点:
 * - V-1: variant=full でのレンダリング（方向トグルが表示される）
 * - V-2: variant=encode でのレンダリング（方向固定・トグル非表示）
 * - V-3: variant=decode でのレンダリング（方向固定・トグル非表示）
 * - V-4: variant=encode でエンコード変換が動く
 * - V-5: variant=decode でデコード変換が動く
 * - V-6: variant=full でエンコード→デコード切り替えが動く
 * - V-7: id インスタンス一意性（同一ページに2つ描画して input id が重複しない）
 * - V-8: タイルのルートが Panel（data-testid or セマンティクスで確認）
 */
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import UrlEncodeTile from "../UrlEncodeTile";

// --- V-1: variant=full ---
describe("V-1: variant=full", () => {
  it("方向トグル（SegmentedControl）が表示される", () => {
    render(<UrlEncodeTile variant="full" />);
    expect(screen.getByRole("radiogroup")).toBeInTheDocument();
  });

  it("入力欄と出力欄が存在する", () => {
    render(<UrlEncodeTile variant="full" />);
    expect(screen.getByLabelText("入力")).toBeInTheDocument();
    expect(screen.getByLabelText("出力")).toBeInTheDocument();
  });
});

// --- V-2: variant=encode ---
describe("V-2: variant=encode（方向固定・トグル非表示）", () => {
  it("SegmentedControl（radiogroup）が表示されない", () => {
    render(<UrlEncodeTile variant="encode" />);
    expect(screen.queryByRole("radiogroup")).not.toBeInTheDocument();
  });

  it("入力欄と出力欄が存在する", () => {
    render(<UrlEncodeTile variant="encode" />);
    expect(screen.getByLabelText("入力")).toBeInTheDocument();
    expect(screen.getByLabelText("出力")).toBeInTheDocument();
  });
});

// --- V-3: variant=decode ---
describe("V-3: variant=decode（方向固定・トグル非表示）", () => {
  it("SegmentedControl（radiogroup）が表示されない", () => {
    render(<UrlEncodeTile variant="decode" />);
    expect(screen.queryByRole("radiogroup")).not.toBeInTheDocument();
  });

  it("入力欄と出力欄が存在する", () => {
    render(<UrlEncodeTile variant="decode" />);
    expect(screen.getByLabelText("入力")).toBeInTheDocument();
    expect(screen.getByLabelText("出力")).toBeInTheDocument();
  });
});

// --- V-4: variant=encode での変換動作 ---
describe("V-4: variant=encode での変換", () => {
  it("入力するとエンコード結果が表示される", () => {
    render(<UrlEncodeTile variant="encode" />);
    const input = screen.getByLabelText("入力");
    fireEvent.change(input, { target: { value: "あ" } });
    const output = screen.getByLabelText("出力") as HTMLTextAreaElement;
    expect(output.value).toBe("%E3%81%82");
  });
});

// --- V-5: variant=decode での変換動作 ---
describe("V-5: variant=decode での変換", () => {
  it("入力するとデコード結果が表示される", () => {
    render(<UrlEncodeTile variant="decode" />);
    const input = screen.getByLabelText("入力");
    fireEvent.change(input, { target: { value: "%E3%81%82" } });
    const output = screen.getByLabelText("出力") as HTMLTextAreaElement;
    expect(output.value).toBe("あ");
  });
});

// --- V-6: variant=full でのトグル切り替え ---
describe("V-6: variant=full でのトグル切り替え", () => {
  it("デコードに切り替えてデコードが動く", () => {
    render(<UrlEncodeTile variant="full" />);
    const decodeBtn = screen.getByRole("radio", { name: "デコード" });
    fireEvent.click(decodeBtn);
    const input = screen.getByLabelText("入力");
    fireEvent.change(input, { target: { value: "%E3%81%82" } });
    const output = screen.getByLabelText("出力") as HTMLTextAreaElement;
    expect(output.value).toBe("あ");
  });
});

// --- V-7: id インスタンス一意性 ---
describe("V-7: id インスタンス一意性", () => {
  it("同一ページに2つ描画しても input id が重複しない", () => {
    const { container: c1 } = render(<UrlEncodeTile variant="full" />);
    const { container: c2 } = render(<UrlEncodeTile variant="encode" />);

    // 各コンテナの input id を取得
    const input1 = c1.querySelector("textarea[id]");
    const input2 = c2.querySelector("textarea[id]");

    expect(input1).not.toBeNull();
    expect(input2).not.toBeNull();
    // 2つの id は異なるはず
    expect(input1!.id).not.toBe(input2!.id);
  });

  it("variant=full と variant=decode を同居させても全要素 id が重複しない", () => {
    const { container: c1 } = render(<UrlEncodeTile variant="full" />);
    const { container: c2 } = render(<UrlEncodeTile variant="decode" />);

    // 各コンテナから全 id 付き要素を収集
    const ids1 = [...c1.querySelectorAll("[id]")].map((el) => el.id);
    const ids2 = [...c2.querySelectorAll("[id]")].map((el) => el.id);

    // 共通する id が0個であること
    const overlap = ids1.filter((id) => ids2.includes(id));
    expect(overlap).toHaveLength(0);
  });
});

// --- V-8: デフォルト variant は full と同等 ---
describe("V-8: デフォルト variant", () => {
  it("variant 未指定の場合 full と同等の動作をする（トグルが表示される）", () => {
    render(<UrlEncodeTile />);
    expect(screen.getByRole("radiogroup")).toBeInTheDocument();
  });
});
