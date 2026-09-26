import { beforeAll, describe, expect, it, vi } from "vitest";
import { fireEvent, render } from "@testing-library/react";
import GameDialog from "../GameDialog";

// jsdom does not implement showModal / close; simulate the open attribute.
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (
    this: HTMLDialogElement,
  ) {
    this.setAttribute("open", "");
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  });
});

function renderOpen(onClose: () => void) {
  const utils = render(
    <GameDialog open={true} onClose={onClose} titleId="t" title="結果">
      <p>結果の文</p>
    </GameDialog>,
  );
  const dialog = utils.getByRole("dialog", { hidden: true });
  vi.spyOn(dialog, "getBoundingClientRect").mockReturnValue(
    new DOMRect(100, 100, 400, 300),
  );
  return { ...utils, dialog };
}

describe("GameDialog の背景", () => {
  it("背景で押して背景で離すと閉じる", () => {
    const onClose = vi.fn();
    const { dialog } = renderOpen(onClose);
    fireEvent.pointerDown(dialog, { clientX: 20, clientY: 20 });
    fireEvent.click(dialog, { clientX: 20, clientY: 20 });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("中の文から背景へなぞって離しても閉じない", () => {
    const onClose = vi.fn();
    const { dialog, getByText } = renderOpen(onClose);
    fireEvent.pointerDown(getByText("結果の文"), {
      clientX: 200,
      clientY: 200,
    });
    fireEvent.click(dialog, { clientX: 20, clientY: 20 });
    expect(onClose).not.toHaveBeenCalled();
  });
});
