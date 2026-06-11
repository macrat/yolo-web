import { readFileSync } from "fs";
import { join } from "path";
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
    return new MockFileReader();
  };
}

vi.stubGlobal("FileReader", makeMockFileReaderClass());

const mockWriteText = vi.fn().mockResolvedValue(undefined);
Object.defineProperty(navigator, "clipboard", {
  value: { writeText: mockWriteText },
  writable: true,
  configurable: true,
});

describe("ImageBase64Tile", () => {
  beforeEach(() => {
    mockWriteText.mockClear();
    vi.stubGlobal("FileReader", makeMockFileReaderClass());
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // -------------------------------------------------------
  // A-1: アーキテクチャ — ルート要素が Panel
  // -------------------------------------------------------
  it("A-1: ルート要素が Panel (section) でレンダリングされる", () => {
    const { container } = render(<ImageBase64Tile />);
    // Panel はデフォルトで section をレンダリングする
    const section = container.querySelector("section");
    expect(section).toBeInTheDocument();
    // ルート要素のタグが section
    expect(container.firstChild?.nodeName).toBe("SECTION");
  });

  it("A-1: as='div' を渡すとルートが div になる", () => {
    const { container } = render(<ImageBase64Tile as="div" />);
    expect(container.firstChild?.nodeName).toBe("DIV");
  });

  // -------------------------------------------------------
  // E-1: 基本レンダリング (variant="full")
  // -------------------------------------------------------
  it("E-1: variant=full — ToolPageLayout なしでコンポーネントが正常に描画される", () => {
    render(<ImageBase64Tile variant="full" />);
    // SegmentedControl（モード切替）が存在する
    expect(screen.getByRole("radiogroup")).toBeInTheDocument();
    // FileDropZone が存在する
    expect(
      screen.getByRole("button", { name: /クリックまたはドラッグ/i }),
    ).toBeInTheDocument();
  });

  // -------------------------------------------------------
  // variant=encode: 固定モードのレンダリング
  // -------------------------------------------------------
  it("variant=encode — SegmentedControl が非表示、FileDropZone が表示される", () => {
    render(<ImageBase64Tile variant="encode" />);
    // SegmentedControl が表示されない
    expect(screen.queryByRole("radiogroup")).not.toBeInTheDocument();
    // FileDropZone が表示される
    expect(
      screen.getByRole("button", { name: /クリックまたはドラッグ/i }),
    ).toBeInTheDocument();
  });

  // -------------------------------------------------------
  // variant=decode: 固定モードのレンダリング
  // -------------------------------------------------------
  it("variant=decode — SegmentedControl が非表示、Base64 入力欄が表示される", () => {
    render(<ImageBase64Tile variant="decode" />);
    // SegmentedControl が表示されない
    expect(screen.queryByRole("radiogroup")).not.toBeInTheDocument();
    // Base64 テキストエリアが表示される
    expect(screen.getByPlaceholderText(/data:image/i)).toBeInTheDocument();
    // プレビューボタンが表示される
    expect(
      screen.getByRole("button", { name: "プレビュー" }),
    ).toBeInTheDocument();
  });

  // -------------------------------------------------------
  // E-2: ファイル選択後の結果表示 (variant=full / encode)
  // -------------------------------------------------------
  it("E-2: ファイル選択後にBase64出力欄とData URI出力欄が表示される", async () => {
    render(<ImageBase64Tile variant="full" />);

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File(["dummy"], "img.png", { type: "image/png" });

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });

    await waitFor(() => {
      expect(screen.getByLabelText("Base64")).toBeInTheDocument();
    });
    expect(screen.getByLabelText("Data URI")).toBeInTheDocument();
  });

  it("variant=encode — ファイル選択後にBase64出力欄が表示される", async () => {
    render(<ImageBase64Tile variant="encode" />);

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File(["dummy"], "img.png", { type: "image/png" });

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });

    await waitFor(() => {
      expect(screen.getByLabelText("Base64")).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------
  // E-3: 空入力
  // -------------------------------------------------------
  it("E-3: 初期状態でエラーは表示されない・出力欄は存在しない", () => {
    render(<ImageBase64Tile />);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Base64")).not.toBeInTheDocument();
  });

  // -------------------------------------------------------
  // E-4: 変換ロジックの正確性
  // -------------------------------------------------------
  it("E-4: エンコード後のBase64値が出力欄に表示される", async () => {
    render(<ImageBase64Tile />);

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File(["dummy"], "img.png", { type: "image/png" });

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });

    await waitFor(() => {
      const base64Textarea = screen.getByLabelText("Base64");
      expect((base64Textarea as HTMLTextAreaElement).value).toBe("abc123");
    });
  });

  it("E-4: デコードモードでBase64文字列から画像プレビューが表示される", async () => {
    render(<ImageBase64Tile variant="full" />);

    // デコードモードに切り替え
    const decodeOption = screen.getByRole("radio", { name: /Base64 → 画像/i });
    fireEvent.click(decodeOption);

    // Base64文字列を入力
    const textarea = screen.getByPlaceholderText(/data:image/i);
    fireEvent.change(textarea, {
      target: { value: "data:image/png;base64,iVBORw0KGgo=" },
    });

    // プレビューボタンをクリック
    const previewButton = screen.getByRole("button", { name: "プレビュー" });
    fireEvent.click(previewButton);

    await waitFor(() => {
      const img = screen.getByAltText("デコード結果プレビュー");
      expect(img).toBeInTheDocument();
    });
  });

  it("variant=decode — Base64文字列から画像プレビューが表示される", async () => {
    render(<ImageBase64Tile variant="decode" />);

    const textarea = screen.getByPlaceholderText(/data:image/i);
    fireEvent.change(textarea, {
      target: { value: "data:image/png;base64,iVBORw0KGgo=" },
    });

    const previewButton = screen.getByRole("button", { name: "プレビュー" });
    fireEvent.click(previewButton);

    await waitFor(() => {
      const img = screen.getByAltText("デコード結果プレビュー");
      expect(img).toBeInTheDocument();
    });
  });

  // -------------------------------------------------------
  // E-5: ARIA
  // -------------------------------------------------------
  it("E-5: SegmentedControlがrole=radiogroupとaria-labelを持つ", () => {
    render(<ImageBase64Tile variant="full" />);
    const radiogroup = screen.getByRole("radiogroup");
    expect(radiogroup).toHaveAttribute("aria-label", "変換モード");
  });

  it("E-5: エンコード結果欄に実テキストを持つ独立した role=status 要素が存在する（C-3 準拠）", async () => {
    render(<ImageBase64Tile variant="full" />);

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File(["dummy"], "img.png", { type: "image/png" });

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });

    await waitFor(() => {
      // C-3: role=status の要素が存在し、aria-live=polite を持つ
      const statusEls = screen.getAllByRole("status");
      expect(statusEls.length).toBeGreaterThanOrEqual(1);
      statusEls.forEach((el) => {
        expect(el).toHaveAttribute("aria-live", "polite");
      });

      // C-3: readOnly textarea 自体に role=status が付与されていない（禁止パターン）
      const textareas = document.querySelectorAll("textarea[role='status']");
      expect(textareas.length).toBe(0);

      // C-3: サマリ用 role=status 要素に実テキストノードがある（Base64に変換しました 等）
      const summaryEl = statusEls.find(
        (el) => el.tagName !== "TEXTAREA" && el.textContent?.trim() !== "",
      );
      expect(summaryEl).toBeDefined();
    });
  });

  // -------------------------------------------------------
  // E-6: コピー文言変化
  // -------------------------------------------------------
  it("E-6: コピーボタン押下後に「コピーしました」に文言が変化する", async () => {
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

    const [firstCopyBtn] = screen.getAllByRole("button", { name: "コピー" });
    await act(async () => {
      fireEvent.click(firstCopyBtn);
    });

    expect(
      screen.getByRole("button", { name: "コピーしました" }),
    ).toBeInTheDocument();
  });

  // -------------------------------------------------------
  // E-7: コピー disabled 状態
  // -------------------------------------------------------
  it("E-7: 結果が空のときコピーボタンが存在しない（disabled ではなく非表示）", () => {
    render(<ImageBase64Tile />);
    // エンコード結果がない状態ではコピーボタンは存在しない
    expect(
      screen.queryByRole("button", { name: "コピー" }),
    ).not.toBeInTheDocument();
  });

  // -------------------------------------------------------
  // E-8: clipboard 不在時の silent fail
  // -------------------------------------------------------
  it("E-8: clipboard 不在時でもクラッシュしない", async () => {
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

    const [firstCopyBtn] = screen.getAllByRole("button", { name: "コピー" });

    await expect(
      act(async () => {
        fireEvent.click(firstCopyBtn);
      }),
    ).resolves.not.toThrow();

    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: mockWriteText },
      writable: true,
      configurable: true,
    });
  });

  // -------------------------------------------------------
  // 複数インスタンス: useId による DOM id 一意性
  // -------------------------------------------------------
  it("複数インスタンス同居時に DOM id が重複しない（useId 一意化）", () => {
    render(
      <div>
        <ImageBase64Tile variant="encode" />
        <ImageBase64Tile variant="decode" />
      </div>,
    );
    // すべての id を収集
    const allIds = Array.from(document.querySelectorAll("[id]")).map(
      (el) => el.id,
    );
    const uniqueIds = new Set(allIds);
    expect(allIds.length).toBe(uniqueIds.size);
  });

  // -------------------------------------------------------
  // エラー表示テスト
  // -------------------------------------------------------
  it("エラー: 10MB超のファイルでエラーが表示される", async () => {
    render(<ImageBase64Tile />);

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const bigFile = new File(["x"], "big.png", { type: "image/png" });
    Object.defineProperty(bigFile, "size", { value: 10 * 1024 * 1024 + 1 });

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [bigFile] } });
    });

    expect(
      screen.getByText("ファイルサイズが10MBを超えています"),
    ).toBeInTheDocument();
  });

  it("エラー: 非画像ファイルでエラーが表示される", async () => {
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

  it("エラー: FileReader onerror 発火でエラーが表示される", async () => {
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
  // デコードモード テスト
  // -------------------------------------------------------
  it("デコード: 空入力でプレビューボタン押下時にエラーが表示される", () => {
    render(<ImageBase64Tile variant="full" />);

    const decodeOption = screen.getByRole("radio", { name: /Base64 → 画像/i });
    fireEvent.click(decodeOption);

    const previewButton = screen.getByRole("button", { name: "プレビュー" });
    fireEvent.click(previewButton);

    expect(
      screen.getByText("Base64文字列を入力してください"),
    ).toBeInTheDocument();
  });

  it("デコード(variant=decode): 空入力でプレビューボタン押下時にエラーが表示される", () => {
    render(<ImageBase64Tile variant="decode" />);

    const previewButton = screen.getByRole("button", { name: "プレビュー" });
    fireEvent.click(previewButton);

    expect(
      screen.getByText("Base64文字列を入力してください"),
    ).toBeInTheDocument();
  });

  it("デコード: 無効なBase64入力でエラーが表示される", () => {
    render(<ImageBase64Tile variant="full" />);

    const decodeOption = screen.getByRole("radio", { name: /Base64 → 画像/i });
    fireEvent.click(decodeOption);

    const textarea = screen.getByPlaceholderText(/data:image/i);
    fireEvent.change(textarea, { target: { value: "invalid string!" } });

    const previewButton = screen.getByRole("button", { name: "プレビュー" });
    fireEvent.click(previewButton);

    expect(
      screen.getByText("有効なBase64画像データではありません"),
    ).toBeInTheDocument();
  });

  it("デコード: SVGデータURIを拒否してエラーが表示される", () => {
    render(<ImageBase64Tile variant="full" />);

    const decodeOption = screen.getByRole("radio", { name: /Base64 → 画像/i });
    fireEvent.click(decodeOption);

    const textarea = screen.getByPlaceholderText(/data:image/i);
    fireEvent.change(textarea, {
      target: { value: "data:image/svg+xml;base64,PHN2Zz4=" },
    });

    const previewButton = screen.getByRole("button", { name: "プレビュー" });
    fireEvent.click(previewButton);

    expect(
      screen.getByText("有効なBase64画像データではありません"),
    ).toBeInTheDocument();
  });

  it("デコード: プレビュー後に共通Buttonのダウンロードボタンが表示される", async () => {
    render(<ImageBase64Tile variant="full" />);

    const decodeOption = screen.getByRole("radio", { name: /Base64 → 画像/i });
    fireEvent.click(decodeOption);

    const textarea = screen.getByPlaceholderText(/data:image/i);
    fireEvent.change(textarea, {
      target: { value: "data:image/png;base64,iVBORw0KGgo=" },
    });

    const previewButton = screen.getByRole("button", { name: "プレビュー" });
    fireEvent.click(previewButton);

    await waitFor(() => {
      const downloadButton = screen.getByRole("button", {
        name: "ダウンロード",
      });
      expect(downloadButton).toBeInTheDocument();
      expect(downloadButton.tagName).toBe("BUTTON");
    });
  });

  it("デコード: ダウンロードボタン押下時に <a> 動的生成でダウンロードが実行される", async () => {
    const originalCreateElement = document.createElement.bind(document);
    const clickSpy = vi.fn();
    const mockAnchor = {
      href: "",
      download: "",
      click: clickSpy,
    };
    const createElementSpy = vi
      .spyOn(document, "createElement")
      .mockImplementation((tagName: string) => {
        if (tagName === "a") return mockAnchor as unknown as HTMLAnchorElement;
        return originalCreateElement(tagName);
      });

    render(<ImageBase64Tile variant="full" />);

    const decodeOption = screen.getByRole("radio", { name: /Base64 → 画像/i });
    fireEvent.click(decodeOption);

    const textarea = screen.getByPlaceholderText(/data:image/i);
    fireEvent.change(textarea, {
      target: { value: "data:image/png;base64,iVBORw0KGgo=" },
    });

    const previewButton = screen.getByRole("button", { name: "プレビュー" });
    fireEvent.click(previewButton);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "ダウンロード" }),
      ).toBeInTheDocument();
    });

    const downloadButton = screen.getByRole("button", {
      name: "ダウンロード",
    });
    fireEvent.click(downloadButton);

    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(mockAnchor.href).toBe("data:image/png;base64,iVBORw0KGgo=");
    expect(mockAnchor.download).toBe("image.png");

    createElementSpy.mockRestore();
  });

  // -------------------------------------------------------
  // モード切り替えテスト
  // -------------------------------------------------------
  it("モード切替: デコードモードに切り替えるとBase64入力テキストエリアが表示される", () => {
    render(<ImageBase64Tile variant="full" />);

    const decodeOption = screen.getByRole("radio", { name: /Base64 → 画像/i });
    fireEvent.click(decodeOption);

    expect(screen.getByPlaceholderText(/data:image/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "プレビュー" }),
    ).toBeInTheDocument();
  });

  it("モード切替: エンコードモードに戻るとFileDropZoneが表示される", () => {
    render(<ImageBase64Tile variant="full" />);

    // デコードに切り替え
    const decodeOption = screen.getByRole("radio", { name: /Base64 → 画像/i });
    fireEvent.click(decodeOption);

    // エンコードに戻す
    const encodeOption = screen.getByRole("radio", { name: /画像 → Base64/i });
    fireEvent.click(encodeOption);

    expect(
      screen.getByRole("button", { name: /クリックまたはドラッグ/i }),
    ).toBeInTheDocument();
  });

  it("モード切替: モード切替後に古い結果が残らない (G-1 準拠)", async () => {
    render(<ImageBase64Tile variant="full" />);

    // ファイルを選択してエンコード結果を表示
    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File(["dummy"], "img.png", { type: "image/png" });

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });

    await waitFor(() => {
      expect(screen.getByLabelText("Base64")).toBeInTheDocument();
    });

    // デコードモードに切り替え
    const decodeOption = screen.getByRole("radio", { name: /Base64 → 画像/i });
    fireEvent.click(decodeOption);

    // エンコード結果が消えている
    expect(screen.queryByLabelText("Base64")).not.toBeInTheDocument();
  });

  // -------------------------------------------------------
  // サイズ情報テスト
  // -------------------------------------------------------
  it("サイズ情報: ファイル選択後にMIMEタイプ・元サイズ・Base64サイズが表示される", async () => {
    render(<ImageBase64Tile />);

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File(["dummy"], "img.png", { type: "image/png" });

    await act(async () => {
      fireEvent.change(fileInput, { target: { files: [file] } });
    });

    await waitFor(() => {
      expect(screen.getAllByText(/MIMEタイプ/).length).toBeGreaterThanOrEqual(
        1,
      );
      expect(screen.getAllByText(/元サイズ/).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/Base64サイズ/).length).toBeGreaterThanOrEqual(
        1,
      );
    });
  });

  // -------------------------------------------------------
  // D-4: アンマウント後 setState 防止（世代ガード）
  // -------------------------------------------------------
  it("D-4: アンマウント後に setState が呼ばれてもクラッシュしない", async () => {
    // FileReader の onload を遅延させてアンマウント後に発火させる
    let resolveLoad: (() => void) | null = null;
    class DelayedFileReader {
      onload: ((event: ProgressEvent<FileReader>) => void) | null = null;
      onerror: ((event: ProgressEvent<FileReader>) => void) | null = null;
      result: string | null = null;

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      readAsDataURL = vi.fn((_file: File) => {
        new Promise<void>((resolve) => {
          resolveLoad = resolve;
        }).then(() => {
          this.result = "data:image/png;base64,abc123";
          if (this.onload) {
            this.onload({} as ProgressEvent<FileReader>);
          }
        });
      });
    }
    vi.stubGlobal("FileReader", () => new DelayedFileReader());

    const { unmount } = render(<ImageBase64Tile variant="encode" />);

    const fileInput = document.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File(["dummy"], "img.png", { type: "image/png" });

    // ファイルを選択（FileReader が起動するが onload はまだ呼ばれない）
    fireEvent.change(fileInput, { target: { files: [file] } });

    // アンマウント
    unmount();

    // アンマウント後に onload を発火（世代ガードが機能していればクラッシュしない）
    await expect(
      act(async () => {
        resolveLoad?.();
        await Promise.resolve();
      }),
    ).resolves.not.toThrow();
  });

  // -------------------------------------------------------
  // CSS トークン検証 (readFileSync パターン)
  // -------------------------------------------------------
  it("CSS: 旧トークン --color-* が存在しない (B-1)", () => {
    const css = readFileSync(
      join(process.cwd(), "src/tools/image-base64/ImageBase64Tile.module.css"),
      "utf-8",
    );
    expect(css).not.toMatch(/var\(--color-/);
  });

  it("CSS: --accent 直塗りが存在しない (B-3)", () => {
    const css = readFileSync(
      join(process.cwd(), "src/tools/image-base64/ImageBase64Tile.module.css"),
      "utf-8",
    );
    const lines = css.split("\n");
    const violations = lines.filter((line) => {
      const trimmed = line.trim();
      return /^(background|background-color|color)\s*:.*var\(--accent\)/.test(
        trimmed,
      );
    });
    expect(violations).toHaveLength(0);
  });

  it("CSS: font-weight: 700 が存在しない (B-4)", () => {
    const css = readFileSync(
      join(process.cwd(), "src/tools/image-base64/ImageBase64Tile.module.css"),
      "utf-8",
    );
    expect(css).not.toMatch(/font-weight\s*:\s*700/);
  });
});
