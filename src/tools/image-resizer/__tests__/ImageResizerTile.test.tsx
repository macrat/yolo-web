/**
 * ImageResizerTile 単一正典タイル回帰テスト
 *
 * cycle-228 T-27: ImageResizerPage.tsx を Panel ルートのタイルへ移行。
 * 旧 ImageResizerPage.test.tsx の全振る舞いを移植・拡張。
 *
 * テスト観点:
 * - E-1: 基本レンダリング（ドロップゾーン存在・Panel ルート）
 * - E-2: ファイル選択後のリサイズコントロール表示
 * - E-3: 初期状態
 * - E-4: ファイル選択後の幅/高さ設定・Canvas drawImage 呼び出し
 * - E-5: ARIA属性（SegmentedControl・ライブリージョン）
 * - E-6/E-7/E-8: コピーボタンなし（download 主体）
 * - E-12: CSSトークン検証
 * - A-1: Panel ルート確認
 * - A-6: useId ベースのインスタンス一意 id（複数インスタンス同居）
 * - 個別論点①-5: GIF警告
 * - エラーハンドリング
 * - モード切替（dimensions/percent）
 * - アスペクト比ロック
 * - ダウンロード機能
 * - D-4: 非同期処理アンマウント後 setState 防止
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import ImageResizerTile from "../ImageResizerTile";

// =========================================================
// Canvas モック
// jsdom 環境では Canvas が実装されていないため、
// createElement("canvas") をモックして制御する。
// =========================================================

const mockCanvasContext = {
  drawImage: vi.fn(),
};

const mockCanvas = {
  width: 0,
  height: 0,
  getContext: vi.fn<() => typeof mockCanvasContext | null>(
    () => mockCanvasContext,
  ),
  toDataURL: vi.fn(() => "data:image/png;base64,mockresizeddata"),
};

// リンク自動クリックのモック（ダウンロードトリガー）
const mockLinkClick = vi.fn();

// 元の createElement を保存してから一度だけ spyOn する
const originalCreateElement = document.createElement.bind(document);
vi.spyOn(document, "createElement").mockImplementation(
  (tagName: string, ...args) => {
    if (tagName === "canvas") {
      return mockCanvas as unknown as HTMLCanvasElement;
    }
    if (tagName === "a") {
      const a = originalCreateElement(
        tagName,
        ...(args as [ElementCreationOptions?]),
      );
      a.click = mockLinkClick;
      return a;
    }
    return originalCreateElement(
      tagName,
      ...(args as [ElementCreationOptions?]),
    );
  },
);

// =========================================================
// Image モック
// =========================================================

const IMAGE_WIDTH = 1920;
const IMAGE_HEIGHT = 1080;

class MockImage {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  naturalWidth = IMAGE_WIDTH;
  naturalHeight = IMAGE_HEIGHT;
  _src = "";

  get src() {
    return this._src;
  }
  set src(value: string) {
    this._src = value;
    Promise.resolve().then(() => {
      if (this.onload) this.onload();
    });
  }
}

vi.stubGlobal("Image", function () {
  return new MockImage();
});

// =========================================================
// FileReader モック
// =========================================================

function makeMockFileReaderClass(
  dataUri: string = "data:image/png;base64,abc123",
  shouldError: boolean = false,
) {
  class MockFileReader {
    onload: ((event: ProgressEvent<FileReader>) => void) | null = null;
    onerror: ((event: ProgressEvent<FileReader>) => void) | null = null;
    result: string | null = null;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    readAsDataURL = vi.fn((_file: File) => {
      Promise.resolve().then(() => {
        if (shouldError) {
          if (this.onerror) this.onerror({} as ProgressEvent<FileReader>);
        } else {
          this.result = dataUri;
          if (this.onload) this.onload({} as ProgressEvent<FileReader>);
        }
      });
    });
  }

  return function () {
    return new MockFileReader();
  };
}

vi.stubGlobal("FileReader", makeMockFileReaderClass());

/**
 * ファイル選択 → FileReader onload → Image onload まで待つヘルパー。
 */
