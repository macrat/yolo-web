import {
  render,
  screen,
  fireEvent,
  act,
  waitFor,
} from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import ImageBase64Tile from "../ImageBase64Tile";

// =========================================================
// FileReader モック
// fileToBase64() は FileReader.readAsDataURL() を使う。
// jsdom 環境では FileReader が DataURL を実際に読み込まないため、
// onload イベントを手動発火して成功・失敗シナリオを制御する。
// vi.stubGlobal で FileReader をクラスとして差し替える。
// =========================================================

type MockFileReaderInstance = {
  readAsDataURL: ReturnType<typeof vi.fn>;
  onload: ((event: ProgressEvent<FileReader>) => void) | null;
  onerror: ((event: ProgressEvent<FileReader>) => void) | null;
  result: string | null;
};

let mockFileReaderInstance: MockFileReaderInstance;

// FileReader モッククラスファクトリ
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
      // 非同期でイベント発火
      Promise.resolve().then(() => {
        if (shouldError) {
          if (this.onerror) {
            this.onerror({} as ProgressEvent<FileReader>);
          }
        } else {
          this.result = dataUri;
          if (this.onload) {
            this.onload({} as ProgressEvent<FileReader>);
          }
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

// デフォルトは成功モード
vi.stubGlobal("FileReader", makeMockFileReaderClass());

// navigator.clipboard のモック
const mockWriteText = vi.fn().mockResolvedValue(undefined);
Object.defineProperty(navigator, "clipboard", {
  value: { writeText: mockWriteText },
  writable: true,
  configurable: true,
});

describe("ImageBase64Tile", () => {
  beforeEach(() => {
    mockWriteText.mockClear();
    // 各テスト前にデフォルト成功モードにリセット
    vi.stubGlobal("FileReader", makeMockFileReaderClass());
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // -------------------------------------------------------
  // 観点 (i) レンダリング
  // -------------------------------------------------------
  it("(i) 未選択時の初期描画: ファイル選択 UI + 詳細リンクが DOM に存在 / 出力欄は未表示", () => {
    render(<ImageBase64Tile />);

    // ファイル選択 UI が存在する（role="button" のドロップゾーン）
    expect(
      screen.getByRole("button", { name: /画像ファイルを選択またはドラッグ/i }),
    ).toBeInTheDocument();

    // 詳細リンクが存在する
    expect(
      screen.getByRole("link", { name: "詳細ページで開く" }),
    ).toBeInTheDocument();

    // 出力欄は未表示（ファイル選択前なので textarea が存在しない）
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  // -------------------------------------------------------
  // 観点 (ii) File 選択挙動 — クリック経路
  // -------------------------------------------------------
  it("(ii-a) クリック経路: ドロップゾーンクリックで file input の click が呼ばれる", () => {
    render(<ImageBase64Tile />);

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
  // 観点 (ii) File 選択挙動 — ファイル選択後の非同期処理
  // -------------------------------------------------------
  it("(ii-b) ファイル選択後: fileToBase64 が呼ばれ base64 結果が状態に反映される", async () => {
    render(<ImageBase64Tile />);

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File(["dummy content"], "test.png", {
      type: "image/png",
    });

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });

    // fileToBase64 が呼ばれ FileReader.readAsDataURL が実行されていること
    expect(mockFileReaderInstance).toBeDefined();
    expect(mockFileReaderInstance.readAsDataURL).toHaveBeenCalledWith(file);
  });

  // -------------------------------------------------------
  // 観点 (ii) File 選択挙動 — dataTransfer（ドロップ）経路
  // -------------------------------------------------------
  it("(ii-c) ドロップ経路: e.dataTransfer.files[0] がファイルとして受け取られる", async () => {
    render(<ImageBase64Tile />);

    const dropZone = screen.getByRole("button", {
      name: /画像ファイルを選択またはドラッグ/i,
    });
    const file = new File(["dummy content"], "drop.png", { type: "image/png" });

    await act(async () => {
      fireEvent.drop(dropZone, {
        dataTransfer: { files: [file] },
      });
    });

    expect(mockFileReaderInstance).toBeDefined();
    expect(mockFileReaderInstance.readAsDataURL).toHaveBeenCalledWith(file);
  });

  // -------------------------------------------------------
  // 観点 (iii) 選択後の UI 構造変化
  // -------------------------------------------------------
  it("(iii) ファイル選択後: base64 出力欄 + Data URI 出力欄 + コピーボタン 2 個が DOM に出現する", async () => {
    render(<ImageBase64Tile />);

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File(["dummy"], "img.png", { type: "image/png" });

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });

    // base64 出力欄 が存在する（label で識別）
    await waitFor(() => {
      expect(screen.getByLabelText("Base64")).toBeInTheDocument();
    });

    // Data URI 出力欄 が存在する
    expect(screen.getByLabelText("Data URI")).toBeInTheDocument();

    // コピーボタンが 2 個以上存在する
    const copyButtons = screen.getAllByRole("button", { name: /コピー/ });
    expect(copyButtons.length).toBeGreaterThanOrEqual(2);
  });

  // -------------------------------------------------------
  // 観点 (iv) コピーボタン押下挙動
  // -------------------------------------------------------
  it("(iv-a) base64 コピーボタン: clipboard.writeText が呼ばれ「コピー済み」UI が表示される", async () => {
    render(<ImageBase64Tile />);

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File(["dummy"], "img.png", { type: "image/png" });

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });

    // base64 コピーボタンが現れるまで待機
    await waitFor(() => {
      expect(
        screen.getAllByRole("button", { name: "コピー" }).length,
      ).toBeGreaterThanOrEqual(1);
    });

    // base64 コピーボタンをクリック（最初の1つ）
    const copyButtons = screen.getAllByRole("button", { name: "コピー" });
    await act(async () => {
      fireEvent.click(copyButtons[0]);
    });

    expect(mockWriteText).toHaveBeenCalledTimes(1);
    // コピー済み UI が表示される
    expect(
      screen.getByRole("button", { name: "コピー済み" }),
    ).toBeInTheDocument();
  });

  it("(iv-b) Data URI コピーボタン: clipboard.writeText が呼ばれる", async () => {
    render(<ImageBase64Tile />);

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File(["dummy"], "img.png", { type: "image/png" });

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });

    await waitFor(() => {
      expect(
        screen.getAllByRole("button", { name: "コピー" }).length,
      ).toBeGreaterThanOrEqual(2);
    });

    const copyButtons = screen.getAllByRole("button", { name: "コピー" });
    // 2 番目のボタン（Data URI コピー）
    await act(async () => {
      fireEvent.click(copyButtons[1]);
    });

    expect(mockWriteText).toHaveBeenCalledTimes(1);
    // Data URI の値（data:image/png;base64,abc123）が渡されているはず
    expect(mockWriteText).toHaveBeenCalledWith("data:image/png;base64,abc123");
  });

  // -------------------------------------------------------
  // 観点 (v) エラー 3 種表示
  // -------------------------------------------------------
  it("(v-a) 容量超過エラー: 10MB超のファイルで「ファイルサイズが10MBを超えています」が表示される", async () => {
    render(<ImageBase64Tile />);

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    // 10MB + 1byte のファイルを模擬
    const bigFile = new File(["x"], "big.png", { type: "image/png" });
    Object.defineProperty(bigFile, "size", {
      value: 10 * 1024 * 1024 + 1,
    });

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [bigFile] } });
    });

    expect(
      screen.getByText("ファイルサイズが10MBを超えています"),
    ).toBeInTheDocument();
  });

  it("(v-b) 非対応形式エラー: 非画像ファイルで「画像ファイルを選択してください」が表示される", async () => {
    render(<ImageBase64Tile />);

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

  it("(v-c) 読込失敗エラー: FileReader onerror 発火で「ファイルの読み込みに失敗しました」が表示される", async () => {
    // FileReader をエラーモードに差し替え
    vi.stubGlobal(
      "FileReader",
      makeMockFileReaderClass("data:image/png;base64,abc", true),
    );

    render(<ImageBase64Tile />);

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File(["dummy"], "img.png", { type: "image/png" });

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });

    await waitFor(() => {
      expect(
        screen.getByText("ファイルの読み込みに失敗しました"),
      ).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------
  // 観点 (vi) ARIA / role="status" + aria-live="polite"
  // -------------------------------------------------------
  it("(vi) 結果欄が role=status + aria-live=polite を持つ", async () => {
    render(<ImageBase64Tile />);

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File(["dummy"], "img.png", { type: "image/png" });

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });

    await waitFor(() => {
      const statusEls = screen.getAllByRole("status");
      expect(statusEls.length).toBeGreaterThanOrEqual(1);
      statusEls.forEach((el) => {
        expect(el).toHaveAttribute("aria-live", "polite");
      });
    });
  });

  // -------------------------------------------------------
  // 観点 (vii) ドラッグ&ドロップ挙動
  // -------------------------------------------------------
  it("(vii) onDragEnter/onDragOver/onDrop でファイルを受領できる", async () => {
    render(<ImageBase64Tile />);

    const dropZone = screen.getByRole("button", {
      name: /画像ファイルを選択またはドラッグ/i,
    });

    // DragEnter/DragOver でエラーが発生しないことを確認
    await act(async () => {
      fireEvent.dragEnter(dropZone, { dataTransfer: { files: [] } });
      fireEvent.dragOver(dropZone, { dataTransfer: { files: [] } });
    });

    // ドロップ後にファイルが処理される
    const file = new File(["dummy"], "drag.png", { type: "image/png" });
    await act(async () => {
      fireEvent.drop(dropZone, {
        dataTransfer: { files: [file] },
      });
    });

    expect(mockFileReaderInstance).toBeDefined();
    expect(mockFileReaderInstance.readAsDataURL).toHaveBeenCalledWith(file);
  });

  // -------------------------------------------------------
  // 観点 (viii) 詳細ページリンク
  // -------------------------------------------------------
  it("(viii) 詳細ページリンクが /tools/image-base64 を指す", () => {
    render(<ImageBase64Tile />);

    const link = screen.getByRole("link", { name: "詳細ページで開く" });
    expect(link).toHaveAttribute("href", "/tools/image-base64");
  });

  // -------------------------------------------------------
  // 観点 (ix) navigator.clipboard 不在時のフォールバック（silent fail）
  // -------------------------------------------------------
  it("(ix) clipboard 不在時: エラーが throw されずタイルがクラッシュしない", async () => {
    const rejectClipboard = vi
      .fn()
      .mockRejectedValue(new Error("Clipboard unavailable"));
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: rejectClipboard },
      writable: true,
      configurable: true,
    });

    render(<ImageBase64Tile />);

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File(["dummy"], "img.png", { type: "image/png" });

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });

    await waitFor(() => {
      const copyButtons = screen.getAllByRole("button", { name: "コピー" });
      expect(copyButtons.length).toBeGreaterThanOrEqual(1);
    });

    const copyButtons = screen.getAllByRole("button", { name: "コピー" });

    // クリップボード失敗でもクラッシュしない（silent fail）
    await expect(
      act(async () => {
        fireEvent.click(copyButtons[0]);
      }),
    ).resolves.not.toThrow();

    // クリップボードを元に戻す
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: mockWriteText },
      writable: true,
      configurable: true,
    });
  });

  // -------------------------------------------------------
  // 観点 (x) accept="image/*" 属性の付与
  // -------------------------------------------------------
  it("(x) input[type=file] が accept='image/*' 属性を持つ", () => {
    render(<ImageBase64Tile />);

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    expect(fileInput).not.toBeNull();
    expect(fileInput.getAttribute("accept")).toBe("image/*");
  });

  // -------------------------------------------------------
  // 観点 (xi) accept="image/*" + ファイル種別 reject 時のエラー表示
  // -------------------------------------------------------
  it("(xi) 非画像ファイル選択時: エラー文言「画像ファイルを選択してください」が表示される", async () => {
    render(<ImageBase64Tile />);

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    // PDF ファイル（非画像）
    const pdfFile = new File(["pdf content"], "doc.pdf", {
      type: "application/pdf",
    });

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [pdfFile] } });
    });

    expect(
      screen.getByText("画像ファイルを選択してください"),
    ).toBeInTheDocument();

    // 出力欄は存在しない
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  // -------------------------------------------------------
  // 観点 (xii) 同じファイルを連続 2 回選択した時の挙動
  // -------------------------------------------------------
  it("(xii) 同じファイルを連続 2 回選択: change イベントが 2 回とも発火し処理される", async () => {
    // FileReader の生成回数を追跡するためカウンターを設定
    let fileReaderConstructCount = 0;
    vi.stubGlobal("FileReader", function () {
      fileReaderConstructCount++;
      const instance = makeMockFileReaderClass()();
      mockFileReaderInstance = instance;
      return instance;
    });

    render(<ImageBase64Tile />);

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File(["dummy"], "img.png", { type: "image/png" });

    // 1 回目の選択
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });

    expect(fileReaderConstructCount).toBe(1);

    // input の value が "" にリセットされている（e.target.value = "" パターン確認）
    // これにより同じファイルを再選択した際も change イベントが発火する
    expect(fileInput.value).toBe("");

    // 2 回目の選択（同じファイル）
    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });

    // 2 回目も FileReader が新たにインスタンス化され処理されたことを確認
    expect(fileReaderConstructCount).toBe(2);
  });
});
