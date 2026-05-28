import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import TextDiffTile from "../TextDiffTile";

// =========================================================
// navigator.clipboard モック
// jsdom では navigator.clipboard.writeText が未定義のため、
// vi.stubGlobal で差し替える。
// =========================================================

beforeEach(() => {
  vi.stubGlobal("navigator", {
    ...navigator,
    clipboard: {
      writeText: vi.fn().mockResolvedValue(undefined),
    },
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("TextDiffTile", () => {
  // -------------------------------------------------------
  // 観点 (i): タイル基本レンダリング
  // 2 textarea + コピーボタン + 詳細リンクが存在する（モード select なし = line 固定）
  // -------------------------------------------------------
  it("(i) 基本レンダリング: 2 textarea + コピーボタン + 詳細リンクが DOM に存在する（select なし）", () => {
    render(<TextDiffTile />);

    // diff-old textarea が存在する
    expect(screen.getByLabelText("変更前テキスト")).toBeInTheDocument();

    // diff-new textarea が存在する
    expect(screen.getByLabelText("変更後テキスト")).toBeInTheDocument();

    // モード select は存在しない（§論点 3 C1 採択: タイル UI は line モード固定）
    expect(screen.queryByRole("combobox")).toBeNull();

    // コピーボタンが存在する
    expect(screen.getByRole("button", { name: /コピー/ })).toBeInTheDocument();

    // 詳細リンクが存在する
    expect(
      screen.getByRole("link", { name: /テキスト差分の使い方を見る/ }),
    ).toBeInTheDocument();
  });

  // -------------------------------------------------------
  // 観点 (ii): 即時計算
  // diff-old / diff-new 入力変化で結果欄即時更新
  // -------------------------------------------------------
  it("(ii) 即時計算: 2 textarea に異なるテキストを入力すると結果欄が即時更新される", () => {
    render(<TextDiffTile />);

    const oldTextarea = screen.getByLabelText("変更前テキスト");
    const newTextarea = screen.getByLabelText("変更後テキスト");

    fireEvent.change(oldTextarea, { target: { value: "apple" } });
    fireEvent.change(newTextarea, { target: { value: "orange" } });

    // 差分結果欄に何らかのテキストが表示される（差分あり状態）
    const region = screen.getByRole("region", { name: "Diff result" });
    expect(region).toBeInTheDocument();
    expect(region.textContent?.length).toBeGreaterThan(0);
  });

  // -------------------------------------------------------
  // 観点 (iii): 両入力空時の挙動（§論点 3 C1 採択: タイル UI = line モード固定）
  // 両入力が空のとき「差分なし」状態 / 差分結果欄は表示されない
  // -------------------------------------------------------
  it("(iii) 両入力空時: タイル UI はモード切替なし（line 固定）/ 両入力空では差分なし状態になる", () => {
    render(<TextDiffTile />);

    // モード select が存在しないことを確認（§論点 3 C1 採択: line モード固定）
    expect(screen.queryByRole("combobox")).toBeNull();

    // 両入力空（初期状態）では差分結果欄が表示されない
    expect(screen.queryByRole("region", { name: "Diff result" })).toBeNull();

    // 差分なしメッセージが表示される
    expect(screen.getByText(/テキストに差分はありません/)).toBeInTheDocument();
  });

  // -------------------------------------------------------
  // 観点 (iv): 差分結果のハイライト（追加 + 記号「+」）
  // インラインスタイル方式のため data-part="added" 属性で検出する
  // -------------------------------------------------------
  it("(iv) added ハイライト: 追加テキストに対して data-part=added の span が付与される", () => {
    render(<TextDiffTile />);

    const oldTextarea = screen.getByLabelText("変更前テキスト");
    const newTextarea = screen.getByLabelText("変更後テキスト");

    // 「」→ 「added text」: 追加された差分
    fireEvent.change(oldTextarea, { target: { value: "" } });
    fireEvent.change(newTextarea, { target: { value: "added text" } });

    // 差分結果欄が存在する
    const region = screen.getByRole("region", { name: "Diff result" });
    expect(region).toBeInTheDocument();

    // data-part="added" を持つ span 要素が存在する（インラインスタイル方式の検出）
    const addedSpans = region.querySelectorAll('span[data-part="added"]');
    expect(addedSpans.length).toBeGreaterThan(0);
  });

  // -------------------------------------------------------
  // 観点 (v): 削除のハイライト（削除 + 記号「−」）
  // インラインスタイル方式のため data-part="removed" 属性で検出する
  // -------------------------------------------------------
  it("(v) removed ハイライト: 削除テキストに対して data-part=removed の span が付与される", () => {
    render(<TextDiffTile />);

    const oldTextarea = screen.getByLabelText("変更前テキスト");
    const newTextarea = screen.getByLabelText("変更後テキスト");

    // 「removed text」→ 「」: 削除された差分
    fireEvent.change(oldTextarea, { target: { value: "removed text" } });
    fireEvent.change(newTextarea, { target: { value: "" } });

    // 差分結果欄が存在する
    const region = screen.getByRole("region", { name: "Diff result" });
    expect(region).toBeInTheDocument();

    // data-part="removed" を持つ span 要素が存在する（インラインスタイル方式の検出）
    const removedSpans = region.querySelectorAll('span[data-part="removed"]');
    expect(removedSpans.length).toBeGreaterThan(0);
  });

  // -------------------------------------------------------
  // 観点 (vi): ARIA / role 二層構成
  // 長文 <pre> = role="region" / サマリ欄 = role="status" aria-live="polite"
  // -------------------------------------------------------
  it("(vi) ARIA 二層構成: 差分結果 <pre> に role=region + aria-label=Diff result が付与されている", () => {
    render(<TextDiffTile />);

    const oldTextarea = screen.getByLabelText("変更前テキスト");
    const newTextarea = screen.getByLabelText("変更後テキスト");

    fireEvent.change(oldTextarea, { target: { value: "foo" } });
    fireEvent.change(newTextarea, { target: { value: "bar" } });

    const region = screen.getByRole("region", { name: "Diff result" });
    expect(region).toHaveAttribute("role", "region");
    expect(region).toHaveAttribute("aria-label", "Diff result");
  });

  it("(vi) ARIA 二層構成: サマリ status 欄に role=status + aria-live=polite が付与されている", () => {
    render(<TextDiffTile />);

    const statusEl = screen.getByRole("status");
    expect(statusEl).toHaveAttribute("role", "status");
    expect(statusEl).toHaveAttribute("aria-live", "polite");
  });

  // -------------------------------------------------------
  // 観点 (vii): サマリ status 欄の単位（line 固定 = 「行」単位）
  // §論点 3 C1 採択: タイル UI は line モード固定 / 「行」単位のみ表示
  // NIT-2: (b) 行数カウント = part.value の行数合算（hunk 件数ではない）
  // -------------------------------------------------------
  it("(vii) サマリ status 欄: line 固定モードで「行」単位のサマリが表示される", () => {
    render(<TextDiffTile />);

    const oldTextarea = screen.getByLabelText("変更前テキスト");
    const newTextarea = screen.getByLabelText("変更後テキスト");

    // 1 行追加（line one\n → line one\nline two\n）
    fireEvent.change(oldTextarea, { target: { value: "line one\n" } });
    fireEvent.change(newTextarea, {
      target: { value: "line one\nline two\n" },
    });

    const statusEl = screen.getByRole("status");
    // line 固定モード = 「行」単位でサマリが表示される（モード select なし）
    expect(statusEl).toHaveTextContent(/行/);
    // (b) 行数カウント: 「line two\n」が 1 行追加 → "+1 行" と表示
    expect(statusEl).toHaveTextContent(/\+1 行/);
  });

  it("(vii) サマリ status 欄: 複数行追加時に行数カウント（hunk 件数ではなく行数合算）が表示される", () => {
    render(<TextDiffTile />);

    const oldTextarea = screen.getByLabelText("変更前テキスト");
    const newTextarea = screen.getByLabelText("変更後テキスト");

    // 3 行追加（空 → line1\nline2\nline3\n）
    fireEvent.change(oldTextarea, { target: { value: "" } });
    fireEvent.change(newTextarea, {
      target: { value: "line1\nline2\nline3\n" },
    });

    const statusEl = screen.getByRole("status");
    // (b) 行数カウント: 3 行追加 → "+3 行" と表示（hunk 件数 = 1 ではない）
    expect(statusEl).toHaveTextContent(/\+3 行/);
  });

  // -------------------------------------------------------
  // 観点 (viii): コピーボタン文言変化
  // 「コピー」→「コピー済み」
  // -------------------------------------------------------
  it("(viii) コピーボタン文言変化: 押下後「コピー済み」に変化する", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: false });
    render(<TextDiffTile />);

    const oldTextarea = screen.getByLabelText("変更前テキスト");
    const newTextarea = screen.getByLabelText("変更後テキスト");

    // 差分を作成してコピーボタンをアクティブにする
    fireEvent.change(oldTextarea, { target: { value: "foo" } });
    fireEvent.change(newTextarea, { target: { value: "bar" } });

    const copyBtn = screen.getByRole("button", { name: /^コピー$/ });
    expect(copyBtn).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(copyBtn);
    });

    // コピー後「コピー済み」に変化
    expect(
      screen.getByRole("button", { name: "コピー済み" }),
    ).toBeInTheDocument();
  });

  // -------------------------------------------------------
  // 観点 (ix): コピーボタン disabled（差分なし時）
  // 差分がない状態ではコピーボタンが disabled になる
  // MINOR-A: cycle-213 等と同等の DOM 検証 assertion を追加（一貫性向上）
  // -------------------------------------------------------
  it("(ix-disabled) 差分なし時にコピーボタンが disabled になる", () => {
    render(<TextDiffTile />);

    // 初期状態（両入力空 = 差分なし）ではコピーボタンが disabled
    expect(screen.getByRole("button", { name: /^コピー$/ })).toBeDisabled();
  });

  it("(ix-enabled) 差分あり時にコピーボタンが enabled になる", () => {
    render(<TextDiffTile />);

    const oldTextarea = screen.getByLabelText("変更前テキスト");
    const newTextarea = screen.getByLabelText("変更後テキスト");

    // 差分あり状態にする
    fireEvent.change(oldTextarea, { target: { value: "foo" } });
    fireEvent.change(newTextarea, { target: { value: "bar" } });

    // 差分あり状態ではコピーボタンが enabled
    expect(screen.getByRole("button", { name: /^コピー$/ })).not.toBeDisabled();
  });

  // -------------------------------------------------------
  // 観点 (x): clipboard 不在時 silent fail
  // navigator.clipboard が undefined の場合にクリックしても例外が漏れない
  // MINOR-A: try/catch silent fail の実装 (L126-128) を DOM 検証で確認
  // -------------------------------------------------------
  it("(x-silent-fail) clipboard 不在時 silent fail: 例外が漏れない", async () => {
    // navigator.clipboard を undefined に差し替え
    vi.stubGlobal("navigator", { ...navigator, clipboard: undefined });
    render(<TextDiffTile />);

    const oldTextarea = screen.getByLabelText("変更前テキスト");
    const newTextarea = screen.getByLabelText("変更後テキスト");

    // 差分あり状態にする
    fireEvent.change(oldTextarea, { target: { value: "a" } });
    fireEvent.change(newTextarea, { target: { value: "b" } });

    // コピーボタンをクリック（clipboard が undefined でも例外が漏れないこと）
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /^コピー$/ }));
    });

    // 例外漏れなし = コンポーネントが正常にレンダリングされたまま
    expect(
      screen.getByRole("button", { name: /^コピー$/ }),
    ).toBeInTheDocument();
  });

  // -------------------------------------------------------
  // 観点 (ix): 詳細リンク
  // href="/tools/text-diff" / 「テキスト差分の使い方を見る →」
  // -------------------------------------------------------
  it("(ix) 詳細リンク: /tools/text-diff へのリンクが正しいテキストで存在する", () => {
    render(<TextDiffTile />);

    const link = screen.getByRole("link", {
      name: /テキスト差分の使い方を見る/,
    });
    expect(link).toHaveAttribute("href", "/tools/text-diff");
  });

  // -------------------------------------------------------
  // 観点 (x): 差分なし枠
  // 両入力空 or 両入力同一 → 「テキストに差分はありません」表示
  // -------------------------------------------------------
  it("(x) 差分なし枠: 両入力が空のとき「テキストに差分はありません」が表示される", () => {
    render(<TextDiffTile />);

    // 初期状態（両入力空）
    expect(screen.getByText(/テキストに差分はありません/)).toBeInTheDocument();
  });

  it("(x) 差分なし枠: 両入力が同一のとき「テキストに差分はありません」が表示される", () => {
    render(<TextDiffTile />);

    const oldTextarea = screen.getByLabelText("変更前テキスト");
    const newTextarea = screen.getByLabelText("変更後テキスト");

    fireEvent.change(oldTextarea, { target: { value: "same text" } });
    fireEvent.change(newTextarea, { target: { value: "same text" } });

    expect(screen.getByText(/テキストに差分はありません/)).toBeInTheDocument();
  });

  // -------------------------------------------------------
  // 観点 (xi): D4 配色の記号と text-decoration
  // インラインスタイル方式のため data-part 属性 + style 属性で確認する
  // added span: data-part="added" + underline + "+" 記号のテキスト
  // removed span: data-part="removed" + line-through + "−" 記号のテキスト
  // -------------------------------------------------------
  it("(xi) D4 配色: added span と removed span が data-part 属性で識別可能であり正しいスタイルを持つ", () => {
    render(<TextDiffTile />);

    const oldTextarea = screen.getByLabelText("変更前テキスト");
    const newTextarea = screen.getByLabelText("変更後テキスト");

    fireEvent.change(oldTextarea, { target: { value: "old content" } });
    fireEvent.change(newTextarea, { target: { value: "new content" } });

    const region = screen.getByRole("region", { name: "Diff result" });

    // data-part="added" を持つ span が存在する（インラインスタイル方式）
    const addedSpans = region.querySelectorAll('span[data-part="added"]');
    expect(addedSpans.length).toBeGreaterThan(0);
    // added span に underline スタイルが付与されている（D4 採択確認）
    const addedSpan = addedSpans[0] as HTMLElement;
    expect(addedSpan.style.textDecoration).toContain("underline");

    // data-part="removed" を持つ span が存在する（インラインスタイル方式）
    const removedSpans = region.querySelectorAll('span[data-part="removed"]');
    expect(removedSpans.length).toBeGreaterThan(0);
    // removed span に line-through スタイルが付与されている（D4 採択確認）
    const removedSpan = removedSpans[0] as HTMLElement;
    expect(removedSpan.style.textDecoration).toContain("line-through");

    // NIT-1: D4 採択の中核要素 = 記号「+」「−」のテキスト assertion
    // added span の先頭が「+」(U+002B PLUS SIGN) で始まることを確認
    expect(addedSpan.textContent).toMatch(/^\+/);
    // removed span の先頭が「−」(U+2212 MINUS SIGN) で始まることを確認
    expect(removedSpan.textContent).toMatch(/^−/); // U+2212 MINUS SIGN
  });

  // -------------------------------------------------------
  // 観点 (xii): 大量入力（10,000 字）でも即時計算が走り結果が表示される
  // -------------------------------------------------------
  it("(xii) 大量入力: 10,000 字入力でも即時計算が走り結果欄が表示される", () => {
    render(<TextDiffTile />);

    const oldTextarea = screen.getByLabelText("変更前テキスト");
    const newTextarea = screen.getByLabelText("変更後テキスト");

    // 10,000 字の異なるテキスト（差分あり）
    fireEvent.change(oldTextarea, {
      target: { value: "a".repeat(10_000) },
    });
    fireEvent.change(newTextarea, {
      target: { value: "b".repeat(10_000) },
    });

    // 差分結果欄が表示される（即時計算が走った証拠）
    const region = screen.getByRole("region", { name: "Diff result" });
    expect(region).toBeInTheDocument();
    expect(region.textContent?.length).toBeGreaterThan(0);
  });

  // -------------------------------------------------------
  // 設計テスト: useMemo 派生計算のタイマー使用なしを保証
  // vi.getTimerCount() によりテキスト入力でタイマーが増えないことを検証
  // （コピーボタン押下前 = diff 計算のみが走る状態）
  // -------------------------------------------------------
  it("(設計) 即時計算はタイマーを使わない: テキスト入力変化でタイマー数が増えない（useMemo 派生計算の確認）", () => {
    vi.useFakeTimers({ shouldAdvanceTime: false });
    render(<TextDiffTile />);

    const oldTextarea = screen.getByLabelText("変更前テキスト");
    const newTextarea = screen.getByLabelText("変更後テキスト");

    // レンダリング直後のタイマー数を記録（React 内部タイマーを基準値として扱う）
    const timerCountAfterRender = vi.getTimerCount();

    // テキスト入力変化（useMemo による即時派生計算 = debounce/setTimeout を使わない）
    fireEvent.change(oldTextarea, { target: { value: "hello" } });
    fireEvent.change(newTextarea, { target: { value: "world" } });

    // テキスト入力後のタイマー数がレンダリング直後から増えていないこと
    // （debounce / setTimeout が使われていないことを保証）
    expect(vi.getTimerCount()).toBe(timerCountAfterRender);
  });
});
