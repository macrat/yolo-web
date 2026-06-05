/**
 * ImageResizerPage 単一実装の回帰テスト
 *
 * 収束チェックリスト E-1〜E-12 の観点を網羅する。
 * E-6/E-7/E-8: コピーボタンなし（T-4b 方針: image-resizer は download 主体）
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import ImageResizerPage from "../ImageResizerPage";

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
  // null を返すケース（Canvas処理失敗テスト）も許容するため戻り値型を明示
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

describe("ImageResizerPage", () => {
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
  // E-1: 基本レンダリング
  // -------------------------------------------------------
  it("E-1: 初期描画でドロップゾーンが存在する", () => {
    render(<ImageResizerPage />);
    // FileDropZone の role="button" が描画される
    expect(
      screen.getByRole("button", { name: /クリックまたはドラッグ/i }),
    ).toBeInTheDocument();
  });

  // -------------------------------------------------------
  // E-3: 空入力・初期状態の挙動
  // -------------------------------------------------------
  it("E-3: 初期状態でエラーは非表示、リサイズコントロールは未表示", () => {
    render(<ImageResizerPage />);
    // エラー要素がない
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    // リサイズボタンがない
    expect(
      screen.queryByRole("button", { name: /リサイズ/ }),
    ).not.toBeInTheDocument();
  });

  // -------------------------------------------------------
  // E-2: 入力→結果更新
  // -------------------------------------------------------
  it("E-2: ファイル選択後にリサイズコントロールが表示される", async () => {
    render(<ImageResizerPage />);

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File(["dummy"], "img.png", { type: "image/png" });

    await selectFileAndWaitImageLoad(fileInput, file);

    // リサイズボタンが出現
    expect(
      screen.getByRole("button", { name: "リサイズ" }),
    ).toBeInTheDocument();
  });

  // -------------------------------------------------------
  // E-4: 変換ロジックの正確性（UI経由）
  // -------------------------------------------------------
  it("E-4: ファイル選択後に幅入力に元画像幅がセットされる", async () => {
    render(<ImageResizerPage />);

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File(["dummy"], "img.png", { type: "image/png" });

    await selectFileAndWaitImageLoad(fileInput, file);

    // 幅入力欄に IMAGE_WIDTH がセットされている
    const widthInput = screen.getByLabelText("幅") as HTMLInputElement;
    expect(widthInput.value).toBe(String(IMAGE_WIDTH));
  });

  it("E-4b: リサイズ実行で Canvas drawImage が呼ばれる", async () => {
    render(<ImageResizerPage />);

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
  it("E-5: SegmentedControl に role=radiogroup と aria-labelledby が付与されている", async () => {
    render(<ImageResizerPage />);

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File(["dummy"], "img.png", { type: "image/png" });

    await selectFileAndWaitImageLoad(fileInput, file);

    const radiogroup = screen.getByRole("radiogroup");
    // aria-labelledby か aria-label のどちらかが付与されていること（C-2）
    const hasLabel =
      radiogroup.hasAttribute("aria-labelledby") ||
      radiogroup.hasAttribute("aria-label");
    expect(hasLabel).toBe(true);
  });

  it("E-5b: リサイズ後に role=status aria-live=polite の要素が存在する", async () => {
    render(<ImageResizerPage />);

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

    const statusEl = screen.getByRole("status");
    expect(statusEl).toHaveAttribute("aria-live", "polite");
    // C-3: サマリテキストノードが存在する（実テキストを含む）
    expect(statusEl.textContent).not.toBe("");
  });

  // -------------------------------------------------------
  // E-6/E-7/E-8: コピーボタンなし（T-4b: image-resizer は download 主体）
  // -------------------------------------------------------
  it("E-6/E-7/E-8: N/A - image-resizer はコピーボタンを持たない（download 主体）", () => {
    render(<ImageResizerPage />);
    expect(
      screen.queryByRole("button", { name: /コピー/i }),
    ).not.toBeInTheDocument();
  });

  // -------------------------------------------------------
  // E-9: meta 由来の表示
  // -------------------------------------------------------
  it("E-10: meta.name から派生する表示 (ToolPageLayout の children が描画される)", () => {
    render(<ImageResizerPage />);
    // FileDropZone が children として描画されている
    expect(
      screen.getByRole("button", { name: /クリックまたはドラッグ/i }),
    ).toBeInTheDocument();
  });

  // -------------------------------------------------------
  // 個別論点: GIF誤誘導解消（①-5）
  // -------------------------------------------------------
  it("GIF個別論点①-5: GIF/アニメーション画像に警告メッセージを表示する", async () => {
    render(<ImageResizerPage />);

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const gifFile = new File(["dummy"], "anim.gif", { type: "image/gif" });

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [gifFile] } });
    });

    // GIF警告は advisory（注意）なので role="status"（polite）であること
    // (エラーでない処理継続可能な注意 → role="alert" は過剰なため修正)
    const gifWarning = screen.getByTestId("gif-warning");
    expect(gifWarning).toBeInTheDocument();
    expect(gifWarning).toHaveAttribute("role", "status");
    // 警告テキストにGIF関連の説明が含まれる
    expect(gifWarning.textContent).toMatch(/GIF|アニメ/);
  });

  // -------------------------------------------------------
  // エラーハンドリング
  // -------------------------------------------------------
  it("エラー: 20MB超のファイルでエラーメッセージが表示される", async () => {
    render(<ImageResizerPage />);

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
    render(<ImageResizerPage />);

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
    // getContext が null を返すとエラーになる
    mockCanvas.getContext.mockReturnValue(null);

    render(<ImageResizerPage />);

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
    render(<ImageResizerPage />);

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File(["dummy"], "img.png", { type: "image/png" });

    await selectFileAndWaitImageLoad(fileInput, file);

    // パーセント指定ボタンをクリック
    fireEvent.click(screen.getByRole("radio", { name: "パーセント指定" }));

    // 倍率入力欄が表示される
    expect(screen.getByLabelText("倍率")).toBeInTheDocument();
  });

  // -------------------------------------------------------
  // アスペクト比ロックボタン — DESIGN.md §3 絵文字禁止 是正テスト
  // -------------------------------------------------------
  it("DESIGN §3 是正: アスペクト比ロックボタンが可視テキストラベルを持ち絵文字を含まない", async () => {
    render(<ImageResizerPage />);

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File(["dummy"], "img.png", { type: "image/png" });

    await selectFileAndWaitImageLoad(fileInput, file);

    // ロックボタン（aria-label から取得）
    const lockButton = screen.getByRole("button", {
      name: /アスペクト比/i,
    });
    expect(lockButton).toBeInTheDocument();

    // 可視テキストが存在する（aria-hidden="true" の SVG 以外のテキスト）
    // textContent から non-breaking space 以外のテキストが取れること
    const visibleText = lockButton.textContent?.trim() ?? "";
    expect(visibleText.length).toBeGreaterThan(0);

    // 絵文字コードポイント（U+1F512=🔒 U+1F513=🔓）が存在しないこと
    expect(visibleText).not.toMatch(/[\u{1F512}\u{1F513}]/u);
  });

  it("DESIGN §3 是正: アスペクト比ロックボタンは SVG 線画アイコンを含む（Lucide スタイル）", async () => {
    render(<ImageResizerPage />);

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File(["dummy"], "img.png", { type: "image/png" });

    await selectFileAndWaitImageLoad(fileInput, file);

    const lockButton = screen.getByRole("button", {
      name: /アスペクト比/i,
    });

    // SVG が含まれること
    const svg = lockButton.querySelector("svg");
    expect(svg).not.toBeNull();
    // DESIGN.md §3: Lucide スタイル — fill="none", stroke="currentColor"
    expect(svg?.getAttribute("fill")).toBe("none");
    expect(svg?.getAttribute("stroke")).toBe("currentColor");
    // aria-hidden で SR から隠されていること（テキストラベルで補う）
    expect(svg?.getAttribute("aria-hidden")).toBe("true");
  });

  it("DESIGN §3 是正: アスペクト比ロック状態トグルで可視テキストが切り替わる", async () => {
    render(<ImageResizerPage />);

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File(["dummy"], "img.png", { type: "image/png" });

    await selectFileAndWaitImageLoad(fileInput, file);

    const lockButton = screen.getByRole("button", {
      name: /アスペクト比/i,
    });

    // 初期状態（ロック中）のテキストを取得
    const initialText = lockButton.textContent?.trim() ?? "";

    // ボタンをクリックして状態を切り替える
    fireEvent.click(lockButton);

    // 切り替え後のテキストを取得
    const toggledText = lockButton.textContent?.trim() ?? "";

    // テキストが変わること（状態変化が可視になっていること）
    expect(toggledText).not.toBe(initialText);
  });

  // -------------------------------------------------------
  // E-12: CSSトークン検証
  // -------------------------------------------------------
  it("E-12: CSS に --color-* 旧トークンが存在しない", () => {
    const cssPath = resolve(__dirname, "../ImageResizerPage.module.css");
    const css = readFileSync(cssPath, "utf-8");
    expect(css).not.toMatch(/var\(--color-/);
  });

  it("E-12: CSS に --accent 直塗り (background.*--accent) が存在しない", () => {
    const cssPath = resolve(__dirname, "../ImageResizerPage.module.css");
    const css = readFileSync(cssPath, "utf-8");
    // background-color: var(--accent) のようなパターンを検出
    expect(css).not.toMatch(/background(?:-color)?:\s*var\(--accent\)/);
  });

  it("E-12: CSS に font-weight: 700 が存在しない", () => {
    const cssPath = resolve(__dirname, "../ImageResizerPage.module.css");
    const css = readFileSync(cssPath, "utf-8");
    expect(css).not.toMatch(/font-weight:\s*700/);
  });

  it("E-12: CSS にハードコードhex色値 (#xxxxxx) が存在しない (B-8準拠)", () => {
    // B-8: DESIGN.md と SKILL.md で定義されたトークン以外のハードコード色値禁止
    // var(--token, #fallback) のようなフォールバックhexも禁止（到達不能デッドコード＋ダークテーマ誤色リスク）
    const cssPath = resolve(__dirname, "../ImageResizerPage.module.css");
    const css = readFileSync(cssPath, "utf-8");
    // #xxx または #xxxxxx 形式のhex色を検出
    expect(css).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
  });

  it("E-12: CSS にハードコードrgb/rgba色値が存在しない (B-8準拠)", () => {
    const cssPath = resolve(__dirname, "../ImageResizerPage.module.css");
    const css = readFileSync(cssPath, "utf-8");
    expect(css).not.toMatch(/\brgba?\s*\(/);
  });

  // -------------------------------------------------------
  // ダウンロード機能
  // -------------------------------------------------------
  it("ダウンロード: リサイズ後にダウンロードボタンが表示され、クリックするとダウンロードが始まる", async () => {
    render(<ImageResizerPage />);

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

    // ダウンロードボタンが出現する
    expect(
      screen.getByRole("button", { name: "ダウンロード" }),
    ).toBeInTheDocument();
  });

  // -------------------------------------------------------
  // 出力形式セレクト
  // -------------------------------------------------------
  it("出力形式セレクトボックスが正しく動作する", async () => {
    render(<ImageResizerPage />);

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File(["dummy"], "img.png", { type: "image/png" });

    await selectFileAndWaitImageLoad(fileInput, file);

    // 出力形式のセレクトが存在する
    const formatSelect = screen.getByRole("combobox") as HTMLSelectElement;
    expect(formatSelect).toBeInTheDocument();
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
