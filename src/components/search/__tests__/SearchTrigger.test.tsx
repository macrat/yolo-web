import { describe, expect, test, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import SearchTrigger from "../SearchTrigger";

// jsdom does not implement scrollIntoView
Element.prototype.scrollIntoView = vi.fn();

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
}));

// Mock documents for the search index fetch
const mockDocuments = [
  {
    id: "tool:char-count",
    type: "tool",
    title: "文字数カウント",
    description: "テキストの文字数を数えるツール",
    keywords: ["文字数", "カウント"],
    url: "/tools/char-count",
    category: "text",
  },
];

let pushStateSpy: ReturnType<typeof vi.spyOn>;
let historyBackSpy: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockDocuments,
    }),
  );
  pushStateSpy = vi.spyOn(window.history, "pushState");
  historyBackSpy = vi.spyOn(window.history, "back");
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("SearchTrigger aria-expanded and aria-controls", () => {
  test("initial state has aria-expanded='false'", () => {
    render(<SearchTrigger />);
    const button = screen.getByRole("button", { name: /サイト内検索/ });
    expect(button).toHaveAttribute("aria-expanded", "false");
  });

  test("aria-controls is set to 'search-modal-dialog'", () => {
    render(<SearchTrigger />);
    const button = screen.getByRole("button", { name: /サイト内検索/ });
    expect(button).toHaveAttribute("aria-controls", "search-modal-dialog");
  });

  test("aria-expanded becomes 'true' after button click", () => {
    render(<SearchTrigger />);
    const button = screen.getByRole("button", { name: /サイト内検索/ });

    fireEvent.click(button);

    expect(button).toHaveAttribute("aria-expanded", "true");
  });

  test("aria-expanded returns to 'false' after closing modal with ESC", async () => {
    render(<SearchTrigger />);
    const button = screen.getByRole("button", { name: /サイト内検索/ });

    // Open the modal
    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");

    // Wait for the SearchModal portal to mount and register its keydown listener
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Close the modal with ESC
    fireEvent.keyDown(document, { key: "Escape" });
    expect(button).toHaveAttribute("aria-expanded", "false");
  });

  test("aria-expanded returns to 'false' after closing modal by overlay click", async () => {
    render(<SearchTrigger />);
    const button = screen.getByRole("button", { name: /サイト内検索/ });

    // Open the modal
    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");

    // Wait for the SearchModal portal to mount
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Close the modal by clicking the overlay
    const overlay = screen.getByTestId("search-overlay");
    fireEvent.click(overlay);
    expect(button).toHaveAttribute("aria-expanded", "false");
  });
});

describe("SearchTrigger history API integration", () => {
  test("pushState is called when modal opens", () => {
    render(<SearchTrigger />);
    const button = screen.getByRole("button", { name: /サイト内検索/ });

    fireEvent.click(button);

    expect(pushStateSpy).toHaveBeenCalledWith({ searchModalOpen: true }, "");
  });

  test("pushState is not called when modal is already closed", () => {
    render(<SearchTrigger />);

    // In the initial closed state, pushState should not have been called
    expect(pushStateSpy).not.toHaveBeenCalled();
  });

  test("popstate event closes the modal", async () => {
    render(<SearchTrigger />);
    const button = screen.getByRole("button", { name: /サイト内検索/ });

    // Open the modal
    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");

    // Simulate the browser back button by dispatching popstate
    act(() => {
      window.dispatchEvent(new PopStateEvent("popstate"));
    });

    // Modal should be closed
    expect(button).toHaveAttribute("aria-expanded", "false");
    // history.back() should NOT be called because popstate already navigated back
    expect(historyBackSpy).not.toHaveBeenCalled();
  });

  test("history.back() is called when modal is closed by ESC", async () => {
    render(<SearchTrigger />);
    const button = screen.getByRole("button", { name: /サイト内検索/ });

    // Open the modal
    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");

    // Wait for the SearchModal portal to mount and register its keydown listener
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Close via ESC key
    fireEvent.keyDown(document, { key: "Escape" });

    expect(button).toHaveAttribute("aria-expanded", "false");
    // history.back() should be called to remove the pushed entry
    expect(historyBackSpy).toHaveBeenCalledTimes(1);
  });

  test("history.back() is called when modal is closed by overlay click", async () => {
    render(<SearchTrigger />);
    const button = screen.getByRole("button", { name: /サイト内検索/ });

    // Open the modal
    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");

    // Wait for the SearchModal portal to mount
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Close via overlay click
    const overlay = screen.getByTestId("search-overlay");
    fireEvent.click(overlay);

    expect(button).toHaveAttribute("aria-expanded", "false");
    // history.back() should be called to remove the pushed entry
    expect(historyBackSpy).toHaveBeenCalledTimes(1);
  });

  test("Cmd+K toggle closing also calls history.back()", () => {
    render(<SearchTrigger />);
    const button = screen.getByRole("button", { name: /サイト内検索/ });

    // Open with Cmd+K
    fireEvent.keyDown(document, { key: "k", metaKey: true });
    expect(button).toHaveAttribute("aria-expanded", "true");

    // Close with Cmd+K again
    fireEvent.keyDown(document, { key: "k", metaKey: true });
    expect(button).toHaveAttribute("aria-expanded", "false");

    // history.back() should be called to remove the pushed entry
    expect(historyBackSpy).toHaveBeenCalledTimes(1);
  });

  test("popstate listener is cleaned up when modal closes", async () => {
    render(<SearchTrigger />);
    const button = screen.getByRole("button", { name: /サイト内検索/ });

    // Open the modal
    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");

    // Wait for the SearchModal portal to mount
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Close the modal via ESC
    fireEvent.keyDown(document, { key: "Escape" });
    expect(button).toHaveAttribute("aria-expanded", "false");

    // Reset spies to check that no further calls happen
    pushStateSpy.mockClear();
    historyBackSpy.mockClear();

    // Dispatch popstate after modal is already closed - should have no effect
    act(() => {
      window.dispatchEvent(new PopStateEvent("popstate"));
    });

    // Modal should remain closed and no additional history calls
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(pushStateSpy).not.toHaveBeenCalled();
  });
});
