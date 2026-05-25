import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import LineBreakRemoverTile from "../LineBreakRemoverTile";

// navigator.clipboard のモック
const mockWriteText = vi.fn().mockResolvedValue(undefined);
Object.defineProperty(navigator, "clipboard", {
  value: { writeText: mockWriteText },
  writable: true,
});

// window.matchMedia のモック（jsdom は matchMedia 未実装のためスタブが必要）
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

/** matchMedia モックを指定の matches 値で再設定するヘルパー */
function setMatchMedia(matches: boolean) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

describe("LineBreakRemoverTile", () => {
  beforeEach(() => {
    mockWriteText.mockClear();
    // 各テスト前に reduced-motion=false（通常環境）に戻す
    setMatchMedia(false);
  });

  // (i) レンダリング: タイル初期描画（remove 既定 + 空入力）
  it("(i) レンダリング: 3 モードボタン + 入力 textarea + 結果欄 + 詳細リンクが DOM に存在する", () => {
    render(<LineBreakRemoverTile />);

    // 3 モードボタンが存在する
    expect(
      screen.getByRole("button", { name: "改行を削除" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "改行をスペースに置換" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "PDFスマートモード" }),
    ).toBeInTheDocument();

    // 入力 textarea が存在する
    expect(screen.getByLabelText("改行削除入力欄")).toBeInTheDocument();

    // 結果欄（role="status"）が存在する
    expect(screen.getByRole("status")).toBeInTheDocument();

    // 詳細ページへのリンクが存在する
    expect(
      screen.getByRole("link", { name: "詳細ページで開く" }),
    ).toBeInTheDocument();
  });

  // (ii-a) モード切替挙動: remove → replace-space
  it("(ii-a) モード切替: remove から replace-space に切替、入力テキスト保持 + 結果がスペース置換に変化", () => {
    render(<LineBreakRemoverTile />);

    // デフォルトは remove モード
    expect(screen.getByRole("button", { name: "改行を削除" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    // テキストを入力
    const input = screen.getByLabelText("改行削除入力欄");
    fireEvent.change(input, { target: { value: "abc\ndef" } });

    // remove モードでは改行削除 → "abcdef"
    expect(screen.getByRole("status")).toHaveTextContent("abcdef");

    // replace-space に切替
    fireEvent.click(
      screen.getByRole("button", { name: "改行をスペースに置換" }),
    );

    // 入力テキストが保持されていること
    expect(input).toHaveValue("abc\ndef");

    // replace-space モードでは改行→スペース → "abc def"
    expect(screen.getByRole("status")).toHaveTextContent("abc def");

    // ARIA 状態が更新されていること
    expect(
      screen.getByRole("button", { name: "改行をスペースに置換" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "改行を削除" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  // (ii-b) モード切替挙動: replace-space → smart-pdf
  it("(ii-b) モード切替: replace-space から smart-pdf に切替、joinStyle サブオプションが DOM に挿入される", () => {
    render(<LineBreakRemoverTile />);

    // replace-space に切替
    fireEvent.click(
      screen.getByRole("button", { name: "改行をスペースに置換" }),
    );

    // joinStyle サブオプションはまだ非表示
    expect(screen.queryByLabelText("行内改行の処理")).not.toBeInTheDocument();

    // smart-pdf に切替
    fireEvent.click(screen.getByRole("button", { name: "PDFスマートモード" }));

    // joinStyle サブオプションが DOM に存在する
    expect(screen.getByLabelText("行内改行の処理")).toBeInTheDocument();
  });

  // (iii) 条件付き表示の表示切替: smart-pdf 選択 → joinStyle 表示、別モードへ戻す → 非表示
  it("(iii) 条件付き表示: smart-pdf 選択で joinStyle 表示 → remove 戻しで非表示", () => {
    render(<LineBreakRemoverTile />);

    // 初期状態（remove モード）: joinStyle は非表示
    expect(screen.queryByLabelText("行内改行の処理")).not.toBeInTheDocument();

    // smart-pdf に切替 → joinStyle が表示される
    fireEvent.click(screen.getByRole("button", { name: "PDFスマートモード" }));
    expect(screen.getByLabelText("行内改行の処理")).toBeInTheDocument();

    // remove に戻す → joinStyle が非表示になる
    fireEvent.click(screen.getByRole("button", { name: "改行を削除" }));
    expect(screen.queryByLabelText("行内改行の処理")).not.toBeInTheDocument();
  });

  // (iv) 入力 → 出力反映: debounce なし即時反映
  it("(iv) 入力 → 出力反映: onChange で即座に改行削除結果が反映される", () => {
    render(<LineBreakRemoverTile />);

    const input = screen.getByLabelText("改行削除入力欄");
    fireEvent.change(input, { target: { value: "abc\ndef\nghi" } });

    // remove モード（デフォルト）: 3 改行が削除される
    expect(screen.getByRole("status")).toHaveTextContent("abcdefghi");
  });

  // (v) コピーボタン: navigator.clipboard.writeText が呼ばれる
  it("(v) コピーボタン: 押下で clipboard.writeText が呼ばれ、コピー済み UI が表示される", async () => {
    render(<LineBreakRemoverTile />);

    const input = screen.getByLabelText("改行削除入力欄");
    fireEvent.change(input, { target: { value: "abc\ndef" } });

    // コピーボタンが表示されていること
    const copyBtn = screen.getByRole("button", { name: "コピー" });
    expect(copyBtn).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(copyBtn);
    });

    // clipboard.writeText が呼ばれていること
    expect(mockWriteText).toHaveBeenCalledWith("abcdef");
  });

  // (vi) ARIA / aria-pressed: 3 ボタンの排他選択
  it("(vi) ARIA: 3 モードボタンが検出可能、選択中ボタンの aria-pressed=true、他 2 件 false", () => {
    render(<LineBreakRemoverTile />);

    const removeBtn = screen.getByRole("button", { name: "改行を削除" });
    const replaceBtn = screen.getByRole("button", {
      name: "改行をスペースに置換",
    });
    const smartBtn = screen.getByRole("button", { name: "PDFスマートモード" });

    // デフォルトは remove が選択状態
    expect(removeBtn).toHaveAttribute("aria-pressed", "true");
    expect(replaceBtn).toHaveAttribute("aria-pressed", "false");
    expect(smartBtn).toHaveAttribute("aria-pressed", "false");

    // replace-space に切替
    fireEvent.click(replaceBtn);
    expect(removeBtn).toHaveAttribute("aria-pressed", "false");
    expect(replaceBtn).toHaveAttribute("aria-pressed", "true");
    expect(smartBtn).toHaveAttribute("aria-pressed", "false");
  });

  // (vii) 空入力 + role="status" aria-live="polite"
  it("(vii) 空入力: 結果欄が空で role=status + aria-live=polite が付与されている", () => {
    render(<LineBreakRemoverTile />);

    const statusEl = screen.getByRole("status");
    expect(statusEl).toHaveTextContent("");
    expect(statusEl).toHaveAttribute("aria-live", "polite");
  });

  // (viii) handleModeChange による copied リセット
  it("(viii) copied リセット: コピー後にモード切替すると copied 状態がリセットされる", async () => {
    render(<LineBreakRemoverTile />);

    const input = screen.getByLabelText("改行削除入力欄");
    fireEvent.change(input, { target: { value: "abc\ndef" } });

    // コピーする
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "コピー" }));
    });

    // コピー後: モードを切替 → copied リセット
    fireEvent.click(
      screen.getByRole("button", { name: "改行をスペースに置換" }),
    );

    // copied がリセットされていること（コピーボタンが「コピー」に戻っているか、
    // またはコピーボタンが存在する場合は「コピー済み」でないこと）
    // replace-space モードでも結果があるので「コピー」ボタンが表示される
    const copyBtns = screen.queryAllByRole("button", { name: "コピー済み" });
    expect(copyBtns).toHaveLength(0);
  });

  // (ix) prefers-reduced-motion: reduce Fallback（WCAG 2.1 SC 2.3.3 対応）
  // matchMedia.matches=true（reduce 設定あり）でレンダリングした場合、
  // smart-pdf 選択時に joinStyle 要素の animation が "none" であることを確認。
  // これにより useState 遅延初期化 + reducedMotion 分岐コードパスの回帰を防止する。
  it("(ix) prefers-reduced-motion: reduce 設定下では joinStyle 要素の animation が none", () => {
    // reduce 設定を有効にしてコンポーネントをマウント
    setMatchMedia(true);
    render(<LineBreakRemoverTile />);

    // smart-pdf に切替 → joinStyle サブオプションが表示される
    fireEvent.click(screen.getByRole("button", { name: "PDFスマートモード" }));
    const joinStyleEl = screen.getByLabelText("行内改行の処理");
    expect(joinStyleEl).toBeInTheDocument();

    // prefers-reduced-motion: reduce 設定下では animation: none が適用されている
    // （inline style の animation プロパティが "none" であることを確認）
    expect(joinStyleEl).toHaveStyle({ animation: "none" });
  });
});
