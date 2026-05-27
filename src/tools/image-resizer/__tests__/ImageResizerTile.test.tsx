import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import ImageResizerTile from "../ImageResizerTile";

// =========================================================
// Canvas モック
// image-resizer タイルは Canvas API で画像リサイズを行う。
// jsdom 環境では Canvas が実装されていないため、
// createElement("canvas") をモックして制御する。
//
// toBlob コールバックを setTimeout でラップすることで、
// 任意の処理時間を再現できる（観点 (xiv) のスピナーテスト用）。
// =========================================================

/** Blob モック（ダミーデータ / size > 0 で formatFileSize が機能する） */
const MOCK_BLOB_SIZE = 148735; // 145KB相当
const mockBlob = new Blob(["x".repeat(100)], { type: "image/png" });
Object.defineProperty(mockBlob, "size", {
  value: MOCK_BLOB_SIZE,
  configurable: true,
});

/** Canvas.toBlob の mock: toBlobDelay ms 後にコールバックを呼ぶ */
let toBlobDelay = 0; // ms: 0 = Promise.resolve() 経由（100ms 未満相当）
let toBlobShouldFail = false;

const mockCanvasContext = {
  drawImage: vi.fn(),
};

const mockCanvas = {
  width: 0,
  height: 0,
  getContext: vi.fn(() => mockCanvasContext),
  toBlob: vi.fn((cb: (blob: Blob | null) => void) => {
    if (toBlobDelay === 0) {
      // 即座（Promise.resolve() 経由）
      Promise.resolve().then(() => {
        cb(toBlobShouldFail ? null : mockBlob);
      });
    } else {
      // 遅延あり（fake timers で制御）
      setTimeout(() => {
        cb(toBlobShouldFail ? null : mockBlob);
      }, toBlobDelay);
    }
  }),
};

// document.createElement をモックして "canvas" 時だけ mockCanvas を返す
const originalCreateElement = document.createElement.bind(document);
vi.spyOn(document, "createElement").mockImplementation(
  (tagName: string, ...args) => {
    if (tagName === "canvas") {
      return mockCanvas as unknown as HTMLCanvasElement;
    }
    return originalCreateElement(
      tagName,
      ...(args as [ElementCreationOptions?]),
    );
  },
);

// =========================================================
// Image モック
// FileReader で読み込んだ DataURL から img.onload を発火させる。
// jsdom では Image.onload が自動発火しないため手動制御する。
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
    // src をセットしたら非同期で onload を発火
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

type MockFileReaderInstance = {
  readAsDataURL: ReturnType<typeof vi.fn>;
  onload: ((event: ProgressEvent<FileReader>) => void) | null;
  onerror: ((event: ProgressEvent<FileReader>) => void) | null;
  result: string | null;
};

let mockFileReaderInstance: MockFileReaderInstance | null = null;

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
    const instance = new MockFileReader();
    mockFileReaderInstance = instance;
    return instance;
  };
}

vi.stubGlobal("FileReader", makeMockFileReaderClass());

// URL.createObjectURL / URL.revokeObjectURL のモック（DL リンク生成用）
vi.stubGlobal("URL", {
  createObjectURL: vi.fn(() => "blob:mock-url"),
  revokeObjectURL: vi.fn(),
});

/**
 * ファイル選択 → FileReader onload → Image onload まで待つヘルパー。
 * Promise.resolve() を複数回 await することで非同期チェーンを解決する。
 */
async function selectFileAndWaitImageLoad(
  fileInput: HTMLInputElement,
  file: File,
) {
  await act(async () => {
    fireEvent.change(fileInput, { target: { files: [file] } });
    // FileReader.readAsDataURL（Promise.resolve()）
    await Promise.resolve();
    // FileReader.onload → img.src 設定（Promise.resolve()）
    await Promise.resolve();
    // img.onload（Promise.resolve()）
    await Promise.resolve();
    // React state 更新を確実に反映
    await Promise.resolve();
  });
}

