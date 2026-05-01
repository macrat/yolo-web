import { describe, expect, test, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, within, act } from "@testing-library/react";
import SearchModal from "../SearchModal";

// jsdom does not implement scrollIntoView
Element.prototype.scrollIntoView = vi.fn();

// jsdom does not implement HTMLDialogElement.showModal / close.
// We mock them to simulate the native dialog behavior so that tests can
// verify that the modal opens/closes correctly via the dialog API.
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
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
}));

// Mock documents that Fuse.js can search through
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
  {
    id: "game:kanji-kanaru",
    type: "game",
    title: "漢字カナール",
    description: "漢字を当てるパズルゲーム",
    keywords: ["漢字", "パズル"],
    url: "/play/kanji-kanaru",
    extra: "初級〜中級",
  },
  {
    id: "blog:test-post",
    type: "blog",
    title: "テスト記事",
    description: "テスト用のブログ記事です",
    keywords: ["テスト"],
    url: "/blog/test-post",
    category: "technical",
  },
];

// window.gtag stub — required because SearchModal now calls tracking functions.
// Without this, tests would throw "window.gtag is not a function".
const mockGtag = vi.fn();

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockDocuments,
    }),
  );
  mockPush.mockClear();
  // Stub window.gtag so GA4 tracking calls are captured without side effects
  vi.stubGlobal("gtag", mockGtag);
  mockGtag.mockClear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("SearchModal", () => {
  test("does not render visible dialog when isOpen is false", () => {
    render(<SearchModal isOpen={false} onClose={vi.fn()} />);
    // <dialog> is always in DOM but showModal() should not have been called
    const dialog = screen.getByRole("dialog", { hidden: true });
    expect(dialog).not.toHaveAttribute("open");
  });

  test("calls showModal() when isOpen is true", () => {
    render(<SearchModal isOpen={true} onClose={vi.fn()} />);
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalledTimes(1);
  });

  test("renders modal content when isOpen is true", () => {
    render(<SearchModal isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  test("has correct aria attributes", () => {
    render(<SearchModal isOpen={true} onClose={vi.fn()} />);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-label", "サイト内検索");
  });

  test("calls onClose with 'dismiss' reason when cancel event fires (ESC key)", () => {
    const onClose = vi.fn();
    render(<SearchModal isOpen={true} onClose={onClose} />);
    const dialog = screen.getByRole("dialog");
    // Dispatch a cancel event to simulate native ESC handling by <dialog>
    fireEvent(dialog, new Event("cancel", { cancelable: true }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledWith("dismiss");
  });

  test("calls onClose with 'dismiss' reason when backdrop (dialog element itself) is clicked", () => {
    const onClose = vi.fn();
    render(<SearchModal isOpen={true} onClose={onClose} />);
    const dialog = screen.getByRole("dialog");
    // Simulate backdrop click: the click target is the dialog element itself
    fireEvent.click(dialog);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledWith("dismiss");
  });

  test("does not call onClose when clicking inside the modal content", () => {
    const onClose = vi.fn();
    render(<SearchModal isOpen={true} onClose={onClose} />);
    // Click on the search input (inside modal content), not the dialog element itself
    const input = screen.getByRole("combobox", { name: "サイト内検索" });
    fireEvent.click(input);
    expect(onClose).not.toHaveBeenCalled();
  });

  test("renders search input with correct aria-label", () => {
    render(<SearchModal isOpen={true} onClose={vi.fn()} />);
    expect(
      screen.getByRole("combobox", { name: "サイト内検索" }),
    ).toBeInTheDocument();
  });

  test("shows hint text when no query is entered", () => {
    render(<SearchModal isOpen={true} onClose={vi.fn()} />);
    expect(
      screen.getByText(
        "ツール、ゲーム、辞典など、サイト内のコンテンツを検索できます",
      ),
    ).toBeInTheDocument();
  });

  test("locks body scroll when open", () => {
    render(<SearchModal isOpen={true} onClose={vi.fn()} />);
    expect(document.body.style.overflow).toBe("hidden");
  });

  test("unlocks body scroll when closed", () => {
    const { rerender } = render(
      <SearchModal isOpen={true} onClose={vi.fn()} />,
    );
    expect(document.body.style.overflow).toBe("hidden");
    rerender(<SearchModal isOpen={false} onClose={vi.fn()} />);
    expect(document.body.style.overflow).toBe("");
  });
});

describe("SearchModal close button", () => {
  test("renders a close button with aria-label='検索を閉じる'", () => {
    render(<SearchModal isOpen={true} onClose={vi.fn()} />);
    const closeButton = screen.getByRole("button", { name: "検索を閉じる" });
    expect(closeButton).toBeInTheDocument();
  });

  test("calls onClose with 'dismiss' reason when close button is clicked", () => {
    const onClose = vi.fn();
    render(<SearchModal isOpen={true} onClose={onClose} />);
    const closeButton = screen.getByRole("button", { name: "検索を閉じる" });
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledWith("dismiss");
  });
});

describe("SearchModal keyboard navigation", () => {
  /**
   * Helper: render the modal, wait for index to load, type a query,
   * and wait for search results to appear.
   */
  async function setupWithResults() {
    vi.useFakeTimers();
    const onClose = vi.fn();
    render(<SearchModal isOpen={true} onClose={onClose} />);

    // Wait for loadIndex (async fetch) to resolve
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    // Type a query that matches the mock data
    const input = screen.getByRole("combobox", { name: "サイト内検索" });
    fireEvent.change(input, { target: { value: "漢字" } });

    // Advance debounce timer to trigger search
    await act(async () => {
      await vi.advanceTimersByTimeAsync(200);
    });

    vi.useRealTimers();

    return { onClose, input };
  }

  test("ArrowDown moves active index to first result", async () => {
    await setupWithResults();

    // Verify results are rendered
    const listbox = screen.getByRole("listbox");
    const options = within(listbox).getAllByRole("option");
    expect(options.length).toBeGreaterThan(0);

    // Press ArrowDown
    fireEvent.keyDown(document, { key: "ArrowDown" });

    // The first option should be active (aria-selected=true)
    const updatedOptions = within(screen.getByRole("listbox")).getAllByRole(
      "option",
    );
    expect(updatedOptions[0]).toHaveAttribute("aria-selected", "true");
  });

  test("ArrowDown wraps from last to first result", async () => {
    await setupWithResults();

    const listbox = screen.getByRole("listbox");
    const options = within(listbox).getAllByRole("option");
    const totalOptions = options.length;

    // Press ArrowDown totalOptions times to wrap around
    for (let i = 0; i < totalOptions; i++) {
      fireEvent.keyDown(document, { key: "ArrowDown" });
    }

    // After totalOptions presses, it wraps: should be back at index 0
    const updatedOptions = within(screen.getByRole("listbox")).getAllByRole(
      "option",
    );
    expect(updatedOptions[0]).toHaveAttribute("aria-selected", "true");
  });

  test("ArrowUp from first result wraps to last result", async () => {
    await setupWithResults();

    // First press ArrowDown to activate first item (index 0)
    fireEvent.keyDown(document, { key: "ArrowDown" });

    // Then press ArrowUp, which should wrap to last item
    fireEvent.keyDown(document, { key: "ArrowUp" });

    const listbox = screen.getByRole("listbox");
    const options = within(listbox).getAllByRole("option");
    const lastOption = options[options.length - 1];
    expect(lastOption).toHaveAttribute("aria-selected", "true");
  });

  test("ArrowUp moves selection upward", async () => {
    await setupWithResults();

    // Navigate down twice
    fireEvent.keyDown(document, { key: "ArrowDown" });
    fireEvent.keyDown(document, { key: "ArrowDown" });

    // Navigate up once
    fireEvent.keyDown(document, { key: "ArrowUp" });

    // Should be at first item (index 0)
    const listbox = screen.getByRole("listbox");
    const options = within(listbox).getAllByRole("option");
    expect(options[0]).toHaveAttribute("aria-selected", "true");
  });

  test("Enter on active result navigates with router.push and closes modal", async () => {
    const { onClose } = await setupWithResults();

    // Navigate to first result
    fireEvent.keyDown(document, { key: "ArrowDown" });

    // Press Enter
    fireEvent.keyDown(document, { key: "Enter" });

    // Should call onClose with 'navigation' reason
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledWith("navigation");

    // Should use router.push instead of window.location.href
    expect(mockPush).toHaveBeenCalledTimes(1);
    // The URL should be one of the mock document URLs
    expect(mockPush).toHaveBeenCalledWith(expect.stringMatching(/^\//));
  });

  test("Enter without active result does not navigate", async () => {
    const { onClose } = await setupWithResults();

    // Press Enter without selecting any result (activeIndex = -1)
    fireEvent.keyDown(document, { key: "Enter" });

    // Should NOT call onClose or navigate
    expect(onClose).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  test("aria-activedescendant is set on input when result is active", async () => {
    const { input } = await setupWithResults();

    // Initially, no active descendant
    expect(input).not.toHaveAttribute("aria-activedescendant");

    // Navigate to first result
    fireEvent.keyDown(document, { key: "ArrowDown" });

    // Input should have aria-activedescendant pointing to the active option
    expect(input).toHaveAttribute(
      "aria-activedescendant",
      "search-result-option-0",
    );
  });

  test("search results contain <mark> elements for matched text", async () => {
    await setupWithResults();

    // Verify that search results are displayed with highlight marks
    const listbox = screen.getByRole("listbox");
    const marks = listbox.querySelectorAll("mark");
    expect(marks.length).toBeGreaterThan(0);
  });

  test("keyboard navigation does nothing when there are no results", async () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    render(<SearchModal isOpen={true} onClose={onClose} />);

    // Wait for index to load
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    // Type a query that won't match anything
    const input = screen.getByRole("combobox", { name: "サイト内検索" });
    fireEvent.change(input, {
      target: { value: "zzzznonexistent" },
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(200);
    });

    vi.useRealTimers();

    // Press ArrowDown - should not throw or cause issues
    fireEvent.keyDown(document, { key: "ArrowDown" });
    fireEvent.keyDown(document, { key: "ArrowUp" });
    fireEvent.keyDown(document, { key: "Enter" });

    // onClose should not be called (no result to select)
    expect(onClose).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });
});

describe("SearchModal aria-expanded and id", () => {
  test("dialog element has id='search-modal-dialog'", () => {
    render(<SearchModal isOpen={true} onClose={vi.fn()} />);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("id", "search-modal-dialog");
  });

  test("combobox aria-expanded is false when no query is entered (hint displayed)", () => {
    render(<SearchModal isOpen={true} onClose={vi.fn()} />);
    const combobox = screen.getByRole("combobox", { name: "サイト内検索" });
    expect(combobox).toHaveAttribute("aria-expanded", "false");
  });

  test("combobox aria-expanded is true when search results are present", async () => {
    vi.useFakeTimers();
    render(<SearchModal isOpen={true} onClose={vi.fn()} />);

    // Wait for loadIndex (async fetch) to resolve
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    // Type a query that matches the mock data
    const input = screen.getByRole("combobox", { name: "サイト内検索" });
    fireEvent.change(input, { target: { value: "漢字" } });

    // Advance debounce timer to trigger search
    await act(async () => {
      await vi.advanceTimersByTimeAsync(200);
    });

    vi.useRealTimers();

    // Verify listbox is shown and combobox reports expanded
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(input).toHaveAttribute("aria-expanded", "true");
  });

  test("combobox aria-expanded is false when search results are empty", async () => {
    vi.useFakeTimers();
    render(<SearchModal isOpen={true} onClose={vi.fn()} />);

    // Wait for loadIndex (async fetch) to resolve
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    // Type a query that won't match anything
    const input = screen.getByRole("combobox", { name: "サイト内検索" });
    fireEvent.change(input, { target: { value: "zzzznonexistent" } });

    // Advance debounce timer to trigger search
    await act(async () => {
      await vi.advanceTimersByTimeAsync(200);
    });

    vi.useRealTimers();

    // Verify no listbox is shown and combobox reports not expanded
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(input).toHaveAttribute("aria-expanded", "false");
  });
});

// ── §3-3 Tracking tests ───────────────────────────────────────────────────────
// These tests verify that handleClose fires tracking events in the correct order
// and with the correct parameters.

describe("SearchModal tracking: close_reason values", () => {
  test("fires search_modal_close with close_reason='escape' when cancel event fires (ESC key)", () => {
    render(<SearchModal isOpen={true} onClose={vi.fn()} />);
    const dialog = screen.getByRole("dialog");
    fireEvent(dialog, new Event("cancel", { cancelable: true }));
    expect(mockGtag).toHaveBeenCalledWith(
      "event",
      "search_modal_close",
      expect.objectContaining({ close_reason: "escape" }),
    );
  });

  test("fires search_modal_close with close_reason='backdrop' when backdrop is clicked", () => {
    render(<SearchModal isOpen={true} onClose={vi.fn()} />);
    const dialog = screen.getByRole("dialog");
    fireEvent.click(dialog);
    expect(mockGtag).toHaveBeenCalledWith(
      "event",
      "search_modal_close",
      expect.objectContaining({ close_reason: "backdrop" }),
    );
  });

  test("fires search_modal_close with close_reason='close_button' when close button is clicked", () => {
    render(<SearchModal isOpen={true} onClose={vi.fn()} />);
    const closeButton = screen.getByRole("button", { name: "検索を閉じる" });
    fireEvent.click(closeButton);
    expect(mockGtag).toHaveBeenCalledWith(
      "event",
      "search_modal_close",
      expect.objectContaining({ close_reason: "close_button" }),
    );
  });

  test("fires search_modal_close with close_reason='navigation' when Enter selects a result", async () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    render(<SearchModal isOpen={true} onClose={onClose} />);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    const input = screen.getByRole("combobox", { name: "サイト内検索" });
    fireEvent.change(input, { target: { value: "漢字" } });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(200);
    });

    vi.useRealTimers();

    fireEvent.keyDown(document, { key: "ArrowDown" });
    fireEvent.keyDown(document, { key: "Enter" });

    expect(mockGtag).toHaveBeenCalledWith(
      "event",
      "search_modal_close",
      expect.objectContaining({ close_reason: "navigation" }),
    );
  });
});

describe("SearchModal tracking: search_abandoned", () => {
  test("fires search_abandoned with had_query=false when modal is closed without any input", () => {
    render(<SearchModal isOpen={true} onClose={vi.fn()} />);
    const dialog = screen.getByRole("dialog");
    fireEvent(dialog, new Event("cancel", { cancelable: true }));
    expect(mockGtag).toHaveBeenCalledWith(
      "event",
      "search_abandoned",
      expect.objectContaining({ had_query: false }),
    );
  });

  test("fires search_abandoned with had_query=true when 1 char is typed then closed before 150ms", () => {
    vi.useFakeTimers();
    render(<SearchModal isOpen={true} onClose={vi.fn()} />);

    const input = screen.getByRole("combobox", { name: "サイト内検索" });
    // Type 1 character but do NOT advance 150ms (debounce not triggered)
    fireEvent.change(input, { target: { value: "あ" } });

    // Close immediately (before debounce fires)
    const dialog = screen.getByRole("dialog");
    fireEvent(dialog, new Event("cancel", { cancelable: true }));

    vi.useRealTimers();

    expect(mockGtag).toHaveBeenCalledWith(
      "event",
      "search_abandoned",
      expect.objectContaining({ had_query: true }),
    );
  });

  test("fires search_abandoned with had_query=true when only whitespace is typed then closed", () => {
    render(<SearchModal isOpen={true} onClose={vi.fn()} />);
    const input = screen.getByRole("combobox", { name: "サイト内検索" });
    // Type whitespace only — q.length > 0 so hadAnyInputRef is set,
    // but q.trim() is empty so trackSearch (and hasSearchedRef) is never set
    fireEvent.change(input, { target: { value: "     " } });

    const closeButton = screen.getByRole("button", { name: "検索を閉じる" });
    fireEvent.click(closeButton);

    expect(mockGtag).toHaveBeenCalledWith(
      "event",
      "search_abandoned",
      expect.objectContaining({ had_query: true }),
    );
  });

  test("does NOT fire search_abandoned when modal is closed after a successful search (150ms elapsed)", async () => {
    vi.useFakeTimers();
    render(<SearchModal isOpen={true} onClose={vi.fn()} />);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    const input = screen.getByRole("combobox", { name: "サイト内検索" });
    fireEvent.change(input, { target: { value: "漢字" } });

    // Advance beyond debounce — trackSearch fires, hasSearchedRef becomes true
    await act(async () => {
      await vi.advanceTimersByTimeAsync(200);
    });

    vi.useRealTimers();

    const closeButton = screen.getByRole("button", { name: "検索を閉じる" });
    fireEvent.click(closeButton);

    const gtagCalls = mockGtag.mock.calls;
    const abandonedCall = gtagCalls.find(
      (call) => call[0] === "event" && call[1] === "search_abandoned",
    );
    expect(abandonedCall).toBeUndefined();
  });
});

describe("SearchModal tracking: handleClose fires in correct order", () => {
  test("fires search_modal_close BEFORE calling onClose", () => {
    const callOrder: string[] = [];
    const onClose = vi.fn(() => {
      callOrder.push("onClose");
    });
    mockGtag.mockImplementation((_type: string, eventName: string) => {
      if (eventName === "search_modal_close") {
        callOrder.push("search_modal_close");
      }
    });

    render(<SearchModal isOpen={true} onClose={onClose} />);
    const dialog = screen.getByRole("dialog");
    fireEvent(dialog, new Event("cancel", { cancelable: true }));

    expect(callOrder.indexOf("search_modal_close")).toBeLessThan(
      callOrder.indexOf("onClose"),
    );
  });
});

// ── §3-5 search_result_click tracking tests ──────────────────────────────────
// These tests verify that clicking a result or pressing Enter to select a result
// fires trackSearchResultClick with the correct search_term and result_url.

/**
 * Helper: render modal, wait for index, type a query, advance debounce.
 * Returns the onClose mock and the search input element.
 */
async function setupWithResultsForTracking() {
  vi.useFakeTimers();
  const onClose = vi.fn();
  render(<SearchModal isOpen={true} onClose={onClose} />);

  await act(async () => {
    await vi.advanceTimersByTimeAsync(0);
  });

  const input = screen.getByRole("combobox", { name: "サイト内検索" });
  fireEvent.change(input, { target: { value: "漢字" } });

  await act(async () => {
    await vi.advanceTimersByTimeAsync(200);
  });

  vi.useRealTimers();

  return { onClose, input };
}

describe("SearchModal tracking: search_result_click", () => {
  test("fires search_result_click with search_term and result_url when a result link is clicked", async () => {
    await setupWithResultsForTracking();

    const listbox = screen.getByRole("listbox");
    const options = within(listbox).getAllByRole("option");
    // Click the first result
    fireEvent.click(options[0]);

    expect(mockGtag).toHaveBeenCalledWith(
      "event",
      "search_result_click",
      expect.objectContaining({
        search_term: "漢字",
        result_url: expect.stringMatching(/^\//),
      }),
    );
  });

  test("fires search_result_click with correct result_url (site-internal path) when a result is clicked", async () => {
    await setupWithResultsForTracking();

    const listbox = screen.getByRole("listbox");
    const options = within(listbox).getAllByRole("option");
    fireEvent.click(options[0]);

    const resultClickCall = mockGtag.mock.calls.find(
      (call) => call[0] === "event" && call[1] === "search_result_click",
    );
    expect(resultClickCall).toBeDefined();
    // result_url must be a site-internal path starting with /
    expect(resultClickCall![2].result_url).toMatch(/^\//);
    // result_url must NOT contain the origin (no http/https)
    expect(resultClickCall![2].result_url).not.toMatch(/^https?:\/\//);
  });

  test("fires search_result_click when Enter key selects a result", async () => {
    await setupWithResultsForTracking();

    // Navigate to first result with ArrowDown, then select with Enter
    fireEvent.keyDown(document, { key: "ArrowDown" });
    fireEvent.keyDown(document, { key: "Enter" });

    expect(mockGtag).toHaveBeenCalledWith(
      "event",
      "search_result_click",
      expect.objectContaining({
        search_term: "漢字",
        result_url: expect.stringMatching(/^\//),
      }),
    );
  });

  test("fires search_result_click BEFORE search_modal_close when Enter selects a result", async () => {
    await setupWithResultsForTracking();

    const callOrder: string[] = [];
    mockGtag.mockImplementation((_type: string, eventName: string) => {
      if (
        eventName === "search_result_click" ||
        eventName === "search_modal_close"
      ) {
        callOrder.push(eventName);
      }
    });

    fireEvent.keyDown(document, { key: "ArrowDown" });
    fireEvent.keyDown(document, { key: "Enter" });

    expect(callOrder.indexOf("search_result_click")).toBeLessThan(
      callOrder.indexOf("search_modal_close"),
    );
  });

  test("fires search_result_click exactly once per click (no duplicate)", async () => {
    await setupWithResultsForTracking();

    const listbox = screen.getByRole("listbox");
    const options = within(listbox).getAllByRole("option");
    fireEvent.click(options[0]);

    const resultClickCalls = mockGtag.mock.calls.filter(
      (call) => call[0] === "event" && call[1] === "search_result_click",
    );
    expect(resultClickCalls).toHaveLength(1);
  });

  test("fires search_result_click exactly once per Enter selection (no duplicate)", async () => {
    await setupWithResultsForTracking();

    fireEvent.keyDown(document, { key: "ArrowDown" });
    fireEvent.keyDown(document, { key: "Enter" });

    const resultClickCalls = mockGtag.mock.calls.filter(
      (call) => call[0] === "event" && call[1] === "search_result_click",
    );
    expect(resultClickCalls).toHaveLength(1);
  });
});
