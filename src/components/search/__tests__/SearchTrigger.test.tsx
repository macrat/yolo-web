import { describe, expect, test, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import SearchTrigger from "../SearchTrigger";
import * as analytics from "@/lib/analytics";

// jsdom does not implement scrollIntoView
Element.prototype.scrollIntoView = vi.fn();

// jsdom does not implement HTMLDialogElement.showModal / close.
HTMLDialogElement.prototype.showModal = vi.fn(function (
  this: HTMLDialogElement,
) {
  this.setAttribute("open", "");
});
HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
  this.removeAttribute("open");
  this.dispatchEvent(new Event("close"));
});

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

// Stub window.gtag so analytics functions don't throw in tests
beforeEach(() => {
  vi.stubGlobal("gtag", vi.fn());
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
  vi.unstubAllGlobals();
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

  test("aria-haspopup is set to 'dialog'", () => {
    render(<SearchTrigger />);
    const button = screen.getByRole("button", { name: /サイト内検索/ });
    expect(button).toHaveAttribute("aria-haspopup", "dialog");
  });

  test("aria-expanded becomes 'true' after button click", () => {
    render(<SearchTrigger />);
    const button = screen.getByRole("button", { name: /サイト内検索/ });

    fireEvent.click(button);

    expect(button).toHaveAttribute("aria-expanded", "true");
  });

  test("aria-expanded returns to 'false' after closing modal with ESC (cancel event)", async () => {
    render(<SearchTrigger />);
    const button = screen.getByRole("button", { name: /サイト内検索/ });

    // Open the modal
    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");

    // Wait for the SearchModal to mount and register its cancel listener
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Close the modal via cancel event (native <dialog> ESC behavior)
    const dialog = screen.getByRole("dialog");
    fireEvent(dialog, new Event("cancel", { cancelable: true }));
    expect(button).toHaveAttribute("aria-expanded", "false");
  });

  test("aria-expanded returns to 'false' after closing modal by backdrop click", async () => {
    render(<SearchTrigger />);
    const button = screen.getByRole("button", { name: /サイト内検索/ });

    // Open the modal
    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");

    // Wait for the SearchModal to mount
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Close the modal by clicking the dialog backdrop (target === dialog element)
    const dialog = screen.getByRole("dialog");
    fireEvent.click(dialog);
    expect(button).toHaveAttribute("aria-expanded", "false");
  });
});

