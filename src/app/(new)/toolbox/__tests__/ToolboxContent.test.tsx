/**
 * ToolboxContent のユニットテスト（cycle-227 T-4 で再設計）
 *
 * 検証観点:
 * - TB-1: 道具箱に展示した全タイル（url-encode / html-entity / base64 / fullwidth）の
 *   各 variant（full＋方向固定 1 枚）が実際に描画されている
 *   → 新タイルが道具箱に存在しないと検出できる実在確認（数合わせの死んだアサーションを排除）
 * - TB-2: タイルはリンクではない（<a> タグが道具箱コンテナに存在しない）
 *   → ページ遷移なしに機能することの構造的確認
 * - TB-3: ダミータイルが存在しない（全 2 枚を本物タイルに差し替え済み）
 * - TB-4: 複数タイル（9 インスタンス）同居時の DOM id 重複ゼロ
 *   → useId 一意化が道具箱文脈でも成立することを確認
 * - TB-5: タイルラッパーがレスポンシブ幅（maxWidth）を使用している
 */
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import ToolboxContent from "../ToolboxContent";

// --- TB-1: 全展示タイルの実在確認 ---
// 各タイルの代表ラベルで「道具箱に実在し描画されている」を検証する。
// 数合わせではなく、ラベル文言で各タイルの存在を直接確認する。
describe("TB-1: 道具箱に展示した全タイル variant が描画されている", () => {
  // --- url-encode タイル ---
  it("url-encode: 入力欄が3つ存在する（full/encode/decode の各 variant）", () => {
    render(<ToolboxContent />);
    // UrlEncodeTile は「入力」ラベルの textarea を持つ
    const inputs = screen.getAllByLabelText("入力");
    expect(inputs).toHaveLength(3);
  });

  it("url-encode: 出力欄が3つ存在する（full/encode/decode の各 variant）", () => {
    render(<ToolboxContent />);
    const outputs = screen.getAllByLabelText("出力");
    expect(outputs).toHaveLength(3);
  });

  // --- html-entity タイル ---
  // encode variant の入力ラベルは「テキスト入力」
  it("html-entity (full): 「テキスト入力」ラベルが1つ以上存在する", () => {
    render(<ToolboxContent />);
    // html-entity full（初期 encode）と encode variant の両方が「テキスト入力」を持つ
    const textInputs = screen.getAllByLabelText("テキスト入力");
    // html-entity full＋encode の2枚 + base64 full＋encode の2枚 = 4つ
    expect(textInputs.length).toBeGreaterThanOrEqual(2);
  });

  it("html-entity: エンコード結果ラベルが1つ以上存在する", () => {
    render(<ToolboxContent />);
    // html-entity full の出力ラベルは「エンコード結果」
    // (Base64Tile は「Base64出力」なので混在しない)
    const encodeResults = screen.getAllByLabelText("エンコード結果");
    expect(encodeResults.length).toBeGreaterThanOrEqual(2);
  });

  // --- base64 タイル ---
  // 道具箱は base64 full＋encode の2枚を展示（full の初期方向は encode）
  // encode 方向の入力ラベルは「テキスト入力」（「テキスト入力」は html-entity と共有）
  it("base64: 「Base64出力」ラベルが1つ以上存在する", () => {
    render(<ToolboxContent />);
    // base64 full（初期 encode）・encode の出力ラベルは「Base64出力」
    const base64Outputs = screen.getAllByLabelText("Base64出力");
    expect(base64Outputs.length).toBeGreaterThanOrEqual(2);
  });

  it("base64: URL-safe トグルが1つ以上存在する（encode 方向の base64 タイル固有のコントロール）", () => {
    render(<ToolboxContent />);
    // Base64Tile の encode 方向のみ持つ固有コントロール「URL-safe 形式で出力」
    const urlSafeToggles = screen.getAllByLabelText("URL-safe 形式で出力");
    // full（初期 encode）＋encode variant の2枚
    expect(urlSafeToggles.length).toBeGreaterThanOrEqual(2);
  });

  // --- fullwidth-converter タイル ---
  it("fullwidth-converter: 「入力テキスト」ラベルが1つ以上存在する", () => {
    render(<ToolboxContent />);
    // FullwidthConverterTile の入力ラベルは常に「入力テキスト」
    const fullwidthInputs = screen.getAllByLabelText("入力テキスト");
    // full＋toHalfwidth の2枚
    expect(fullwidthInputs.length).toBeGreaterThanOrEqual(2);
  });

  it("fullwidth-converter: 「変換対象」グループが1つ以上存在する", () => {
    render(<ToolboxContent />);
    // FullwidthConverterTile の checkbox group は aria-label="変換対象"
    const checkboxGroups = screen.getAllByRole("group", {
      name: "変換対象",
    });
    // full＋toHalfwidth の2枚
    expect(checkboxGroups.length).toBeGreaterThanOrEqual(2);
  });

  // --- radiogroup 数（full variant ごとに方向トグルが1つ） ---
  // url-encode full＋html-entity full＋base64 full＋fullwidth-converter full = 計4
  it("方向トグル（radiogroup）が4つ存在する（各 full variant に1つずつ）", () => {
    render(<ToolboxContent />);
    const radiogroups = screen.getAllByRole("radiogroup");
    expect(radiogroups).toHaveLength(4);
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

// --- TB-3: ダミータイルが存在しない（全 2 枚を本物タイルに差し替え済み） ---
describe("TB-3: ダミータイルが存在しない", () => {
  it("「準備中のタイル」テキストが表示されない", () => {
    render(<ToolboxContent />);
    const dummyLabels = screen.queryAllByText("（準備中のタイル）");
    expect(dummyLabels).toHaveLength(0);
  });
});

// --- TB-4: DOM id 重複ゼロ（9インスタンス同居） ---
describe("TB-4: 9インスタンス同居時の DOM id 重複ゼロ", () => {
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

// --- TB-5: レスポンシブ幅（横スクロール防止） ---
// タイルラッパーは固定 width ではなく maxWidth を使い、
// 親より広い場合のみ tile-grid 規格幅・狭い場合は親に収まる設計になっているか確認。
// （実機での横スクロール有無は PM が Playwright で確認するが、
//   DOM 構造として width 固定でないことをここで保証する）
describe("TB-5: タイルラッパーがレスポンシブ幅（maxWidth）を使用している", () => {
  it("タイルラッパーの style に width の固定値がなく maxWidth が設定されている", () => {
    const { container } = render(<ToolboxContent />);
    // tileWrapper クラスの要素を全件取得
    const wrappers = container.querySelectorAll<HTMLElement>(
      "[class*='tileWrapper']",
    );
    expect(wrappers.length).toBeGreaterThan(0);
    wrappers.forEach((wrapper) => {
      // width 固定がないこと（空文字 or 未設定）
      expect(wrapper.style.width).toBeFalsy();
      // maxWidth が設定されていること
      expect(wrapper.style.maxWidth).toBeTruthy();
    });
  });
});