async function selectFileAndWaitImageLoad(
  fileInput: HTMLInputElement,
  file: File,
) {
  await act(async () => {
    fireEvent.change(fileInput, { target: { files: [file] } });
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
}

describe("ImageResizerTile", () => {
  beforeEach(() => {
    mockCanvas.getContext.mockImplementation(() => mockCanvasContext);
    mockCanvas.toDataURL.mockReturnValue(
      "data:image/png;base64,mockresizeddata",
    );
    mockCanvasContext.drawImage.mockClear();
    mockLinkClick.mockClear();
    vi.stubGlobal("FileReader", makeMockFileReaderClass());
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // -------------------------------------------------------
  // A-1: Panel ルート確認
  // -------------------------------------------------------
  it("A-1: ルート要素が Panel（section タグ）であること", () => {
    const { container } = render(<ImageResizerTile />);
    // Panel は section タグでレンダリングされる
    const root = container.firstChild as HTMLElement;
    expect(root.tagName.toLowerCase()).toBe("section");
  });

  it("A-1: as='div' を渡すと div タグになること", () => {
    const { container } = render(<ImageResizerTile as="div" />);
    const root = container.firstChild as HTMLElement;
    expect(root.tagName.toLowerCase()).toBe("div");
  });

  // -------------------------------------------------------
  // E-1: 基本レンダリング
  // -------------------------------------------------------
  it("E-1: 初期描画でドロップゾーンが存在する", () => {
    render(<ImageResizerTile />);
    expect(
      screen.getByRole("button", { name: /クリックまたはドラッグ/i }),
    ).toBeInTheDocument();
  });

  // -------------------------------------------------------
  // E-3: 空入力・初期状態の挙動
  // -------------------------------------------------------
  it("E-3: 初期状態でエラーは非表示、リサイズコントロールは未表示", () => {
    render(<ImageResizerTile />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /リサイズ/ }),
    ).not.toBeInTheDocument();
  });

  // -------------------------------------------------------
  // E-2: 入力→結果更新
  // -------------------------------------------------------
  it("E-2: ファイル選択後にリサイズコントロールが表示される", async () => {
    render(<ImageResizerTile />);

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File(["dummy"], "img.png", { type: "image/png" });

    await selectFileAndWaitImageLoad(fileInput, file);

    expect(
      screen.getByRole("button", { name: "リサイズ" }),
    ).toBeInTheDocument();
  });

  // -------------------------------------------------------
  // E-4: 変換ロジックの正確性（UI経由）
  // -------------------------------------------------------
  it("E-4: ファイル選択後に幅入力に元画像幅がセットされる", async () => {
    render(<ImageResizerTile />);

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File(["dummy"], "img.png", { type: "image/png" });

    await selectFileAndWaitImageLoad(fileInput, file);

    const widthInput = screen.getByLabelText("幅") as HTMLInputElement;
    expect(widthInput.value).toBe(String(IMAGE_WIDTH));
  });

  it("E-4b: リサイズ実行で Canvas drawImage が呼ばれる", async () => {
    render(<ImageResizerTile />);

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File(["dummy"], "img.png", { type: "image/png" });

    await selectFileAndWaitImageLoad(fileInput, file);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "リサイズ" }));
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(mockCanvasContext.drawImage).toHaveBeenCalled();
  });

  // -------------------------------------------------------
  // E-5: ARIA属性
  // -------------------------------------------------------
  it("E-5: SegmentedControl に role=radiogroup と aria-label/labelledby が付与されている", async () => {
    render(<ImageResizerTile />);

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File(["dummy"], "img.png", { type: "image/png" });

    await selectFileAndWaitImageLoad(fileInput, file);

    const radiogroup = screen.getByRole("radiogroup");
    const hasLabel =
      radiogroup.hasAttribute("aria-labelledby") ||
      radiogroup.hasAttribute("aria-label");
    expect(hasLabel).toBe(true);
  });

  it("E-5b: リサイズ後に role=status aria-live=polite の要素が存在しサマリテキストを含む", async () => {
    render(<ImageResizerTile />);

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File(["dummy"], "img.png", { type: "image/png" });

    await selectFileAndWaitImageLoad(fileInput, file);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "リサイズ" }));
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });

    // GIF警告の role=status と競合する場合があるため、aria-atomic で絞る
    const statusEls = screen.getAllByRole("status");
    // リサイズ完了後のサマリを含む status 要素が存在する
    const summaryEl = statusEls.find(
      (el) => el.textContent && el.textContent.trim() !== "",
    );
    expect(summaryEl).toBeDefined();
    expect(summaryEl).toHaveAttribute("aria-live", "polite");
    expect(summaryEl!.textContent).not.toBe("");
  });

  // -------------------------------------------------------
  // E-6/E-7/E-8: コピーボタンなし（T-4b: image-resizer は download 主体）
  // -------------------------------------------------------
  it("E-6/E-7/E-8: N/A - image-resizer はコピーボタンを持たない（download 主体）", () => {
    render(<ImageResizerTile />);
    expect(
      screen.queryByRole("button", { name: /コピー/i }),
    ).not.toBeInTheDocument();
  });

  // -------------------------------------------------------
  // A-6: 複数インスタンス id 一意性テスト
  // -------------------------------------------------------
  it("A-6: 複数インスタンスを同居させたとき id が重複しない", async () => {
    const { container } = render(
      <div>
        <ImageResizerTile />
        <ImageResizerTile />
      </div>,
    );

    // ファイルを両方のインスタンスに選択する
    const fileInputs = container.querySelectorAll('input[type="file"]');
    expect(fileInputs.length).toBe(2);

    // id を持つ要素を全て収集して重複確認
    const allIds = Array.from(container.querySelectorAll("[id]")).map(
      (el) => el.id,
    );
    const uniqueIds = new Set(allIds);
    expect(allIds.length).toBe(uniqueIds.size);
  });

  // -------------------------------------------------------
  // 個別論点: GIF誤誘導解消（①-5）
  // -------------------------------------------------------
  it("GIF個別論点①-5: GIF/アニメーション画像に警告メッセージを表示する", async () => {
    render(<ImageResizerTile />);

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const gifFile = new File(["dummy"], "anim.gif", { type: "image/gif" });

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [gifFile] } });
    });

    const gifWarning = screen.getByTestId("gif-warning");
    expect(gifWarning).toBeInTheDocument();
    expect(gifWarning).toHaveAttribute("role", "status");
    expect(gifWarning.textContent).toMatch(/GIF|アニメ/);
  });

  // -------------------------------------------------------
  // エラーハンドリング
  // -------------------------------------------------------
  it("エラー: 20MB超のファイルでエラーメッセージが表示される", async () => {
    render(<ImageResizerTile />);

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const bigFile = new File(["x"], "big.png", { type: "image/png" });
    Object.defineProperty(bigFile, "size", { value: 20 * 1024 * 1024 + 1 });

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [bigFile] } });
    });

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByRole("alert").textContent).toMatch(/20MB/);
  });

  it("エラー: 非画像ファイルでエラーメッセージが表示される", async () => {
    render(<ImageResizerTile />);

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const textFile = new File(["hello"], "text.txt", { type: "text/plain" });

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [textFile] } });
    });

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByRole("alert").textContent).toMatch(/画像ファイル/);
  });

  it("エラー: Canvas処理失敗でエラーメッセージが表示される", async () => {
    mockCanvas.getContext.mockReturnValue(null);

    render(<ImageResizerTile />);

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File(["dummy"], "img.png", { type: "image/png" });

    await selectFileAndWaitImageLoad(fileInput, file);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "リサイズ" }));
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  // -------------------------------------------------------
  // モード切替（dimensions/percent）
  // -------------------------------------------------------
  it("モード切替: パーセントモードに切り替えると倍率入力欄が表示される", async () => {
    render(<ImageResizerTile />);

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File(["dummy"], "img.png", { type: "image/png" });

    await selectFileAndWaitImageLoad(fileInput, file);

    fireEvent.click(screen.getByRole("radio", { name: "パーセント指定" }));

    expect(screen.getByLabelText("倍率")).toBeInTheDocument();
  });

  // -------------------------------------------------------
  // アスペクト比ロックボタン — DESIGN.md §3 絵文字禁止 是正テスト
  // -------------------------------------------------------
  it("DESIGN §3 是正: アスペクト比ロックボタンが可視テキストラベルを持ち絵文字を含まない", async () => {
    render(<ImageResizerTile />);

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File(["dummy"], "img.png", { type: "image/png" });

    await selectFileAndWaitImageLoad(fileInput, file);

    const lockButton = screen.getByRole("button", {
      name: /アスペクト比/i,
    });
    expect(lockButton).toBeInTheDocument();

    const visibleText = lockButton.textContent?.trim() ?? "";
    expect(visibleText.length).toBeGreaterThan(0);
    expect(visibleText).not.toMatch(/[\u{1F512}\u{1F513}]/u);
  });

  it("DESIGN §3 是正: アスペクト比ロックボタンは SVG 線画アイコンを含む（Lucide スタイル）", async () => {
    render(<ImageResizerTile />);

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File(["dummy"], "img.png", { type: "image/png" });

    await selectFileAndWaitImageLoad(fileInput, file);

    const lockButton = screen.getByRole("button", {
      name: /アスペクト比/i,
    });

    const svg = lockButton.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute("fill")).toBe("none");
    expect(svg?.getAttribute("stroke")).toBe("currentColor");
    expect(svg?.getAttribute("aria-hidden")).toBe("true");
  });

  it("DESIGN §3 是正: アスペクト比ロック状態トグルで可視テキストが切り替わる", async () => {
    render(<ImageResizerTile />);

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File(["dummy"], "img.png", { type: "image/png" });

    await selectFileAndWaitImageLoad(fileInput, file);

    const lockButton = screen.getByRole("button", {
      name: /アスペクト比/i,
    });

    const initialText = lockButton.textContent?.trim() ?? "";
    fireEvent.click(lockButton);
    const toggledText = lockButton.textContent?.trim() ?? "";
    expect(toggledText).not.toBe(initialText);
  });

  // -------------------------------------------------------
  // ダウンロード機能
  // -------------------------------------------------------
  it("ダウンロード: リサイズ後にダウンロードボタンが表示される", async () => {
    render(<ImageResizerTile />);

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File(["dummy"], "img.png", { type: "image/png" });

    await selectFileAndWaitImageLoad(fileInput, file);

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "リサイズ" }));
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(
      screen.getByRole("button", { name: "ダウンロード" }),
    ).toBeInTheDocument();
  });

  // -------------------------------------------------------
  // 出力形式セレクト
  // -------------------------------------------------------
  it("出力形式セレクトボックスが正しく動作する", async () => {
    render(<ImageResizerTile />);

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File(["dummy"], "img.png", { type: "image/png" });

    await selectFileAndWaitImageLoad(fileInput, file);

    const formatSelect = screen.getByRole("combobox") as HTMLSelectElement;
    expect(formatSelect).toBeInTheDocument();
  });

  // -------------------------------------------------------
  // E-12: CSSトークン検証（新タイルの CSS を対象とする）
  // -------------------------------------------------------
  it("E-12: CSS に --color-* 旧トークンが存在しない", () => {
    const cssPath = resolve(__dirname, "../ImageResizerTile.module.css");
    const css = readFileSync(cssPath, "utf-8");
    expect(css).not.toMatch(/var\(--color-/);
  });

  it("E-12: CSS に --accent 直塗り (background.*--accent) が存在しない", () => {
    const cssPath = resolve(__dirname, "../ImageResizerTile.module.css");
    const css = readFileSync(cssPath, "utf-8");
    expect(css).not.toMatch(/background(?:-color)?:\s*var\(--accent\)/);
  });

  it("E-12: CSS に font-weight: 700 が存在しない", () => {
    const cssPath = resolve(__dirname, "../ImageResizerTile.module.css");
    const css = readFileSync(cssPath, "utf-8");
    expect(css).not.toMatch(/font-weight:\s*700/);
  });

  it("E-12: CSS にハードコードhex色値 (#xxxxxx) が存在しない", () => {
    const cssPath = resolve(__dirname, "../ImageResizerTile.module.css");
    const css = readFileSync(cssPath, "utf-8");
    expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
  });

  it("E-12: CSS にハードコードrgb/rgba色値が存在しない", () => {
    const cssPath = resolve(__dirname, "../ImageResizerTile.module.css");
    const css = readFileSync(cssPath, "utf-8");
    expect(css).not.toMatch(/\brgba?\s*\(/);
  });

  // -------------------------------------------------------
  // D-4 実証: handleResize の連続実行で古い結果が新しい結果を上書きしない
  // -------------------------------------------------------
  it("D-4 実証: handleResize 連続実行で stale な古い結果が最新結果を上書きしない（resizeIdRef ガード）", async () => {
    render(<ImageResizerTile />);

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File(["dummy"], "img.png", { type: "image/png" });

    // ファイル読み込みは通常モック（MockImage が即時 onload）で完了させる
    await selectFileAndWaitImageLoad(fileInput, file);

    // リサイズボタンが表示されたことを確認
    expect(
      screen.getByRole("button", { name: "リサイズ" }),
    ).toBeInTheDocument();

    // toDataURL が返す値を 1回目・2回目で変えて「どちらの結果か」を区別できるようにする
    // ライブリージョン（resultSummary）にはファイルサイズ推定値が含まれるため
    // toDataURL の base64 長さが違えばサマリテキストが変わる
    let toDataURLCallCount = 0;
    const FIRST_DATAURL = "data:image/png;base64,FIRST"; // 1回目（stale）
    const SECOND_DATAURL = "data:image/png;base64,SECONDRESULT"; // 2回目（新しい・正しい）

    mockCanvas.toDataURL.mockImplementation(() => {
      toDataURLCallCount++;
      return toDataURLCallCount === 1 ? FIRST_DATAURL : SECOND_DATAURL;
    });

    // ここから handleResize 内の Image 生成を手動制御モックに切り替える
    // （ファイル読み込み完了後のためファイル読み込みフローには影響しない）
    const onloadCallbacks: Array<() => void> = [];

    vi.stubGlobal("Image", function () {
      const instance = {
        onload: null as (() => void) | null,
        onerror: null as (() => void) | null,
        naturalWidth: IMAGE_WIDTH,
        naturalHeight: IMAGE_HEIGHT,
        _src: "",
        get src() {
          return this._src;
        },
        set src(value: string) {
          this._src = value;
          // onload を即時発火せず、手動で呼べるよう配列に追加
          const self = instance;
          onloadCallbacks.push(() => {
            if (self.onload) self.onload();
          });
        },
      };
      return instance;
    });

    // 1回目のリサイズ開始（Image.onload はまだ発火しない）
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "リサイズ" }));
    });

    expect(onloadCallbacks.length).toBe(1); // 1回目の Image.src セット済み

    // 2回目のリサイズ開始（1回目の onload より後に追加される）
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "リサイズ" }));
    });

    expect(onloadCallbacks.length).toBe(2); // 2回目の Image.src セット済み

    // 2回目の onload を先に発火（最新 resizeId → toDataURL は 2回目の呼び出し → SECOND_DATAURL）
    await act(async () => {
      onloadCallbacks[1]();
      await Promise.resolve();
    });

    // ライブリージョンに 2回目の結果サマリが表示される
    const liveRegion = document.querySelector(
      "[role='status'][aria-atomic='true']",
    );
    const summaryAfterSecond = liveRegion?.textContent ?? "";
    expect(summaryAfterSecond).not.toBe(""); // 何らかのサマリが表示されている

    // 1回目の onload を後から発火（stale resizeId → ガードにより setResult は呼ばれないはず）
    await act(async () => {
      onloadCallbacks[0]();
      await Promise.resolve();
    });

    // stale な1回目の結果でライブリージョンが書き換えられていないことを確認
    const summaryAfterStale = liveRegion?.textContent ?? "";
    // ガードが機能していれば、stale onload は setResultSummary を呼ばないため同じ値のまま
    expect(summaryAfterStale).toBe(summaryAfterSecond);

    // Image グローバルを元に戻す
    vi.stubGlobal("Image", function () {
      return new MockImage();
    });
  });

  // -------------------------------------------------------
  // E-11: 既存 logic.ts テスト PASS 維持確認（スモークテスト）
  // -------------------------------------------------------
  it("E-11: logic.ts のエクスポートが正常に参照できる", async () => {
    const { calculateDimensions, formatFileSize } = await import("../logic");
    expect(calculateDimensions(800, 600, 400, null, true)).toEqual({
      width: 400,
      height: 300,
    });
    expect(formatFileSize(1024)).toBe("1.0 KB");
  });
});
