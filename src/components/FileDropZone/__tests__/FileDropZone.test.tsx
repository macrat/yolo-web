import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import FileDropZone from "../index";
import { followsPhraseRules } from "@/lib/phrase-breaks";

const MB = 1024 * 1024;

function getFileInput(container: HTMLElement): HTMLInputElement {
  return container.querySelector('input[type="file"]') as HTMLInputElement;
}

function selectFile(input: HTMLInputElement, file: File) {
  Object.defineProperty(input, "files", {
    value: { 0: file, length: 1, item: () => file },
    configurable: true,
  });
  fireEvent.change(input);
}

function dropFile(target: Element, file: File) {
  const dropEvent = new Event("drop", { bubbles: true, cancelable: true });
  Object.defineProperty(dropEvent, "dataTransfer", {
    value: { files: { 0: file, length: 1, item: () => file } },
  });
  fireEvent(target, dropEvent);
}

describe("FileDropZone", () => {
  const onFileSelect = vi.fn();

  beforeEach(() => {
    onFileSelect.mockClear();
  });

  it("ファイルを選ぶ入力が、欄の上のラベルを名前に持つ", () => {
    render(<FileDropZone label="画像ファイル" onFileSelect={onFileSelect} />);
    const input = screen.getByLabelText("画像ファイル");
    expect(input).toHaveAttribute("type", "file");
  });

  it("選ぶ欄はボタンではない（押しても別のページも実行もしない、選ぶ欄として示す）", () => {
    render(<FileDropZone label="画像ファイル" onFileSelect={onFileSelect} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("見えている欄は入力のラベルで、押すと選ぶ画面が開く", () => {
    const { container } = render(
      <FileDropZone label="画像ファイル" onFileSelect={onFileSelect} />,
    );
    const input = getFileInput(container);
    const zone = container.querySelector("[data-field]");
    expect(zone?.tagName).toBe("LABEL");
    expect(zone).toHaveAttribute("for", input.id);
  });

  it("欄の文と補助情報を入力の説明として読ませる", () => {
    const { container } = render(
      <FileDropZone
        label="画像ファイル"
        onFileSelect={onFileSelect}
        description="PNG, JPEG 対応 (最大10MB)"
      />,
    );
    const input = getFileInput(container);
    expect(input).toHaveAccessibleDescription(
      "ファイルを選ぶ ここにファイルを落としても選べます PNG, JPEG 対応 (最大10MB)",
    );
  });

  it("選んだファイルで onFileSelect を呼ぶ", () => {
    const { container } = render(
      <FileDropZone label="画像ファイル" onFileSelect={onFileSelect} />,
    );
    const file = new File(["dummy"], "test.png", { type: "image/png" });
    selectFile(getFileInput(container), file);
    expect(onFileSelect).toHaveBeenCalledWith(file);
  });

  it("上限を超えるファイルは onFileSelect を呼ばず、上限の MB を含む文で onError を呼ぶ", () => {
    const onError = vi.fn();
    const maxSizeBytes = 1.5 * MB;
    const { container } = render(
      <FileDropZone
        label="画像ファイル"
        onFileSelect={onFileSelect}
        maxSizeBytes={maxSizeBytes}
        onError={onError}
      />,
    );
    const bigFile = new File(["x".repeat(maxSizeBytes + 1)], "big.png", {
      type: "image/png",
    });
    selectFile(getFileInput(container), bigFile);
    expect(onFileSelect).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0][0]).toContain("1.5MB");
  });

  it("上限以内のファイルは onFileSelect を呼ぶ", () => {
    const onError = vi.fn();
    const { container } = render(
      <FileDropZone
        label="画像ファイル"
        onFileSelect={onFileSelect}
        maxSizeBytes={10 * MB}
        onError={onError}
      />,
    );
    const smallFile = new File(["hello"], "small.png", { type: "image/png" });
    selectFile(getFileInput(container), smallFile);
    expect(onFileSelect).toHaveBeenCalledWith(smallFile);
    expect(onError).not.toHaveBeenCalled();
  });

  it("accept を入力に渡す", () => {
    const { container } = render(
      <FileDropZone
        label="画像ファイル"
        onFileSelect={onFileSelect}
        accept="image/*"
      />,
    );
    expect(getFileInput(container)).toHaveAttribute("accept", "image/*");
  });

  it("欄に落としたファイルでも onFileSelect を呼ぶ", () => {
    const { container } = render(
      <FileDropZone label="画像ファイル" onFileSelect={onFileSelect} />,
    );
    const file = new File(["img"], "drop.png", { type: "image/png" });
    dropFile(container.querySelector("[data-field]")!, file);
    expect(onFileSelect).toHaveBeenCalledWith(file);
  });

  it("落としたファイルが上限を超えるときは onError を呼ぶ", () => {
    const onError = vi.fn();
    const maxSizeBytes = 1 * MB;
    const { container } = render(
      <FileDropZone
        label="画像ファイル"
        onFileSelect={onFileSelect}
        maxSizeBytes={maxSizeBytes}
        onError={onError}
      />,
    );
    const bigFile = new File(["x".repeat(maxSizeBytes + 1)], "big.png", {
      type: "image/png",
    });
    dropFile(container.querySelector("[data-field]")!, bigFile);
    expect(onFileSelect).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it("ファイルを重ねているあいだだけ、離せば選べることを文言で示す", () => {
    const { container } = render(
      <FileDropZone label="画像ファイル" onFileSelect={onFileSelect} />,
    );
    const zone = container.querySelector("[data-field]")!;
    expect(zone).toHaveTextContent("ファイルを選ぶ");
    fireEvent.dragEnter(zone);
    expect(zone).toHaveTextContent("ここで離すと選べます");
    fireEvent.dragLeave(zone);
    expect(zone).toHaveTextContent("ファイルを選ぶ");
    fireEvent.dragEnter(zone);
    dropFile(zone, new File(["img"], "drop.png", { type: "image/png" }));
    expect(zone).toHaveTextContent("ファイルを選ぶ");
  });

  it("description を表示する", () => {
    render(
      <FileDropZone
        label="画像ファイル"
        onFileSelect={onFileSelect}
        description="PNG, JPEG 対応 (最大10MB)"
      />,
    );
    expect(screen.getByText("PNG, JPEG 対応 (最大10MB)")).toBeInTheDocument();
  });

  it("エラーのあいだ、入力を aria-invalid にし、欄の直下の理由の文を入力の説明にする", () => {
    const { container, rerender } = render(
      <FileDropZone
        label="画像ファイル"
        onFileSelect={onFileSelect}
        error="画像ファイルを選んでください（PNG・JPEG など）"
      />,
    );
    const input = getFileInput(container);
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription(
      /画像ファイルを選んでください（PNG・JPEG など）/,
    );
    expect(container.querySelector("[data-field]")!.nextElementSibling).toBe(
      screen.getByRole("alert"),
    );
    rerender(<FileDropZone label="画像ファイル" onFileSelect={onFileSelect} />);
    expect(input).not.toHaveAttribute("aria-invalid");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("上限を超えたときの文は、直し方まで言う", () => {
    const onError = vi.fn();
    const { container } = render(
      <FileDropZone
        label="画像ファイル"
        onFileSelect={onFileSelect}
        maxSizeBytes={10 * MB}
        onError={onError}
      />,
    );
    selectFile(
      getFileInput(container),
      new File(["x".repeat(10 * MB + 1)], "big.png", { type: "image/png" }),
    );
    expect(onError).toHaveBeenCalledWith(
      "ファイルが10MBを超えています。10MB以下のファイルを選んでください",
    );
  });

  it("面の字は文節で折り、落として選べる案内は括弧で添えずに補助情報の行に置く", () => {
    const { container } = render(
      <FileDropZone label="画像ファイル" onFileSelect={onFileSelect} />,
    );
    const zone = container.querySelector("[data-field]")!;
    const [prompt, hint] = [...zone.children];
    expect(prompt.innerHTML).toBe("ファイルを<wbr>選ぶ");
    expect(hint.innerHTML).toBe(
      "ここに<wbr>ファイルを<wbr>落としても<wbr>選べます",
    );
    expect(followsPhraseRules(hint.innerHTML.split("<wbr>"))).toBe(true);
    expect(zone.textContent).not.toMatch(/[（(]/);
    expect(followsPhraseRules(prompt.innerHTML.split("<wbr>"))).toBe(true);
    fireEvent.dragEnter(zone);
    expect(prompt.innerHTML).toBe("ここで<wbr>離すと<wbr>選べます");
    expect(followsPhraseRules(prompt.innerHTML.split("<wbr>"))).toBe(true);
  });

  it("区切りの並びのラベルは文節で折り、入力の名前は元の文", () => {
    const { container } = render(
      <FileDropZone label={["変換する", "画像"]} onFileSelect={onFileSelect} />,
    );
    const input = getFileInput(container);
    expect(input).toHaveAccessibleName("変換する画像");
    expect(container.querySelector("label")!.innerHTML).toContain(
      "変換する<wbr>画像",
    );
  });
});