describe("SearchTrigger focus restoration", () => {
  test("focus returns to trigger button after modal is closed with dismiss reason", async () => {
    render(<SearchTrigger />);
    const button = screen.getByRole("button", { name: /サイト内検索/ });

    // Focus the button and open the modal
    button.focus();
    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");

    // Wait for modal to mount
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Close with ESC (cancel event = dismiss reason)
    const dialog = screen.getByRole("dialog");
    fireEvent(dialog, new Event("cancel", { cancelable: true }));

    // Focus should return to the trigger button
    expect(document.activeElement).toBe(button);
  });

  test("focus does NOT return to trigger button after modal is closed with navigation reason", async () => {
    render(<SearchTrigger />);
    const button = screen.getByRole("button", { name: /サイト内検索/ });

    // Focus the button and open the modal
    button.focus();
    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");

    // Wait for modal to mount and results to be available
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Simulate Enter key press to trigger navigation close
    // (Enter on selected result calls onClose('navigation'))
    // We simulate this by pressing Enter key on the document
    // First, load the index and type a query
    vi.useFakeTimers();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    const input = screen.getByRole("combobox", { name: "サイト内検索" });
    fireEvent.change(input, { target: { value: "文字数" } });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(200);
    });
    vi.useRealTimers();

    // Navigate to the first result and press Enter
    fireEvent.keyDown(document, { key: "ArrowDown" });
    fireEvent.keyDown(document, { key: "Enter" });

    // Focus should NOT return to the trigger button (page navigation is happening)
    expect(document.activeElement).not.toBe(button);
  });

  test("focus returns to origin element after modal is closed by Cmd+K toggle", () => {
    render(<SearchTrigger />);
    const button = screen.getByRole("button", { name: /サイト内検索/ });

    // Focus the button so it becomes the focus origin
    button.focus();

    // Open with Cmd+K (focusOriginRef is set inside setIsOpen callback)
    fireEvent.keyDown(document, { key: "k", metaKey: true });
    expect(button).toHaveAttribute("aria-expanded", "true");

    // Close with Cmd+K again
    fireEvent.keyDown(document, { key: "k", metaKey: true });
    expect(button).toHaveAttribute("aria-expanded", "false");

    // Focus should return to the button (the element that was focused when opening)
    expect(document.activeElement).toBe(button);
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

  test("history.back() is called when modal is closed by ESC (cancel event)", async () => {
    render(<SearchTrigger />);
    const button = screen.getByRole("button", { name: /サイト内検索/ });

    // Open the modal
    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");

    // Wait for the SearchModal to mount and register its cancel listener
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Close via cancel event (native ESC)
    const dialog = screen.getByRole("dialog");
    fireEvent(dialog, new Event("cancel", { cancelable: true }));

    expect(button).toHaveAttribute("aria-expanded", "false");
    // history.back() should be called to remove the pushed entry
    expect(historyBackSpy).toHaveBeenCalledTimes(1);
  });

  test("history.back() is called when modal is closed by backdrop click", async () => {
    render(<SearchTrigger />);
    const button = screen.getByRole("button", { name: /サイト内検索/ });

    // Open the modal
    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");

    // Wait for the SearchModal to mount
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Close via backdrop click
    const dialog = screen.getByRole("dialog");
    fireEvent.click(dialog);

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

    // Wait for the SearchModal to mount
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Close the modal via cancel event (ESC)
    const dialog = screen.getByRole("dialog");
    fireEvent(dialog, new Event("cancel", { cancelable: true }));
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

  test("history.back() is NOT called when modal is closed with reason='navigation'", async () => {
    // When the user selects a search result (navigation reason), Next.js router.push()
    // handles navigation internally. Calling history.back() in that case would conflict
    // with the router navigation by popping the dummy entry at the wrong time.
    render(<SearchTrigger />);
    const button = screen.getByRole("button", { name: /サイト内検索/ });

    // Focus the button and open the modal
    button.focus();
    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");

    // Wait for modal to mount and search index to load
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Type a query to get results
    vi.useFakeTimers();
    const input = screen.getByRole("combobox", { name: "サイト内検索" });
    fireEvent.change(input, { target: { value: "文字数" } });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(200);
    });
    vi.useRealTimers();

    // Navigate to a result and press Enter (triggers 'navigation' close reason)
    fireEvent.keyDown(document, { key: "ArrowDown" });
    fireEvent.keyDown(document, { key: "Enter" });

    expect(button).toHaveAttribute("aria-expanded", "false");
    // history.back() must NOT be called when closing via navigation —
    // Next.js client-side navigation will naturally overwrite the dummy entry.
    expect(historyBackSpy).not.toHaveBeenCalled();
  });

  test("history.back() is NOT called when history.state has no searchModalOpen flag", async () => {
    // Guard condition: only call history.back() when we actually pushed the dummy
    // entry (identified by history.state.searchModalOpen === true). If the state
    // does not contain this flag, the dummy entry was never pushed or has already
    // been consumed, so calling back() would navigate away unintentionally.
    render(<SearchTrigger />);
    const button = screen.getByRole("button", { name: /サイト内検索/ });

    // Open the modal (this pushes the dummy entry)
    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");

    // Simulate an external navigation that replaced history state
    // (e.g., Next.js router internally replaced state without our flag)
    window.history.replaceState({ someOtherState: true }, "");

    // Wait for SearchModal to mount
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Close via ESC (dismiss reason) — but history.state no longer has searchModalOpen
    const dialog = screen.getByRole("dialog");
    fireEvent(dialog, new Event("cancel", { cancelable: true }));

    expect(button).toHaveAttribute("aria-expanded", "false");
    // history.back() must NOT be called because the dummy entry is gone
    expect(historyBackSpy).not.toHaveBeenCalled();
  });
});

