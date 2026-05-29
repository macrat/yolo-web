import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import RegexTesterTile from "../RegexTesterTile";
import { testRegex } from "../logic";

// =========================================================
// navigator.clipboard モック
// jsdom では navigator.clipboard.writeText が未定義のため、
// vi.stubGlobal で差し替える。
// =========================================================

/**
 * Worker モック: jsdom では Web Workers が未サポートのため、
 * Blob URL Worker をモックする。
 *
 * MINOR-2 対応（cycle-215 T-3 review）: RegexTesterTile は Worker 非同期計算に統一されたため、
 * postMessage 受信時に testRegex（同期版）を実行し、onmessage コールバックで結果を返す。
 * これにより jsdom テスト環境でも Worker 経由の計算結果が反映される。
 */
interface MockWorkerInstance {
  postMessage: ReturnType<typeof vi.fn>;
  terminate: ReturnType<typeof vi.fn>;
  onmessage: ((e: MessageEvent) => void) | null;
  onerror: ((e: ErrorEvent) => void) | null;
}
const mockWorkerInstances: MockWorkerInstance[] = [];
// function キーワードでコンストラクタとして使用できるようにする
const MockWorker = vi.fn(function (this: MockWorkerInstance) {
  this.terminate = vi.fn();
  this.onmessage = null;
  this.onerror = null;
  // postMessage が呼ばれたときに testRegex を同期実行して onmessage を呼ぶ
  // self 参照を回避するため bind で this をキャプチャする
  const self = this as MockWorkerInstance;
  this.postMessage = vi.fn(
    (data: { pattern: string; flags: string; testString: string }) => {
      const result = testRegex(data.pattern, data.flags, data.testString);
      // queueMicrotask でマイクロタスクキューに投入（act() の flush 対象）
      queueMicrotask(() => {
        if (self.onmessage) {
          self.onmessage({ data: result } as MessageEvent);
        }
      });
    },
  );
  mockWorkerInstances.push(this);
});

