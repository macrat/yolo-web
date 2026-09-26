import { describe, it, expect, vi, beforeAll } from "vitest";
import { useRef } from "react";
import { renderHook, act, render, fireEvent } from "@testing-library/react";
import { useDialog } from "../useDialog";

// jsdom does not implement HTMLDialogElement.showModal / close. Mock them to
// simulate native open/close so the focus-management effect can be exercised.
// Crucially, the real showModal() moves focus *into* the dialog; our mock does
// NOT, so that a test can observe the focus useDialog places on returnFocusRef
// *before* showModal() (which the real browser would then overwrite).
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

describe("useDialog", () => {
  it("should return dialogRef, handleClose, and handleBackdropClick", () => {
    const onClose = vi.fn();
    const { result } = renderHook(() => useDialog(false, onClose));

    expect(result.current.dialogRef).toBeDefined();
    expect(typeof result.current.handleClose).toBe("function");
    expect(typeof result.current.handleBackdropClick).toBe("function");
  });

  it("should call onClose when handleClose is invoked", () => {
    const onClose = vi.fn();
    const { result } = renderHook(() => useDialog(false, onClose));

    act(() => {
      result.current.handleClose();
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  const dialogRect = { left: 100, right: 500, top: 100, bottom: 400 };

  /** A click event dispatched on the <dialog> element itself. */
  function clickOnDialog(
    clientX: number,
    clientY: number,
  ): React.MouseEvent<HTMLDialogElement> {
    const dialog = { getBoundingClientRect: () => dialogRect };
    return {
      clientX,
      clientY,
      target: dialog,
      currentTarget: dialog,
    } as unknown as React.MouseEvent<HTMLDialogElement>;
  }

  it("should call onClose on backdrop click (outside dialog bounds)", () => {
    const onClose = vi.fn();
    const { result } = renderHook(() => useDialog(false, onClose));

    act(() => {
      result.current.handleBackdropClick(clickOnDialog(0, 0));
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should NOT call onClose on a click in the dialog's own padding", () => {
    const onClose = vi.fn();
    const { result } = renderHook(() => useDialog(false, onClose));

    act(() => {
      result.current.handleBackdropClick(clickOnDialog(300, 250));
    });

    expect(onClose).not.toHaveBeenCalled();
  });
});

describe("useDialog with a real <dialog>", () => {
  it("stays open when a button inside is pressed with the keyboard (click at 0, 0)", () => {
    const onClose = vi.fn();
    const { getByRole } = render(
      <DialogHarness open={true} useAnchor={false} onClose={onClose} />,
    );
    const dialog = getByRole("dialog", { hidden: true });
    vi.spyOn(dialog, "getBoundingClientRect").mockReturnValue(
      new DOMRect(100, 100, 400, 300),
    );
    // Enter/Space on a focused button dispatches a click whose coordinates are 0, 0.
    fireEvent.click(
      getByRole("button", { name: "結果をコピー", hidden: true }),
      {
        clientX: 0,
        clientY: 0,
      },
    );
    expect(onClose).not.toHaveBeenCalled();
  });

  it("closes when the backdrop is clicked", () => {
    const onClose = vi.fn();
    const { getByRole } = render(
      <DialogHarness open={true} useAnchor={false} onClose={onClose} />,
    );
    const dialog = getByRole("dialog", { hidden: true });
    vi.spyOn(dialog, "getBoundingClientRect").mockReturnValue(
      new DOMRect(100, 100, 400, 300),
    );
    fireEvent.click(dialog, { clientX: 20, clientY: 20 });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes on the native close (Esc)", () => {
    const onClose = vi.fn();
    const { getByRole } = render(
      <DialogHarness open={true} useAnchor={false} onClose={onClose} />,
    );
    // Esc closes a modal <dialog> natively and fires its close event.
    fireEvent(getByRole("dialog", { hidden: true }), new Event("close"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

/**
 * A minimal harness that wires useDialog to a real <dialog> (with buttons inside)
 * plus a focus-restore anchor (<h1 tabindex=-1>) and a trigger <button>,
 * mirroring the game layout.
 * `returnFocusRef` is only supplied when `useAnchor` is true.
 */
function DialogHarness({
  open,
  useAnchor,
  onClose = () => {},
}: {
  open: boolean;
  useAnchor: boolean;
  onClose?: () => void;
}) {
  const anchorRef = useRef<HTMLHeadingElement>(null);
  const { dialogRef, handleClose, handleBackdropClick } = useDialog(
    open,
    onClose,
    useAnchor ? anchorRef : undefined,
  );
  return (
    <div>
      <h1 ref={anchorRef} tabIndex={-1} data-testid="anchor">
        Title
      </h1>
      <button data-testid="trigger">open</button>
      <dialog
        ref={dialogRef}
        onClose={handleClose}
        onClick={handleBackdropClick}
      >
        <button>結果をコピー</button>
        <button>閉じる</button>
      </dialog>
    </div>
  );
}

describe("useDialog focus restoration (returnFocusRef)", () => {
  it("focuses the return anchor when auto-opened (nothing meaningful focused)", () => {
    // Nothing is focused after render → document.activeElement is <body>,
    // which is how an auto-opened modal (first-visit / game-end) opens.
    const { rerender, getByTestId } = render(
      <DialogHarness open={false} useAnchor={true} />,
    );
    expect(document.activeElement).toBe(document.body);

    rerender(<DialogHarness open={true} useAnchor={true} />);

    // useDialog moved focus onto the anchor *before* showModal(); the real
    // browser would then restore focus here on close (Esc/backdrop/button).
    expect(document.activeElement).toBe(getByTestId("anchor"));
  });

  it("focuses the anchor with preventScroll (no scroll jump on auto-open)", () => {
    // The anchor (game <h1>) is at the top of the page, but an auto-opened modal
    // can appear while the user is scrolled down (game-end Result). Focus must
    // use { preventScroll: true } so the page is not yanked to the top. jsdom
    // has no layout/scroll, so we assert the option is passed rather than the
    // scroll outcome (that is verified in a real browser).
    const focusSpy = vi.spyOn(HTMLHeadingElement.prototype, "focus");
    const { rerender } = render(
      <DialogHarness open={false} useAnchor={true} />,
    );
    rerender(<DialogHarness open={true} useAnchor={true} />);

    expect(focusSpy).toHaveBeenCalledWith({ preventScroll: true });
    focusSpy.mockRestore();
  });

  it("does NOT redirect focus when opened from a trigger (manual open)", () => {
    const { rerender, getByTestId } = render(
      <DialogHarness open={false} useAnchor={true} />,
    );
    const trigger = getByTestId("trigger") as HTMLButtonElement;
    // A user clicking the help/stats button leaves that button focused.
    trigger.focus();
    expect(document.activeElement).toBe(trigger);

    rerender(<DialogHarness open={true} useAnchor={true} />);

    // The trigger is a meaningful opener → native restoration handles it, so
    // useDialog must not steal focus onto the anchor.
    expect(document.activeElement).toBe(trigger);
    expect(document.activeElement).not.toBe(getByTestId("anchor"));
  });

  it("does nothing special when no returnFocusRef is provided", () => {
    const { rerender } = render(
      <DialogHarness open={false} useAnchor={false} />,
    );
    expect(document.activeElement).toBe(document.body);

    rerender(<DialogHarness open={true} useAnchor={false} />);

    // Without an anchor, focus stays on <body> (pre-existing behavior). This
    // documents that the anchor is what prevents the focus loss.
    expect(document.activeElement).toBe(document.body);
  });
});