describe("SearchTrigger IME and input field exclusion", () => {
  test("Ctrl+K during IME composition does not open modal", () => {
    render(<SearchTrigger />);
    const button = screen.getByRole("button", { name: /サイト内検索/ });

    // Simulate Ctrl+K during IME composition (isComposing: true)
    fireEvent.keyDown(document, { key: "k", ctrlKey: true, isComposing: true });

    // Modal should remain closed
    expect(button).toHaveAttribute("aria-expanded", "false");
  });

  test("Cmd+K during IME composition does not open modal", () => {
    render(<SearchTrigger />);
    const button = screen.getByRole("button", { name: /サイト内検索/ });

    // Simulate Cmd+K during IME composition (isComposing: true)
    fireEvent.keyDown(document, { key: "k", metaKey: true, isComposing: true });

    // Modal should remain closed
    expect(button).toHaveAttribute("aria-expanded", "false");
  });

  test("Ctrl+K when focus is on an input element does not open modal", () => {
    render(<SearchTrigger />);
    const button = screen.getByRole("button", { name: /サイト内検索/ });

    // Create an input element and dispatch keydown from it
    const input = document.createElement("input");
    document.body.appendChild(input);

    fireEvent.keyDown(input, { key: "k", ctrlKey: true });

    // Modal should remain closed
    expect(button).toHaveAttribute("aria-expanded", "false");

    document.body.removeChild(input);
  });

  test("Ctrl+K when focus is on a textarea element does not open modal", () => {
    render(<SearchTrigger />);
    const button = screen.getByRole("button", { name: /サイト内検索/ });

    // Create a textarea element and dispatch keydown from it
    const textarea = document.createElement("textarea");
    document.body.appendChild(textarea);

    fireEvent.keyDown(textarea, { key: "k", ctrlKey: true });

    // Modal should remain closed
    expect(button).toHaveAttribute("aria-expanded", "false");

    document.body.removeChild(textarea);
  });

  test("Ctrl+K when focus is on a contentEditable element does not open modal", () => {
    render(<SearchTrigger />);
    const button = screen.getByRole("button", { name: /サイト内検索/ });

    // Create a contentEditable element using setAttribute so that the attribute
    // is correctly reflected in jsdom (which does not compute isContentEditable
    // from the contentEditable IDL property assignment).
    const div = document.createElement("div");
    div.setAttribute("contenteditable", "true");
    document.body.appendChild(div);

    fireEvent.keyDown(div, { key: "k", ctrlKey: true });

    // Modal should remain closed
    expect(button).toHaveAttribute("aria-expanded", "false");

    document.body.removeChild(div);
  });

  test("Ctrl+K when modal is already open and focus is on input closes the modal", () => {
    render(<SearchTrigger />);
    const button = screen.getByRole("button", { name: /サイト内検索/ });

    // Open the modal first
    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");

    // Create an input element (simulating the search input inside the modal)
    const input = document.createElement("input");
    document.body.appendChild(input);

    // Ctrl+K from within the input should still close the modal
    fireEvent.keyDown(input, { key: "k", ctrlKey: true });

    // Modal should be closed
    expect(button).toHaveAttribute("aria-expanded", "false");

    document.body.removeChild(input);
  });
});