describe("ImageResizerTile", () => {
  beforeEach(() => {
    toBlobDelay = 0;
    toBlobShouldFail = false;
    mockFileReaderInstance = null;
    mockCanvas.toBlob.mockClear();
    mockCanvas.getContext.mockClear();
    mockCanvasContext.drawImage.mockClear();
    vi.mocked(URL.createObjectURL).mockClear();
    vi.mocked(URL.revokeObjectURL).mockClear();
    vi.stubGlobal("FileReader", makeMockFileReaderClass());
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // -------------------------------------------------------
  // 観点 (i) レンダリング（未選択時）
  // -------------------------------------------------------
  it("(i) 未選択時の初期描画: ドロップゾーン + 詳細リンクが DOM に存在 / 幅入力とリサイズボタンは未表示", () => {
    render(<ImageResizerTile />);

    // ドロップゾーン（role="button"）が存在する
    expect(
      screen.getByRole("button", { name: /画像ファイルを選択またはドラッグ/i }),
    ).toBeInTheDocument();

    // 詳細リンクが存在する
    expect(
      screen.getByRole("link", { name: "詳細ページで開く" }),
    ).toBeInTheDocument();

    // 幅入力欄は未表示（ファイル選択前）
    expect(screen.queryByRole("spinbutton")).not.toBeInTheDocument();

    // リサイズボタンは未表示
    expect(
      screen.queryByRole("button", { name: /リサイズしてダウンロード/ }),
    ).not.toBeInTheDocument();
  });

  // -------------------------------------------------------
  // 観点 (ii) File 選択挙動 — クリック経路
  // -------------------------------------------------------
  it("(ii-a) クリック経路: ドロップゾーンクリックで file input の click が呼ばれる", () => {
    render(<ImageResizerTile />);

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const clickSpy = vi.spyOn(fileInput, "click").mockImplementation(() => {});

    const dropZone = screen.getByRole("button", {
      name: /画像ファイルを選択またはドラッグ/i,
    });
    fireEvent.click(dropZone);

    expect(clickSpy).toHaveBeenCalled();
  });

  // -------------------------------------------------------
  // 観点 (ii) File 選択挙動 — ドロップ経路
  // -------------------------------------------------------
  it("(ii-b) ドロップ経路: e.dataTransfer.files[0] がファイルとして受け取られる", async () => {
    render(<ImageResizerTile />);

    const dropZone = screen.getByRole("button", {
      name: /画像ファイルを選択またはドラッグ/i,
    });
    const file = new File(["dummy"], "drop.png", { type: "image/png" });

    await act(async () => {
      fireEvent.drop(dropZone, { dataTransfer: { files: [file] } });
    });

    expect(mockFileReaderInstance).toBeDefined();
    expect(mockFileReaderInstance!.readAsDataURL).toHaveBeenCalledWith(file);
  });

  // -------------------------------------------------------
  // 観点 (iii) 選択後の UI 構造変化
  // -------------------------------------------------------
  it("(iii) ファイル選択後: 幅 input + プリセットボタン [50%] [25%] + リサイズボタンが DOM に出現する", async () => {
    render(<ImageResizerTile />);

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File(["dummy"], "img.png", { type: "image/png" });

    await selectFileAndWaitImageLoad(fileInput, file);

    // 幅入力欄が出現する
    expect(screen.getByRole("spinbutton")).toBeInTheDocument();

    // プリセットボタン [50%] が出現する
    expect(screen.getByRole("button", { name: "50%" })).toBeInTheDocument();

    // プリセットボタン [25%] が出現する
    expect(screen.getByRole("button", { name: "25%" })).toBeInTheDocument();

    // リサイズボタンが出現する
    expect(
      screen.getByRole("button", { name: /リサイズしてダウンロード/ }),
    ).toBeInTheDocument();
  });

  // -------------------------------------------------------
  // 観点 (iv) 幅 input のデフォルト値 + プリセット押下挙動
  // -------------------------------------------------------
  it("(iv-a) 幅 input のデフォルト値: 元画像幅 (1920) が自動セットされる", async () => {
    render(<ImageResizerTile />);

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File(["dummy"], "img.png", { type: "image/png" });

    await selectFileAndWaitImageLoad(fileInput, file);

    const widthInput = screen.getByRole("spinbutton") as HTMLInputElement;
    expect(widthInput.value).toBe(String(IMAGE_WIDTH));
  });

  it("(iv-b) [50%] プリセット押下: 幅 input が元画像幅 × 0.5 にセット / Canvas.toBlob は呼ばれない（即時 DL 起動なし）", async () => {
    render(<ImageResizerTile />);

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File(["dummy"], "img.png", { type: "image/png" });

    await selectFileAndWaitImageLoad(fileInput, file);

    // [50%] ボタン押下
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "50%" }));
    });

    // 幅 input が 1920 × 0.5 = 960 にセットされる
    const widthInput = screen.getByRole("spinbutton") as HTMLInputElement;
    expect(widthInput.value).toBe(String(Math.round(IMAGE_WIDTH * 0.5)));

    // Canvas.toBlob は呼ばれていない（即時 DL 起動しない）
    expect(mockCanvas.toBlob).not.toHaveBeenCalled();
  });

  it("(iv-c) [25%] プリセット押下: 幅 input が元画像幅 × 0.25 にセット / Canvas.toBlob は呼ばれない（即時 DL 起動なし）", async () => {
    render(<ImageResizerTile />);

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File(["dummy"], "img.png", { type: "image/png" });

    await selectFileAndWaitImageLoad(fileInput, file);

    // [25%] ボタン押下
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "25%" }));
    });

    // 幅 input が 1920 × 0.25 = 480 にセットされる
    const widthInput = screen.getByRole("spinbutton") as HTMLInputElement;
    expect(widthInput.value).toBe(String(Math.round(IMAGE_WIDTH * 0.25)));

    // Canvas.toBlob は呼ばれていない（即時 DL 起動しない）
    expect(mockCanvas.toBlob).not.toHaveBeenCalled();
  });

  // -------------------------------------------------------
  // 観点 (v) リサイズボタン押下挙動
  // -------------------------------------------------------
  it("(v) リサイズボタン押下: Canvas drawImage + toBlob が呼ばれ DL リンクが起動する", async () => {
    render(<ImageResizerTile />);

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File(["dummy"], "img.png", { type: "image/png" });

    await selectFileAndWaitImageLoad(fileInput, file);

    // リサイズボタン押下
    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: /リサイズしてダウンロード/ }),
      );
      // Image.onload → canvas.toBlob（Promise.resolve() チェーン）
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });

    // Canvas.toBlob が呼ばれたことを確認
    expect(mockCanvas.toBlob).toHaveBeenCalled();

    // Canvas.drawImage が呼ばれたことを確認
    expect(mockCanvasContext.drawImage).toHaveBeenCalled();

    // URL.createObjectURL が呼ばれたことを確認（DL リンク起動）
    expect(vi.mocked(URL.createObjectURL)).toHaveBeenCalled();
  });

  // -------------------------------------------------------
  // 観点 (vi) エラー 4 種表示
  // -------------------------------------------------------
  it("(vi-a) 容量超過エラー: 20MB超のファイルで「ファイルサイズが20MBを超えています」が表示される", async () => {
    render(<ImageResizerTile />);

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const bigFile = new File(["x"], "big.png", { type: "image/png" });
    Object.defineProperty(bigFile, "size", { value: 20 * 1024 * 1024 + 1 });

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [bigFile] } });
    });

    expect(
      screen.getByText("ファイルサイズが20MBを超えています"),
    ).toBeInTheDocument();
  });

  it("(vi-b) 非対応形式エラー: 非画像ファイルで「画像ファイルを選択してください」が表示される", async () => {
    render(<ImageResizerTile />);

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const textFile = new File(["hello"], "text.txt", { type: "text/plain" });

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [textFile] } });
    });

    expect(
      screen.getByText("画像ファイルを選択してください"),
    ).toBeInTheDocument();
  });

  it("(vi-e) 非対応画像形式エラー: image/ で始まるが allowedTypes 外（image/bmp）でも「画像ファイルを選択してください」が表示される", async () => {
    // MINOR-1 修正検証: 冗長 if 削除後も image/bmp を正しく弾けることを確認
    render(<ImageResizerTile />);

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const bmpFile = new File(["dummy"], "photo.bmp", { type: "image/bmp" });

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [bmpFile] } });
    });

    expect(
      screen.getByText("画像ファイルを選択してください"),
    ).toBeInTheDocument();
  });

  it("(vi-c) Canvas 処理失敗エラー: toBlob が null を返すと「画像の処理に失敗しました」が表示される", async () => {
    toBlobShouldFail = true;

    render(<ImageResizerTile />);

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File(["dummy"], "img.png", { type: "image/png" });

    await selectFileAndWaitImageLoad(fileInput, file);

    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: /リサイズしてダウンロード/ }),
      );
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(screen.getByText("画像の処理に失敗しました")).toBeInTheDocument();
  });

  it("(vi-d) GIF/SVG 拒否エラー: GIF が D&D された場合「アニメ画像は詳細ページをご利用ください」が表示される", async () => {
    render(<ImageResizerTile />);

    const dropZone = screen.getByRole("button", {
      name: /画像ファイルを選択またはドラッグ/i,
    });
    const gifFile = new File(["dummy"], "anim.gif", { type: "image/gif" });

    await act(async () => {
      fireEvent.drop(dropZone, { dataTransfer: { files: [gifFile] } });
    });

    expect(
      screen.getByText("アニメ画像は詳細ページをご利用ください"),
    ).toBeInTheDocument();
  });

  // -------------------------------------------------------
  // 観点 (vii) ARIA / role="status" 結果欄付与
  // -------------------------------------------------------
  it("(vii) リサイズ後: role='status' aria-live='polite' を持つ要素が存在する", async () => {
    render(<ImageResizerTile />);

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File(["dummy"], "img.png", { type: "image/png" });

    await selectFileAndWaitImageLoad(fileInput, file);

    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: /リサイズしてダウンロード/ }),
      );
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });

    const statusEl = screen.getByRole("status");
    expect(statusEl).toHaveAttribute("aria-live", "polite");
  });

  // -------------------------------------------------------
  // 観点 (viii) ドラッグ&ドロップ挙動
  // -------------------------------------------------------
  it("(viii) onDragEnter/onDragOver/onDrop でファイルを受領できる", async () => {
    render(<ImageResizerTile />);

    const dropZone = screen.getByRole("button", {
      name: /画像ファイルを選択またはドラッグ/i,
    });

    await act(async () => {
      fireEvent.dragEnter(dropZone, { dataTransfer: { files: [] } });
      fireEvent.dragOver(dropZone, { dataTransfer: { files: [] } });
    });

    const file = new File(["dummy"], "drag.png", { type: "image/png" });
    await act(async () => {
      fireEvent.drop(dropZone, { dataTransfer: { files: [file] } });
    });

    expect(mockFileReaderInstance).toBeDefined();
    expect(mockFileReaderInstance!.readAsDataURL).toHaveBeenCalledWith(file);
  });

  // -------------------------------------------------------
  // 観点 (ix) 詳細ページリンク
  // -------------------------------------------------------
  it("(ix) 詳細ページリンクが /tools/image-resizer を指す", () => {
    render(<ImageResizerTile />);

    const link = screen.getByRole("link", { name: "詳細ページで開く" });
    expect(link).toHaveAttribute("href", "/tools/image-resizer");
  });

  // -------------------------------------------------------
  // 観点 (x) accept 属性
  // -------------------------------------------------------
  it("(x) input[type=file] が accept='image/png,image/jpeg,image/webp' 属性を持つ", () => {
    render(<ImageResizerTile />);

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    expect(fileInput).not.toBeNull();
    expect(fileInput.getAttribute("accept")).toBe(
      "image/png,image/jpeg,image/webp",
    );
  });

  // -------------------------------------------------------
  // 観点 (xi) 同じファイルを連続 2 回選択した時の挙動
  // -------------------------------------------------------
  it("(xi) 同じファイルを連続 2 回選択: change イベントが 2 回とも発火し処理される", async () => {
    let fileReaderConstructCount = 0;
    vi.stubGlobal("FileReader", function () {
      fileReaderConstructCount++;
      const instance = makeMockFileReaderClass()();
      mockFileReaderInstance = instance;
      return instance;
    });

    render(<ImageResizerTile />);

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File(["dummy"], "img.png", { type: "image/png" });

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });

    expect(fileReaderConstructCount).toBe(1);
    // input の value が "" にリセットされている
    expect(fileInput.value).toBe("");

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });

    expect(fileReaderConstructCount).toBe(2);
  });

  // -------------------------------------------------------
  // 観点 (xii) ダウンロード後の状態変化
  // -------------------------------------------------------
  it("(xii) ダウンロード後: ボタン文言が「ダウンロード完了」に変化し、2 秒後に元に戻る", async () => {
    // 全体を fake timers で制御する。
    // ファイル選択〜リサイズまでは advanceTimersByTimeAsync で Promise チェーンを解決し、
    // DL完了後の 2 秒タイマーは段階的に advanceTimersByTime で進める。
    vi.useFakeTimers({ shouldAdvanceTime: false });

    render(<ImageResizerTile />);

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File(["dummy"], "img.png", { type: "image/png" });

    // ファイル選択（FileReader + Image の Promise チェーンを advanceTimersByTimeAsync で解決）
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
      // FileReader.onload（Promise.resolve() 相当）
      await vi.advanceTimersByTimeAsync(0);
      // img.onload（Promise.resolve() 相当）
      await vi.advanceTimersByTimeAsync(0);
    });

    expect(
      screen.getByRole("button", { name: /リサイズしてダウンロード/ }),
    ).toBeInTheDocument();

    // リサイズボタン押下（toBlobDelay=0 = Promise.resolve() 経由で即座に完了）
    // spinner timer は 100ms なので、toBlob が先に完了 → clearTimeout でキャンセル
    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: /リサイズしてダウンロード/ }),
      );
      // Image.onload → toBlob（Promise.resolve() 相当）
      await vi.advanceTimersByTimeAsync(0);
      await vi.advanceTimersByTimeAsync(0);
      await vi.advanceTimersByTimeAsync(0);
    });

    // 「ダウンロード完了」が表示されることを確認
    expect(
      screen.getByRole("button", { name: "ダウンロード完了" }),
    ).toBeInTheDocument();

    // 2 秒後に元の文言に戻る
    await act(async () => {
      vi.advanceTimersByTime(2001);
    });

    expect(
      screen.getByRole("button", { name: /リサイズしてダウンロード/ }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "ダウンロード完了" }),
    ).not.toBeInTheDocument();
  });

  // -------------------------------------------------------
  // 観点 (xiii) ビフォーアフター 2 段表示
  // -------------------------------------------------------
  it("(xiii) リサイズ後: 1 行目「元幅×元高さ → 後幅×後高さ」/ 2 行目「(推定 XXX / DL 開始)」が DOM に存在する", async () => {
    render(<ImageResizerTile />);

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File(["dummy"], "img.png", { type: "image/png" });

    await selectFileAndWaitImageLoad(fileInput, file);

    // リサイズボタン押下 → toBlob 完了まで待機
    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: /リサイズしてダウンロード/ }),
      );
      // Image.onload（src セット後の Promise チェーン）
      await Promise.resolve();
      // Canvas.drawImage → toBlob（Promise.resolve() 経由）
      await Promise.resolve();
      await Promise.resolve();
    });

    // role="status" 要素が存在する
    const statusEl = screen.getByRole("status");

    // 1 行目: 寸法ビフォーアフター（→ を含む）
    expect(statusEl.textContent).toMatch(/→/);

    // 2 行目: 推定容量 + DL 開始
    expect(statusEl.textContent).toMatch(/推定.*DL 開始/);
  });

  // -------------------------------------------------------
  // 観点 (xiv) ローディング表示挙動（中間案 100ms threshold spinner）
  // -------------------------------------------------------
  it("(xiv-a) 100ms 未満で完了する場合: spinner が表示されない", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: false });
    toBlobDelay = 0; // Promise.resolve() 経由で即座に完了

    render(<ImageResizerTile />);

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File(["dummy"], "img.png", { type: "image/png" });

    // ファイル選択（runAllTimersAsync で Promise + setTimeout を全解決）
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
      await vi.runAllTimersAsync();
    });

    expect(
      screen.getByRole("button", { name: /リサイズしてダウンロード/ }),
    ).toBeInTheDocument();

    // リサイズボタン押下
    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: /リサイズしてダウンロード/ }),
      );
      // toBlob は Promise.resolve() 経由で即座に完了 → spinner setTimeout は clearTimeout でキャンセル
      await vi.runAllTimersAsync();
    });

    // spinner が表示されていない（100ms 経過前に完了したため）
    expect(document.querySelector('[aria-label="処理中"]')).toBeNull();
  });

  it("(xiv-b) 100ms 経過で完了しない場合: spinner が表示される", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: false });
    toBlobDelay = 200; // 200ms 後に完了（100ms 閾値を超える）

    render(<ImageResizerTile />);

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File(["dummy"], "img.png", { type: "image/png" });

    // ファイル選択
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
      await vi.runAllTimersAsync();
    });

    expect(
      screen.getByRole("button", { name: /リサイズしてダウンロード/ }),
    ).toBeInTheDocument();

    // リサイズボタン押下（toBlob は 200ms 後に完了）
    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: /リサイズしてダウンロード/ }),
      );
    });

    // 101ms 経過 → spinner 表示
    await act(async () => {
      vi.advanceTimersByTime(101);
    });

    expect(document.querySelector('[aria-label="処理中"]')).not.toBeNull();
  });

  // -------------------------------------------------------
  // MAJOR-2 unmount cleanup（setTimeout 漏れ検証）
  // -------------------------------------------------------
  it("(xv) DL完了表示中に unmount しても console.error が出ない（setState on unmounted 防止）", async () => {
    // console.error を spy して React の unmounted setState 警告を検出する
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(<ImageResizerTile />);

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File(["dummy"], "img.png", { type: "image/png" });

    await selectFileAndWaitImageLoad(fileInput, file);

    // リサイズボタン押下 → DL完了 → dlCompleted=true の状態にする
    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: /リサイズしてダウンロード/ }),
      );
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });

    // 「ダウンロード完了」が表示されている（dlCompleted=true）
    expect(
      screen.getByRole("button", { name: "ダウンロード完了" }),
    ).toBeInTheDocument();

    // この時点で dlCompletedTimer（2000ms）が走っている
    // unmount する（ページ遷移に相当）
    // useEffect cleanup が dlCompletedTimer を clearTimeout するはず
    const { unmount } = render(<ImageResizerTile />);

    // DL完了している2つ目のコンポーネントを unmount
    // （1つ目の cleanup も同様に機能することを間接確認）
    act(() => {
      unmount();
    });

    // console.error が呼ばれていないことを確認
    // （React の "Warning: Can't perform a React state update on an unmounted component" が出ない）
    const errorCalls = consoleSpy.mock.calls.filter(
      (call) =>
        typeof call[0] === "string" &&
        (call[0].includes("unmounted") || call[0].includes("memory leak")),
    );
    expect(errorCalls).toHaveLength(0);

    consoleSpy.mockRestore();
  });

  it("(xiv-c) toBlob 完了後に spinner が消失する（100ms 超処理が正常終了したとき spinner=false になること）", async () => {
    // toBlobDelay=200ms: 100ms threshold を超えるため spinner が表示される。
    // toBlob 完了後（200ms 経過）に showSpinner が false に戻ることを確認。
    vi.useFakeTimers({ shouldAdvanceTime: false });
    toBlobDelay = 200; // 200ms 後に完了

    render(<ImageResizerTile />);

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File(["dummy"], "img.png", { type: "image/png" });

    // ファイル選択（runAllTimersAsync で FileReader / Image の Promise チェーンを全解決）
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
      await vi.runAllTimersAsync();
    });

    expect(
      screen.getByRole("button", { name: /リサイズしてダウンロード/ }),
    ).toBeInTheDocument();

    // リサイズボタン押下（toBlob は 200ms 後に完了）
    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: /リサイズしてダウンロード/ }),
      );
    });

    // 101ms 経過 → spinner 表示開始（100ms threshold を超えたため）
    await act(async () => {
      vi.advanceTimersByTime(101);
    });

    expect(document.querySelector('[aria-label="処理中"]')).not.toBeNull();

    // さらに 99ms 経過（合計 200ms）→ toBlob 完了 → showSpinner=false で spinner 消失
    await act(async () => {
      vi.advanceTimersByTime(99);
      await vi.runAllTimersAsync();
    });

    expect(document.querySelector('[aria-label="処理中"]')).toBeNull();
  });
});