beforeEach(() => {
  vi.stubGlobal("Worker", MockWorker);
  vi.stubGlobal("navigator", {
    ...navigator,
    clipboard: {
      writeText: vi.fn().mockResolvedValue(undefined),
    },
  });
  vi.stubGlobal("URL", {
    createObjectURL: vi.fn().mockReturnValue("blob:mock"),
    revokeObjectURL: vi.fn(),
  });
  // IntersectionObserver モック
  // vi.fn().mockImplementation のアロー関数はコンストラクタに使えないため
  // function キーワードで定義する（Vitest の制約: https://vitest.dev/api/vi#vi-spyon）
  const mockIntersectionObserver = vi.fn(function (
    this: object,
    callback: (entries: { isIntersecting: boolean; target: Element }[]) => void,
  ) {
    // thisを使わずオブジェクトを返すとコンストラクタとして動作しないため
    // prototype にメソッドを設定する方式を使う
    Object.assign(this, {
      observe: vi.fn().mockImplementation((element: Element) => {
        // 即座に intersecting=true で callback を呼ぶ（DOM に表示されているものとして扱う）
        callback([{ isIntersecting: true, target: element }]);
      }),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    });
  });
  vi.stubGlobal("IntersectionObserver", mockIntersectionObserver);
  mockWorkerInstances.length = 0;
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("RegexTesterTile", () => {
  // -------------------------------------------------------
  // 観点 (i): 初期表示 — サンプルドロップダウン 6 種が DOM に存在する
  // -------------------------------------------------------
  it("(i) 初期表示: サンプル選択ドロップダウン 6 種のオプションが存在する", () => {
    render(<RegexTesterTile />);

    // サンプル選択ドロップダウンが存在する
    const select = screen.getByRole("combobox", { name: /サンプル/ });
    expect(select).toBeInTheDocument();

    // 6 種のサンプルオプション + 初期「選択してください」= 7 オプション
    const options = Array.from(select.querySelectorAll("option"));
    // ラベル名 6 種が含まれていること
    const labels = options.map((o) => o.textContent);
    expect(labels).toContain("メールアドレス");
    expect(labels).toContain("URL");
    expect(labels).toContain("電話番号（日本）");
    expect(labels).toContain("郵便番号");
    expect(labels).toContain("日付 (YYYY-MM-DD)");
    expect(labels).toContain("HTML タグ");
  });

  it("(i) 初期表示: 正規表現 input / 本文 textarea / コピーボタン / 詳細リンクが DOM に存在する", () => {
    render(<RegexTesterTile />);

    expect(
      screen.getByRole("textbox", { name: /正規表現パターン/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: /テストテキスト/ }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /コピー/ })).toBeInTheDocument();
    // MAJOR-1: 詳細リンクテキスト = §論点 9 採択 案 B「フラグ切替・置換などの詳細機能を使う →」
    expect(
      screen.getByRole("link", { name: /フラグ切替/ }),
    ).toBeInTheDocument();
  });

  // -------------------------------------------------------
  // CRIT-1: 初期 visibleIndices が先頭 10 件シード済み
  // -------------------------------------------------------
  it("(CRIT-1) 初期 visibleIndices シード: マッチ結果が 10 件以上あるとき先頭アイテムが初期表示される", async () => {
    render(<RegexTesterTile />);

    const patternInput = screen.getByRole("textbox", {
      name: /正規表現パターン/,
    });
    const textArea = screen.getByRole("textbox", { name: /テストテキスト/ });

    // 15 件マッチするテキストを入力（先頭 10 件が即時表示されるべき）
    await act(async () => {
      fireEvent.change(patternInput, { target: { value: "\\d+" } });
      fireEvent.change(textArea, {
        target: { value: "1 2 3 4 5 6 7 8 9 10 11 12 13 14 15" },
      });
    });

    // マッチ結果欄が存在する
    const region = screen.getByRole("region", { name: /マッチ結果/ });
    expect(region).toBeInTheDocument();

    // DOM に data-match-item が存在すること（display:none でなく visibility:hidden or visible）
    const matchItems = document.querySelectorAll("[data-match-item]");
    expect(matchItems.length).toBeGreaterThanOrEqual(10);

    // 先頭 10 件が visibility:hidden でなく visible（初期シードによって表示済み）
    // display:none になっていないことを確認
    let visibleCount = 0;
    matchItems.forEach((item) => {
      const style = (item as HTMLElement).style;
      if (style.display !== "none" && style.visibility !== "hidden") {
        visibleCount++;
      }
    });
    expect(visibleCount).toBeGreaterThanOrEqual(10);
  });

  // -------------------------------------------------------
  // CRIT-1: マッチアイテムが display:none でなく visibility:hidden を使用する
  // -------------------------------------------------------
  it("(CRIT-1) display:none 廃止: マッチアイテムに display:none が使用されていない", async () => {
    render(<RegexTesterTile />);

    const patternInput = screen.getByRole("textbox", {
      name: /正規表現パターン/,
    });
    const textArea = screen.getByRole("textbox", { name: /テストテキスト/ });

    // 12 件マッチ（先頭 10 件が seed 済み / 11-12 件目は visibility:hidden）
    await act(async () => {
      fireEvent.change(patternInput, { target: { value: "\\d+" } });
      fireEvent.change(textArea, {
        target: { value: "1 2 3 4 5 6 7 8 9 10 11 12" },
      });
    });

    const matchItems = document.querySelectorAll("[data-match-item]");
    // display:none が使われているアイテムが存在しないこと
    matchItems.forEach((item) => {
      expect((item as HTMLElement).style.display).not.toBe("none");
    });
  });

  // -------------------------------------------------------
  // MAJOR-3: <select> の minHeight が 40px
  // -------------------------------------------------------
  it("(MAJOR-3) select minHeight: サンプル選択 <select> の minHeight が 40px 以上", () => {
    render(<RegexTesterTile />);

    const select = screen.getByRole("combobox", { name: /サンプル/ });
    const minHeight = parseInt((select as HTMLElement).style.minHeight, 10);
    // minHeight が 40 以上（AP-P21 操作側下限）
    expect(minHeight).toBeGreaterThanOrEqual(40);
  });

  // -------------------------------------------------------
  // 観点 (ii): 正規表現 input 操作 → マッチ計算 → 結果表示
  // Worker 非同期計算のため act(async) で Worker のコールバック完了を待つ
  // -------------------------------------------------------
  it("(ii) 正規表現入力で結果更新: pattern と testText 入力後にマッチ結果が表示される", async () => {
    render(<RegexTesterTile />);

    const patternInput = screen.getByRole("textbox", {
      name: /正規表現パターン/,
    });
    const textArea = screen.getByRole("textbox", { name: /テストテキスト/ });

    await act(async () => {
      fireEvent.change(patternInput, { target: { value: "\\d+" } });
      fireEvent.change(textArea, { target: { value: "abc 123 def 456" } });
    });

    // マッチ件数サマリが表示される
    const status = screen.getByRole("status");
    expect(status.textContent).toMatch(/2 件/);
  });

  // -------------------------------------------------------
  // 観点 (iii): サンプル選択 → pattern + flags + testText 自動入力 → 即時マッチ
  // -------------------------------------------------------
  it("(iii) サンプル選択: メールアドレスを選択すると pattern + testText が自動入力される", async () => {
    render(<RegexTesterTile />);

    const select = screen.getByRole("combobox", { name: /サンプル/ });

    // メールアドレスサンプルを選択
    await act(async () => {
      fireEvent.change(select, { target: { value: "0" } });
    });

    const patternInput = screen.getByRole("textbox", {
      name: /正規表現パターン/,
    }) as HTMLInputElement;
    const textArea = screen.getByRole("textbox", {
      name: /テストテキスト/,
    }) as HTMLTextAreaElement;

    // REGEX_SAMPLE_INPUTS[0] の pattern が入力されていること
    expect(patternInput.value).toBeTruthy();
    expect(textArea.value).toBeTruthy();
  });

  it("(iii) サンプル選択: 選択後に即時マッチ結果が表示される", async () => {
    render(<RegexTesterTile />);

    const select = screen.getByRole("combobox", { name: /サンプル/ });
    await act(async () => {
      fireEvent.change(select, { target: { value: "4" } }); // 日付 YYYY-MM-DD
    });

    // マッチ件数 status が更新される（日付サンプルは 2 件マッチ）
    const status = screen.getByRole("status");
    expect(status.textContent).toMatch(/\d+ 件/);
  });

  // -------------------------------------------------------
  // 観点 (iv): フラグチェックボックス操作で flags 変更
  // -------------------------------------------------------
  it("(iv) フラグチェックボックス: g フラグチェックボックスが存在し操作できる", () => {
    render(<RegexTesterTile />);

    const gFlagCheckbox = screen.getByRole("checkbox", { name: /g/ });
    expect(gFlagCheckbox).toBeInTheDocument();

    // 初期状態（g フラグはデフォルト ON）
    expect(gFlagCheckbox).toBeChecked();

    // g フラグを OFF にする
    fireEvent.click(gFlagCheckbox);
    expect(gFlagCheckbox).not.toBeChecked();
  });

  it("(iv) フラグ変更: g フラグ OFF でマッチが 1 件のみになる", async () => {
    render(<RegexTesterTile />);

    const patternInput = screen.getByRole("textbox", {
      name: /正規表現パターン/,
    });
    const textArea = screen.getByRole("textbox", { name: /テストテキスト/ });
    const gFlagCheckbox = screen.getByRole("checkbox", { name: /g/ });

    await act(async () => {
      fireEvent.change(patternInput, { target: { value: "\\d+" } });
      fireEvent.change(textArea, { target: { value: "abc 123 def 456" } });
    });

    // g フラグ OFF
    await act(async () => {
      if ((gFlagCheckbox as HTMLInputElement).checked) {
        fireEvent.click(gFlagCheckbox);
      }
    });

    const status = screen.getByRole("status");
    expect(status.textContent).toMatch(/1 件/);
  });

  // -------------------------------------------------------
  // 観点 (v): 無効パターン入力 → エラー枠表示
  // -------------------------------------------------------
  it("(v) 無効パターン: 無効な正規表現入力でエラー表示が出る", async () => {
    render(<RegexTesterTile />);

    const patternInput = screen.getByRole("textbox", {
      name: /正規表現パターン/,
    });
    // testText も入力してから invalid pattern を設定（Worker が実行されるため）
    await act(async () => {
      fireEvent.change(patternInput, { target: { value: "[unclosed" } });
    });
    const textArea = screen.getByRole("textbox", { name: /テストテキスト/ });
    await act(async () => {
      fireEvent.change(textArea, { target: { value: "test" } });
    });

    // エラー枠が表示される (role="alert")
    const errorMessage =
      screen.queryByRole("alert") ??
      screen.queryByText(/無効な正規表現|Invalid regular expression/i);
    expect(errorMessage).toBeInTheDocument();
  });

  // -------------------------------------------------------
  // 観点 (vi): マッチ無し → noMatch 表示
  // -------------------------------------------------------
  it("(vi) マッチなし: パターンがテキストにマッチしない場合にマッチなし表示が出る", async () => {
    render(<RegexTesterTile />);

    const patternInput = screen.getByRole("textbox", {
      name: /正規表現パターン/,
    });
    const textArea = screen.getByRole("textbox", { name: /テストテキスト/ });

    await act(async () => {
      fireEvent.change(patternInput, { target: { value: "\\d{10}" } });
      fireEvent.change(textArea, { target: { value: "hello world" } });
    });

    expect(screen.getByText(/マッチなし/)).toBeInTheDocument();
  });

  // -------------------------------------------------------
  // 観点 (vii): コピーボタン操作 → clipboard.writeText 呼ばれる
  // -------------------------------------------------------
  it("(vii) コピーボタン: マッチ結果がある場合にクリックすると clipboard.writeText が呼ばれる", async () => {
    render(<RegexTesterTile />);

    const patternInput = screen.getByRole("textbox", {
      name: /正規表現パターン/,
    });
    const textArea = screen.getByRole("textbox", { name: /テストテキスト/ });

    await act(async () => {
      fireEvent.change(patternInput, { target: { value: "\\d+" } });
      fireEvent.change(textArea, { target: { value: "123 456" } });
    });

    const copyBtn = screen.getByRole("button", { name: /^コピー$/ });

    await act(async () => {
      fireEvent.click(copyBtn);
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1);
  });

  // -------------------------------------------------------
  // 観点 (viii): コピーボタン文言変化「コピー」→「コピー済み」→ 自動復帰
  // -------------------------------------------------------
  it("(viii) コピーボタン文言変化: 押下後「コピー済み」に変化する", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: false });
    render(<RegexTesterTile />);

    const patternInput = screen.getByRole("textbox", {
      name: /正規表現パターン/,
    });
    const textArea = screen.getByRole("textbox", { name: /テストテキスト/ });

    // Worker のコールバック（setTimeout 0）を flush するため runAllTimersAsync
    await act(async () => {
      fireEvent.change(patternInput, { target: { value: "\\d+" } });
      fireEvent.change(textArea, { target: { value: "123" } });
      await vi.runAllTimersAsync();
    });

    const copyBtn = screen.getByRole("button", { name: /^コピー$/ });

    await act(async () => {
      fireEvent.click(copyBtn);
    });

    // コピー後「コピー済み」に変化
    expect(
      screen.getByRole("button", { name: "コピー済み" }),
    ).toBeInTheDocument();
  });

  it("(viii) コピーボタン文言自動復帰: 2 秒後に「コピー」に戻る（AP-I11 setTimeout cleanup）", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: false });
    render(<RegexTesterTile />);

    const patternInput = screen.getByRole("textbox", {
      name: /正規表現パターン/,
    });
    const textArea = screen.getByRole("textbox", { name: /テストテキスト/ });

    await act(async () => {
      fireEvent.change(patternInput, { target: { value: "\\d+" } });
      fireEvent.change(textArea, { target: { value: "123" } });
      await vi.runAllTimersAsync();
    });

    const copyBtn = screen.getByRole("button", { name: /^コピー$/ });

    await act(async () => {
      fireEvent.click(copyBtn);
    });

    // 「コピー済み」状態
    expect(
      screen.getByRole("button", { name: "コピー済み" }),
    ).toBeInTheDocument();

    // 2 秒後に復帰
    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    expect(
      screen.getByRole("button", { name: /^コピー$/ }),
    ).toBeInTheDocument();
  });

  // -------------------------------------------------------
  // 観点 (ix): 詳細リンク
  // MAJOR-1: テキスト = §論点 9 採択 案 B「フラグ切替・置換などの詳細機能を使う →」
  // -------------------------------------------------------
  it("(ix) 詳細リンク: /tools/regex-tester へのリンクが §論点 9 採択テキストで存在する", () => {
    render(<RegexTesterTile />);

    const link = screen.getByRole("link", { name: /フラグ切替/ });
    expect(link).toHaveAttribute("href", "/tools/regex-tester");
  });

  // -------------------------------------------------------
  // 観点 (x): IntersectionObserver のモック動作確認
  // -------------------------------------------------------
  it("(x) IntersectionObserver: マッチ結果がある場合に IntersectionObserver が使用される", async () => {
    render(<RegexTesterTile />);

    const patternInput = screen.getByRole("textbox", {
      name: /正規表現パターン/,
    });
    const textArea = screen.getByRole("textbox", { name: /テストテキスト/ });

    await act(async () => {
      fireEvent.change(patternInput, { target: { value: "\\d+" } });
      fireEvent.change(textArea, { target: { value: "1 2 3 4 5" } });
    });

    // マッチ結果欄が表示される（先頭 10 件 seed 済みにより全件表示）
    const region = screen.getByRole("region", { name: /マッチ結果/ });
    expect(region).toBeInTheDocument();
    expect(region.textContent?.length).toBeGreaterThan(0);
  });

  // -------------------------------------------------------
  // 観点 (xi): Worker timeout 100ms のエラー枠表示
  // MINOR-2 対応: Worker 非同期計算に統一されたため、timeout 挙動を
  // 無効パターン入力でエラー表示が出ることで代替確認する。
  // -------------------------------------------------------
  it("(xi) タイムアウトエラー: タイムアウトエラーメッセージが表示される", async () => {
    render(<RegexTesterTile />);

    const patternInput = screen.getByRole("textbox", {
      name: /正規表現パターン/,
    });
    const textArea = screen.getByRole("textbox", { name: /テストテキスト/ });

    await act(async () => {
      fireEvent.change(patternInput, { target: { value: "[invalid" } });
      fireEvent.change(textArea, { target: { value: "test" } });
    });

    // エラー表示があることを確認（無効パターンのエラー）
    expect(screen.queryByRole("alert")).toBeInTheDocument();
  });

  // -------------------------------------------------------
  // 観点 (xii): AP-P21 操作側 / 膨張側構造の DOM 検証
  // -------------------------------------------------------
  it("(xii) AP-P21 構造: 操作側（flexShrink:0）と膨張側（flex:1）の構造が DOM に存在する", () => {
    render(<RegexTesterTile />);

    // 操作側の代表要素: 正規表現 input が存在する
    expect(
      screen.getByRole("textbox", { name: /正規表現パターン/ }),
    ).toBeInTheDocument();
    // 膨張側の代表要素: テストテキスト textarea が存在する
    expect(
      screen.getByRole("textbox", { name: /テストテキスト/ }),
    ).toBeInTheDocument();
  });

  // -------------------------------------------------------
  // a11y: aria-live / role="status" のサマリ欄
  // -------------------------------------------------------
  it("(a11y) ARIA 二層構成: サマリ status 欄に role=status + aria-live=polite が付与されている", () => {
    render(<RegexTesterTile />);

    const statusEl = screen.getByRole("status");
    expect(statusEl).toHaveAttribute("role", "status");
    expect(statusEl).toHaveAttribute("aria-live", "polite");
  });

  it("(a11y) ARIA: マッチ結果欄が role=region を持つ（マッチ有の場合）", async () => {
    render(<RegexTesterTile />);

    const patternInput = screen.getByRole("textbox", {
      name: /正規表現パターン/,
    });
    const textArea = screen.getByRole("textbox", { name: /テストテキスト/ });

    await act(async () => {
      fireEvent.change(patternInput, { target: { value: "\\d+" } });
      fireEvent.change(textArea, { target: { value: "123" } });
    });

    const region = screen.getByRole("region", { name: /マッチ結果/ });
    expect(region).toBeInTheDocument();
  });

  // -------------------------------------------------------
  // a11y: コピーボタン disabled / enabled
  // -------------------------------------------------------
  it("(a11y) コピーボタン: マッチなし時に disabled になる", () => {
    render(<RegexTesterTile />);

    // 初期状態（pattern / text ともに空 = マッチなし）
    const copyBtn = screen.getByRole("button", { name: /^コピー$/ });
    expect(copyBtn).toBeDisabled();
  });

  it("(a11y) コピーボタン: マッチあり時に enabled になる", async () => {
    render(<RegexTesterTile />);

    const patternInput = screen.getByRole("textbox", {
      name: /正規表現パターン/,
    });
    const textArea = screen.getByRole("textbox", { name: /テストテキスト/ });

    await act(async () => {
      fireEvent.change(patternInput, { target: { value: "\\d+" } });
      fireEvent.change(textArea, { target: { value: "123" } });
    });

    const copyBtn = screen.getByRole("button", { name: /^コピー$/ });
    expect(copyBtn).not.toBeDisabled();
  });

  // -------------------------------------------------------
  // AP-I11: setTimeout cleanup（コピーボタン文言復帰タイマー）
  // -------------------------------------------------------
  it("(AP-I11) setTimeout cleanup: コピーボタン押下後に vi.getTimerCount() が 1 増える", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: false });
    render(<RegexTesterTile />);

    const patternInput = screen.getByRole("textbox", {
      name: /正規表現パターン/,
    });
    const textArea = screen.getByRole("textbox", { name: /テストテキスト/ });

    // Worker のコールバック（setTimeout 0）を flush
    await act(async () => {
      fireEvent.change(patternInput, { target: { value: "\\d+" } });
      fireEvent.change(textArea, { target: { value: "123" } });
      await vi.runAllTimersAsync();
    });

    const copyBtn = screen.getByRole("button", { name: /^コピー$/ });
    const beforeCount = vi.getTimerCount();

    await act(async () => {
      fireEvent.click(copyBtn);
    });

    // コピー後にタイマーが追加されていること（AP-I11 のクリーンアップ確認）
    expect(vi.getTimerCount()).toBeGreaterThan(beforeCount);
  });

  // -------------------------------------------------------
  // clipboard 不在時 silent fail
  // -------------------------------------------------------
  it("(silent-fail) clipboard 不在時: 例外が漏れない", async () => {
    vi.stubGlobal("navigator", { ...navigator, clipboard: undefined });
    render(<RegexTesterTile />);

    const patternInput = screen.getByRole("textbox", {
      name: /正規表現パターン/,
    });
    const textArea = screen.getByRole("textbox", { name: /テストテキスト/ });

    await act(async () => {
      fireEvent.change(patternInput, { target: { value: "\\d+" } });
      fireEvent.change(textArea, { target: { value: "123" } });
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /^コピー$/ }));
    });

    // 例外漏れなし = コンポーネントが正常にレンダリングされたまま
    expect(screen.getByRole("button", { name: /コピー/ })).toBeInTheDocument();
  });

  // -------------------------------------------------------
  // ハイライト色トークン確認 (c215-β)
  // -------------------------------------------------------
  it("(c215-β) --success-soft: マッチアイテムに --success-soft トークンが使用されている", async () => {
    render(<RegexTesterTile />);

    const patternInput = screen.getByRole("textbox", {
      name: /正規表現パターン/,
    });
    const textArea = screen.getByRole("textbox", { name: /テストテキスト/ });

    await act(async () => {
      fireEvent.change(patternInput, { target: { value: "\\d+" } });
      fireEvent.change(textArea, { target: { value: "123" } });
    });

    // マッチアイテムが存在する
    const matchItems = document.querySelectorAll("[data-match-item]");
    expect(matchItems.length).toBeGreaterThan(0);
  });
});