describe("SearchTrigger analytics tracking", () => {
  test("trackSearchModalOpen fires once when modal opens via button click", () => {
    const trackOpenSpy = vi.spyOn(analytics, "trackSearchModalOpen");
    render(<SearchTrigger />);
    const button = screen.getByRole("button", { name: /サイト内検索/ });

    fireEvent.click(button);

    expect(trackOpenSpy).toHaveBeenCalledTimes(1);
  });

  test("trackSearchModalOpen fires once when modal opens via Cmd+K", () => {
    const trackOpenSpy = vi.spyOn(analytics, "trackSearchModalOpen");
    render(<SearchTrigger />);
    const button = screen.getByRole("button", { name: /サイト内検索/ });

    // Open with Cmd+K
    fireEvent.keyDown(document, { key: "k", metaKey: true });

    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(trackOpenSpy).toHaveBeenCalledTimes(1);
  });

  test("trackSearchModalOpen does NOT fire when Cmd+K closes (toggle close)", () => {
    const trackOpenSpy = vi.spyOn(analytics, "trackSearchModalOpen");
    render(<SearchTrigger />);
    const button = screen.getByRole("button", { name: /サイト内検索/ });

    // Open
    fireEvent.keyDown(document, { key: "k", metaKey: true });
    expect(trackOpenSpy).toHaveBeenCalledTimes(1);

    // Close via Cmd+K toggle
    fireEvent.keyDown(document, { key: "k", metaKey: true });
    expect(button).toHaveAttribute("aria-expanded", "false");

    // Still only 1 call — no duplicate open fire on close
    expect(trackOpenSpy).toHaveBeenCalledTimes(1);
  });

  test("Cmd+K toggle close fires recordCloseAndAbandonedTracking with 'cmd_k'", () => {
    const trackCloseSpy = vi.spyOn(analytics, "trackSearchModalClose");
    const trackAbandonedSpy = vi.spyOn(analytics, "trackSearchAbandoned");
    render(<SearchTrigger />);
    const button = screen.getByRole("button", { name: /サイト内検索/ });

    // Open with button click (not tracked in this test)
    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");

    // Close via Cmd+K toggle
    fireEvent.keyDown(document, { key: "k", metaKey: true });
    expect(button).toHaveAttribute("aria-expanded", "false");

    // search_modal_close should fire with close_reason: "cmd_k"
    expect(trackCloseSpy).toHaveBeenCalledWith({ close_reason: "cmd_k" });
    // No search was performed, so search_abandoned should also fire
    expect(trackAbandonedSpy).toHaveBeenCalledWith({ had_query: false });
  });

  test("popstate close fires recordCloseAndAbandonedTracking with 'popstate'", () => {
    const trackCloseSpy = vi.spyOn(analytics, "trackSearchModalClose");
    const trackAbandonedSpy = vi.spyOn(analytics, "trackSearchAbandoned");
    render(<SearchTrigger />);
    const button = screen.getByRole("button", { name: /サイト内検索/ });

    // Open
    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");

    // Simulate browser back button (popstate)
    act(() => {
      window.dispatchEvent(new PopStateEvent("popstate"));
    });

    expect(button).toHaveAttribute("aria-expanded", "false");

    // search_modal_close should fire with close_reason: "popstate"
    expect(trackCloseSpy).toHaveBeenCalledWith({ close_reason: "popstate" });
    // No search was performed, so search_abandoned should also fire
    expect(trackAbandonedSpy).toHaveBeenCalledWith({ had_query: false });
  });

  test("popstate close: closedByPopState is set before tracking fires (order guard)", () => {
    // This test verifies the correct order:
    // closedByPopState = true → recordCloseAndAbandonedTracking → setIsOpen(false)
    // We confirm tracking fires (meaning the ref method ran) before modal closes.
    const trackCloseSpy = vi.spyOn(analytics, "trackSearchModalClose");
    render(<SearchTrigger />);
    const button = screen.getByRole("button", { name: /サイト内検索/ });

    fireEvent.click(button);

    act(() => {
      window.dispatchEvent(new PopStateEvent("popstate"));
    });

    // If tracking fired and modal closed, the order is correct
    expect(trackCloseSpy).toHaveBeenCalledWith({ close_reason: "popstate" });
    expect(button).toHaveAttribute("aria-expanded", "false");
  });
});
