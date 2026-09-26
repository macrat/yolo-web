import { afterEach, describe, expect, test, vi } from "vitest";
import { copyText } from "@/lib/clipboard";

function stubClipboard(writeText?: (text: string) => Promise<void>): void {
  vi.stubGlobal("navigator", {
    ...navigator,
    clipboard: writeText ? { writeText } : undefined,
  });
}

/** jsdom は execCommand を持たないので、この文書にだけ置く（afterEach で外す）。 */
function stubExecCommand(
  impl: (command: string) => boolean,
): ReturnType<typeof vi.fn> {
  const execCommand = vi.fn(impl);
  Object.defineProperty(document, "execCommand", {
    value: execCommand,
    configurable: true,
    writable: true,
  });
  return execCommand;
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  delete (document as { execCommand?: unknown }).execCommand;
});

describe("copyText", () => {
  test("クリップボードの API で写せたら、ほかの方法を使わない", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    stubClipboard(writeText);
    const execCommand = stubExecCommand(() => true);
    await expect(copyText("文\nhttps://example.com/a")).resolves.toBe(true);
    expect(writeText).toHaveBeenCalledWith("文\nhttps://example.com/a");
    expect(execCommand).not.toHaveBeenCalled();
  });

  test("API に拒まれたら、選んだ文を写す方法で同じ文を写す", async () => {
    stubClipboard(vi.fn().mockRejectedValue(new Error("denied")));
    let selected = "";
    stubExecCommand((command) => {
      const field = document.activeElement;
      if (command === "copy" && field instanceof HTMLTextAreaElement) {
        selected = field.value.slice(field.selectionStart, field.selectionEnd);
      }
      return true;
    });
    await expect(copyText("文\nhttps://example.com/a")).resolves.toBe(true);
    expect(selected).toBe("文\nhttps://example.com/a");
  });

  test("API の無い端末でも、選んだ文を写す方法で写す", async () => {
    stubClipboard(undefined);
    const execCommand = stubExecCommand(() => true);
    await expect(copyText("文")).resolves.toBe(true);
    expect(execCommand).toHaveBeenCalledWith("copy");
  });

  test("置く所を渡すと、写す欄をその中に置く（モーダルのダイアログの中から写すため）", async () => {
    stubClipboard(undefined);
    const container = document.createElement("div");
    document.body.appendChild(container);
    let parent: Element | null = null;
    stubExecCommand(() => {
      parent = document.querySelector("textarea")?.parentElement ?? null;
      return true;
    });
    await expect(copyText("文", container)).resolves.toBe(true);
    expect(parent).toBe(container);
    container.remove();
  });

  test("どちらでも写せなければ false を返す", async () => {
    stubClipboard(vi.fn().mockRejectedValue(new Error("denied")));
    stubExecCommand(() => false);
    await expect(copyText("文")).resolves.toBe(false);
  });

  test("写すために置いた欄を残さず、フォーカスを押したボタンへ戻す", async () => {
    stubClipboard(undefined);
    stubExecCommand(() => true);
    const button = document.createElement("button");
    document.body.appendChild(button);
    button.focus();
    await copyText("文");
    expect(document.querySelector("textarea")).toBeNull();
    expect(document.activeElement).toBe(button);
    button.remove();
  });
});
