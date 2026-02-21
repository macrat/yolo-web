import { describe, expect, test, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, within, act } from "@testing-library/react";
import SearchModal from "../SearchModal";

// jsdom does not implement scrollIntoView
Element.prototype.scrollIntoView = vi.fn();

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
    url: "/games/kanji-kanaru",
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

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockDocuments,
    }),
  );
  mockPush.mockClear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("SearchModal", () => {
  test("does not render when isOpen is false", () => {
    const { container } = render(
      <SearchModal isOpen={false} onClose={vi.fn()} />,
    );
    expect(container.innerHTML).toBe("");
  });

  test("renders modal when isOpen is true", () => {
    render(<SearchModal isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  test("has correct aria attributes", () => {
    render(<SearchModal isOpen={true} onClose={vi.fn()} />);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-label", "サイト内検索");
  });

  test("calls onClose when ESC is pressed", () => {
    const onClose = vi.fn();
    render(<SearchModal isOpen={true} onClose={onClose} />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("calls onClose when overlay is clicked", () => {
    const onClose = vi.fn();
    render(<SearchModal isOpen={true} onClose={onClose} />);
    const overlay = screen.getByTestId("search-overlay");
    fireEvent.click(overlay);
    expect(onClose).toHaveBeenCalledTimes(1);
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

    // Should call onClose
    expect(onClose).toHaveBeenCalledTimes(1);

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
