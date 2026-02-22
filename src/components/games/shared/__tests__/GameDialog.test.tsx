import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import GameDialog from "../GameDialog";

// Mock useDialog to avoid issues with dialog.showModal() in jsdom
vi.mock("../useDialog", () => ({
  useDialog: (open: boolean, onClose: () => void) => ({
    dialogRef: { current: null },
    handleClose: onClose,
    handleBackdropClick: vi.fn(),
  }),
}));

describe("GameDialog", () => {
  it("should render the title with correct id and text", () => {
    render(
      <GameDialog
        open={false}
        onClose={() => {}}
        titleId="test-title"
        title="Test Title"
      >
        <p>Content</p>
      </GameDialog>,
    );

    const title = screen.getByText("Test Title");
    expect(title).toBeDefined();
    expect(title.id).toBe("test-title");
    expect(title.tagName).toBe("H2");
  });

  it("should render children content", () => {
    render(
      <GameDialog
        open={false}
        onClose={() => {}}
        titleId="test-title"
        title="Title"
      >
        <p>Child content here</p>
      </GameDialog>,
    );

    expect(screen.getByText("Child content here")).toBeDefined();
  });

  it("should render close button", () => {
    render(
      <GameDialog
        open={false}
        onClose={() => {}}
        titleId="test-title"
        title="Title"
      >
        <p>Content</p>
      </GameDialog>,
    );

    const closeButton = screen.getByText("\u9589\u3058\u308B");
    expect(closeButton).toBeDefined();
    expect(closeButton.tagName).toBe("BUTTON");
  });

  it("should call onClose when close button is clicked", () => {
    const onClose = vi.fn();

    render(
      <GameDialog
        open={false}
        onClose={onClose}
        titleId="test-title"
        title="Title"
      >
        <p>Content</p>
      </GameDialog>,
    );

    fireEvent.click(screen.getByText("\u9589\u3058\u308B"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should apply custom width via style", () => {
    const { container } = render(
      <GameDialog
        open={false}
        onClose={() => {}}
        titleId="test-title"
        title="Title"
        width={440}
      >
        <p>Content</p>
      </GameDialog>,
    );

    const dialog = container.querySelector("dialog");
    expect(dialog?.style.width).toBe("440px");
  });

  it("should render headerContent before the title", () => {
    const { container } = render(
      <GameDialog
        open={false}
        onClose={() => {}}
        titleId="test-title"
        title="Title"
        headerContent={<div data-testid="header">Header</div>}
      >
        <p>Content</p>
      </GameDialog>,
    );

    const header = screen.getByTestId("header");
    const title = screen.getByText("Title");

    // Header should come before title in DOM order
    const dialog = container.querySelector("dialog");
    const children = Array.from(dialog?.children ?? []);
    const headerIndex = children.indexOf(header);
    const titleIndex = children.indexOf(title);
    expect(headerIndex).toBeLessThan(titleIndex);
  });

  it("should render footer before the close button", () => {
    render(
      <GameDialog
        open={false}
        onClose={() => {}}
        titleId="test-title"
        title="Title"
        footer={<button data-testid="footer-btn">Stats</button>}
      >
        <p>Content</p>
      </GameDialog>,
    );

    expect(screen.getByTestId("footer-btn")).toBeDefined();
    expect(screen.getByText("Stats")).toBeDefined();
  });

  it("should set aria-labelledby on the dialog element", () => {
    const { container } = render(
      <GameDialog
        open={false}
        onClose={() => {}}
        titleId="my-dialog-title"
        title="Title"
      >
        <p>Content</p>
      </GameDialog>,
    );

    const dialog = container.querySelector("dialog");
    expect(dialog?.getAttribute("aria-labelledby")).toBe("my-dialog-title");
  });
});
