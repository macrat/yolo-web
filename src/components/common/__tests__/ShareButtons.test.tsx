import { expect, test, describe, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ShareButtons from "../ShareButtons";

// Mock window.open
const mockWindowOpen = vi.fn();

beforeEach(() => {
  vi.restoreAllMocks();
  mockWindowOpen.mockClear();
  vi.stubGlobal("open", mockWindowOpen);
  vi.stubGlobal("window", {
    ...window,
    location: { origin: "https://yolos.net" },
    open: mockWindowOpen,
  });
  Object.assign(navigator, {
    clipboard: {
      writeText: vi.fn().mockResolvedValue(undefined),
    },
  });
});

describe("ShareButtons", () => {
  test("renders all 4 buttons by default", () => {
    render(<ShareButtons url="/blog/test-post" title="Test Title" />);
    expect(
      screen.getByRole("button", { name: /X\u3067\u30B7\u30A7\u30A2/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /LINE\u3067\u30B7\u30A7\u30A2/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /\u306F\u3066\u30D6/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /\u30B3\u30D4\u30FC/ }),
    ).toBeInTheDocument();
  });

  test("renders only specified sns buttons", () => {
    render(
      <ShareButtons
        url="/blog/test-post"
        title="Test Title"
        sns={["x", "copy"]}
      />,
    );
    expect(
      screen.getByRole("button", { name: /X\u3067\u30B7\u30A7\u30A2/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /\u30B3\u30D4\u30FC/ }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /LINE\u3067\u30B7\u30A7\u30A2/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /\u306F\u3066\u30D6/ }),
    ).not.toBeInTheDocument();
  });

  test("X button opens correct intent URL with text+url separated", () => {
    render(<ShareButtons url="/blog/test-post" title="Test Title" />);
    const button = screen.getByRole("button", {
      name: /X\u3067\u30B7\u30A7\u30A2/,
    });
    fireEvent.click(button);
    expect(mockWindowOpen).toHaveBeenCalledWith(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent("Test Title")}&url=${encodeURIComponent("https://yolos.net/blog/test-post")}`,
      "_blank",
      "noopener,noreferrer",
    );
  });

  test("LINE button opens correct share URL", () => {
    render(<ShareButtons url="/blog/test-post" title="Test Title" />);
    const button = screen.getByRole("button", {
      name: /LINE\u3067\u30B7\u30A7\u30A2/,
    });
    fireEvent.click(button);
    expect(mockWindowOpen).toHaveBeenCalledWith(
      `https://line.me/R/share?text=${encodeURIComponent("Test Title\nhttps://yolos.net/blog/test-post")}`,
      "_blank",
      "noopener,noreferrer",
    );
  });

  test("Hatena button opens correct bookmark URL", () => {
    render(<ShareButtons url="/blog/test-post" title="Test Title" />);
    const button = screen.getByRole("button", {
      name: /\u306F\u3066\u30D6/,
    });
    fireEvent.click(button);
    expect(mockWindowOpen).toHaveBeenCalledWith(
      `https://b.hatena.ne.jp/entry/panel/?url=${encodeURIComponent("https://yolos.net/blog/test-post")}&btitle=${encodeURIComponent("Test Title")}`,
      "_blank",
      "noopener,noreferrer",
    );
  });

  test("Copy button calls navigator.clipboard.writeText with correct text", async () => {
    render(<ShareButtons url="/blog/test-post" title="Test Title" />);
    const button = screen.getByRole("button", {
      name: /\u30B3\u30D4\u30FC/,
    });
    fireEvent.click(button);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      "Test Title\nhttps://yolos.net/blog/test-post",
    );
  });

  test("shows copied message after copy", async () => {
    render(<ShareButtons url="/blog/test-post" title="Test Title" />);
    const button = screen.getByRole("button", {
      name: /\u30B3\u30D4\u30FC/,
    });
    fireEvent.click(button);
    // Wait for async clipboard operation
    await screen.findByText("\u30B3\u30D4\u30FC\u3057\u307E\u3057\u305F!");
    expect(
      screen.getByText("\u30B3\u30D4\u30FC\u3057\u307E\u3057\u305F!"),
    ).toBeInTheDocument();
  });

  test("copied message container has aria-live polite", () => {
    render(<ShareButtons url="/blog/test-post" title="Test Title" />);
    const statusElement = screen.getByRole("status");
    expect(statusElement).toHaveAttribute("aria-live", "polite");
  });

  test("window.open is called with noopener,noreferrer", () => {
    render(<ShareButtons url="/blog/test-post" title="Test Title" />);
    const button = screen.getByRole("button", {
      name: /X\u3067\u30B7\u30A7\u30A2/,
    });
    fireEvent.click(button);
    expect(mockWindowOpen).toHaveBeenCalledWith(
      expect.any(String),
      "_blank",
      "noopener,noreferrer",
    );
  });
});
