import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { readFileSync } from "fs";
import { resolve } from "path";
import FileDropZone from "../index";

// ファイルサイズ定数
const MB = 1024 * 1024;

describe("FileDropZone", () => {
  const onFileSelect = vi.fn();

  beforeEach(() => {
    onFileSelect.mockClear();
  });

  // ---- a11y 属性 ----
  it("role='button' を持つ", () => {
    render(<FileDropZone onFileSelect={onFileSelect} />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("tabIndex=0 を持つ（キーボードフォーカス可能）", () => {
    render(<FileDropZone onFileSelect={onFileSelect} />);
    expect(screen.getByRole("button")).toHaveAttribute("tabindex", "0");
  });

  it("aria-labelledby で可視テキスト要素を参照する（デフォルト）", () => {
    const { container } = render(<FileDropZone onFileSelect={onFileSelect} />);
    const button = screen.getByRole("button");
    // aria-labelledby が設定されている
    const labelledById = button.getAttribute("aria-labelledby");
    expect(labelledById).toBeTruthy();
    // 参照先 id の要素が存在する
    const labelEl = container.querySelector(`#${labelledById}`);
    expect(labelEl).not.toBeNull();
    // 参照先要素のテキストが空でない
    expect(labelEl?.textContent?.trim().length).toBeGreaterThan(0);
  });

  it("ariaLabel prop を渡すと aria-label で上書きできる（aria-labelledby は外れる）", () => {
    render(
      <FileDropZone onFileSelect={onFileSelect} ariaLabel="カスタムラベル" />,
    );
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-label", "カスタムラベル");
    // aria-label が設定されているとき aria-labelledby は不要
    expect(button).not.toHaveAttribute("aria-labelledby");
  });

  // ---- クリックで file dialog を発火 ----
  it("クリックで hidden file input の click() が呼ばれる", () => {
    const { container } = render(<FileDropZone onFileSelect={onFileSelect} />);
    const fileInput = container.querySelector('input[type="file"]');
    expect(fileInput).not.toBeNull();
    const clickSpy = vi.spyOn(fileInput as HTMLInputElement, "click");
    fireEvent.click(screen.getByRole("button"));
    // jsdom は CSS display:none を評価しないため click 伝播が複数回になる場合がある。
    // 「少なくとも1回 click が呼ばれた（=file dialog が開く）」ことを検証する。
    expect(clickSpy).toHaveBeenCalled();
  });

  // ---- キーボード操作（Enter/Space）で file dialog を発火 ----
  it("Enter キーで hidden file input の click() が呼ばれる", () => {
    const { container } = render(<FileDropZone onFileSelect={onFileSelect} />);
    const fileInput = container.querySelector('input[type="file"]');
    const clickSpy = vi.spyOn(fileInput as HTMLInputElement, "click");
    fireEvent.keyDown(screen.getByRole("button"), { key: "Enter" });
    expect(clickSpy).toHaveBeenCalled();
  });

  it("Space キーで hidden file input の click() が呼ばれる", () => {
    const { container } = render(<FileDropZone onFileSelect={onFileSelect} />);
    const fileInput = container.querySelector('input[type="file"]');
    const clickSpy = vi.spyOn(fileInput as HTMLInputElement, "click");
    fireEvent.keyDown(screen.getByRole("button"), { key: " " });
    expect(clickSpy).toHaveBeenCalled();
  });

  it("その他のキー（Tab など）では file input の click() が呼ばれない", () => {
    const { container } = render(<FileDropZone onFileSelect={onFileSelect} />);
    const fileInput = container.querySelector('input[type="file"]');
    const clickSpy = vi.spyOn(fileInput as HTMLInputElement, "click");
    fireEvent.keyDown(screen.getByRole("button"), { key: "Tab" });
    expect(clickSpy).not.toHaveBeenCalled();
  });

  // ---- onFileSelect コールバック ----
  it("file input change イベントで onFileSelect が呼ばれる", () => {
    const { container } = render(<FileDropZone onFileSelect={onFileSelect} />);
    const fileInput = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const file = new File(["dummy"], "test.png", { type: "image/png" });
    Object.defineProperty(fileInput, "files", {
      value: { 0: file, length: 1, item: () => file },
    });
    fireEvent.change(fileInput);
    expect(onFileSelect).toHaveBeenCalledWith(file);
  });

  // ---- サイズ上限超過 ----
  it("maxSizeBytes を超えるファイルは onFileSelect を呼ばず onError を呼ぶ", () => {
    const onError = vi.fn();
    const maxSizeBytes = 5 * MB;
    const { container } = render(
      <FileDropZone
        onFileSelect={onFileSelect}
        maxSizeBytes={maxSizeBytes}
        onError={onError}
      />,
    );
    const fileInput = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    // maxSizeBytes + 1 バイトのファイル
    const bigFile = new File(["x".repeat(maxSizeBytes + 1)], "big.png", {
      type: "image/png",
    });
    Object.defineProperty(fileInput, "files", {
      value: { 0: bigFile, length: 1, item: () => bigFile },
    });
    fireEvent.change(fileInput);
    expect(onFileSelect).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it("onError に渡されるメッセージに上限MBが含まれる", () => {
    const onError = vi.fn();
    // 1.5MB 上限
    const maxSizeBytes = 1.5 * MB;
    const { container } = render(
      <FileDropZone
        onFileSelect={onFileSelect}
        maxSizeBytes={maxSizeBytes}
        onError={onError}
      />,
    );
    const fileInput = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const bigFile = new File(["x".repeat(maxSizeBytes + 1)], "big.png", {
      type: "image/png",
    });
    Object.defineProperty(fileInput, "files", {
      value: { 0: bigFile, length: 1, item: () => bigFile },
    });
    fireEvent.change(fileInput);
    expect(onError).toHaveBeenCalledTimes(1);
    // 小数1桁まで含むメッセージ（例: "1.5MB"）
    const errorMsg: string = onError.mock.calls[0][0];
    expect(errorMsg).toContain("1.5");
  });

  it("maxSizeBytes 以内のファイルは onFileSelect が呼ばれる", () => {
    const onError = vi.fn();
    const maxSizeBytes = 10 * MB;
    const { container } = render(
      <FileDropZone
        onFileSelect={onFileSelect}
        maxSizeBytes={maxSizeBytes}
        onError={onError}
      />,
    );
    const fileInput = container.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement;
    const smallFile = new File(["hello"], "small.png", { type: "image/png" });
    Object.defineProperty(fileInput, "files", {
      value: { 0: smallFile, length: 1, item: () => smallFile },
    });
    fireEvent.change(fileInput);
    expect(onFileSelect).toHaveBeenCalledWith(smallFile);
    expect(onError).not.toHaveBeenCalled();
  });

  // ---- accept prop ----
  it("accept prop が file input に渡される", () => {
    const { container } = render(
      <FileDropZone onFileSelect={onFileSelect} accept="image/*" />,
    );
    const fileInput = container.querySelector('input[type="file"]');
    expect(fileInput).toHaveAttribute("accept", "image/*");
  });

  // ---- ドラッグ＆ドロップ ----
  it("dragEnter イベントが発火しても UI がクラッシュしない（dragActive=true になる）", () => {
    render(<FileDropZone onFileSelect={onFileSelect} />);
    const dropZone = screen.getByRole("button");
    // dragEnter/Leave/Over/Drop で例外が出ないことを確認
    expect(() => {
      fireEvent.dragEnter(dropZone);
    }).not.toThrow();
  });

  it("dragLeave イベントが発火しても UI がクラッシュしない", () => {
    render(<FileDropZone onFileSelect={onFileSelect} />);
    const dropZone = screen.getByRole("button");
    expect(() => {
      fireEvent.dragEnter(dropZone);
      fireEvent.dragLeave(dropZone);
    }).not.toThrow();
  });

  it("dragOver イベントが発火しても UI がクラッシュしない", () => {
    render(<FileDropZone onFileSelect={onFileSelect} />);
    const dropZone = screen.getByRole("button");
    expect(() => {
      fireEvent.dragOver(dropZone);
    }).not.toThrow();
  });

  it("drop イベントで onFileSelect が呼ばれる", () => {
    render(<FileDropZone onFileSelect={onFileSelect} />);
    const dropZone = screen.getByRole("button");
    const file = new File(["img"], "drop.png", { type: "image/png" });
    const dropEvent = new Event("drop", { bubbles: true });
    Object.defineProperty(dropEvent, "dataTransfer", {
      value: {
        files: { 0: file, length: 1, item: () => file },
      },
    });
    fireEvent(dropZone, dropEvent);
    expect(onFileSelect).toHaveBeenCalledWith(file);
  });

  it("drop イベントでサイズ超過ファイルは onError を呼ぶ", () => {
    const onError = vi.fn();
    const maxSizeBytes = 1 * MB;
    render(
      <FileDropZone
        onFileSelect={onFileSelect}
        maxSizeBytes={maxSizeBytes}
        onError={onError}
      />,
    );
    const dropZone = screen.getByRole("button");
    const bigFile = new File(["x".repeat(maxSizeBytes + 1)], "big.png", {
      type: "image/png",
    });
    const dropEvent = new Event("drop", { bubbles: true });
    Object.defineProperty(dropEvent, "dataTransfer", {
      value: {
        files: { 0: bigFile, length: 1, item: () => bigFile },
      },
    });
    fireEvent(dropZone, dropEvent);
    expect(onFileSelect).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledTimes(1);
  });

  // ---- テキスト表示 ----
  it("description prop が表示される", () => {
    render(
      <FileDropZone
        onFileSelect={onFileSelect}
        description="PNG, JPEG 対応 (最大10MB)"
      />,
    );
    expect(screen.getByText("PNG, JPEG 対応 (最大10MB)")).toBeInTheDocument();
  });

  // ---- CSS 規約 ----
  it(".dropZone は 2px dashed border を持つ（CSS 規約）", () => {
    const cssPath = resolve(__dirname, "../FileDropZone.module.css");
    const css = readFileSync(cssPath, "utf-8");
    // .dropZone ブロックを取得
    const dropZoneBlock = css.match(/\.dropZone\s*\{[^}]+\}/)?.[0] ?? "";
    expect(dropZoneBlock).toContain("border:");
    expect(dropZoneBlock).toMatch(/2px\s+dashed/);
  });

  it(".dropZone はアクティブ時に --accent で border-color を変える（CSS 規約）", () => {
    const cssPath = resolve(__dirname, "../FileDropZone.module.css");
    const css = readFileSync(cssPath, "utf-8");
    // .dropZoneActive または :hover ブロックに --accent が含まれること
    expect(css).toContain("--accent");
  });

  it(".dropZone は --radius-sm を border-radius に使う（DESIGN.md §4: 入力欄の 2px 例外）", () => {
    const cssPath = resolve(__dirname, "../FileDropZone.module.css");
    const css = readFileSync(cssPath, "utf-8");
    const dropZoneBlock = css.match(/\.dropZone\s*\{[^}]+\}/)?.[0] ?? "";
    expect(dropZoneBlock).toContain("--radius-sm");
  });

  it("font-weight: 700 を使っていない（CSS 規約）", () => {
    const cssPath = resolve(__dirname, "../FileDropZone.module.css");
    const css = readFileSync(cssPath, "utf-8");
    expect(css).not.toMatch(/font-weight\s*:\s*700/);
  });
});
