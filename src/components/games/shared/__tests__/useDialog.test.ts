import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDialog } from "../useDialog";

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

  it("should call onClose on backdrop click (outside dialog bounds)", () => {
    const onClose = vi.fn();
    const { result } = renderHook(() => useDialog(false, onClose));

    // Simulate a click outside the dialog bounding rect
    const mockEvent = {
      clientX: 0,
      clientY: 0,
      currentTarget: {
        getBoundingClientRect: () => ({
          left: 100,
          right: 500,
          top: 100,
          bottom: 400,
        }),
      },
    } as unknown as React.MouseEvent<HTMLDialogElement>;

    act(() => {
      result.current.handleBackdropClick(mockEvent);
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should NOT call onClose on click inside dialog bounds", () => {
    const onClose = vi.fn();
    const { result } = renderHook(() => useDialog(false, onClose));

    const mockEvent = {
      clientX: 300,
      clientY: 250,
      currentTarget: {
        getBoundingClientRect: () => ({
          left: 100,
          right: 500,
          top: 100,
          bottom: 400,
        }),
      },
    } as unknown as React.MouseEvent<HTMLDialogElement>;

    act(() => {
      result.current.handleBackdropClick(mockEvent);
    });

    expect(onClose).not.toHaveBeenCalled();
  });
});
