import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import GameShareButtons from "../GameShareButtons";

// Mock the web share hook
const mockUseCanWebShare = vi.fn(() => false);
vi.mock("@/lib/webShare", () => ({
  useCanWebShare: () => mockUseCanWebShare(),
  shareGameResult: vi.fn().mockResolvedValue(true),
}));

// Mock the shared share utilities
vi.mock("@/games/shared/_lib/share", () => ({
  copyToClipboard: vi.fn().mockResolvedValue(true),
  generateTwitterShareUrl: vi.fn(
    (text: string) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
  ),
}));

describe("GameShareButtons", () => {
  beforeEach(() => {
    mockUseCanWebShare.mockReturnValue(false);
  });

  it("should render copy and X share buttons when Web Share is not available", () => {
    render(
      <GameShareButtons
        shareText="test result"
        gameTitle="Test Game"
        gameSlug="test-game"
      />,
    );

    expect(
      screen.getByText("\u7D50\u679C\u3092\u30B3\u30D4\u30FC"),
    ).toBeDefined();
    expect(screen.getByText(/X/)).toBeDefined();
  });

  it("should render single share button when Web Share is available", () => {
    mockUseCanWebShare.mockReturnValue(true);

    render(
      <GameShareButtons
        shareText="test result"
        gameTitle="Test Game"
        gameSlug="test-game"
      />,
    );

    expect(screen.getByText("\u30B7\u30A7\u30A2")).toBeDefined();
    expect(
      screen.queryByText("\u7D50\u679C\u3092\u30B3\u30D4\u30FC"),
    ).toBeNull();
  });

  it("should render save image button when onSaveImage is provided", () => {
    render(
      <GameShareButtons
        shareText="test result"
        gameTitle="Test Game"
        gameSlug="test-game"
        onSaveImage={() => {}}
      />,
    );

    expect(screen.getByText("\u753B\u50CF\u3092\u4FDD\u5B58")).toBeDefined();
  });

  it("should NOT render save image button when onSaveImage is not provided", () => {
    render(
      <GameShareButtons
        shareText="test result"
        gameTitle="Test Game"
        gameSlug="test-game"
      />,
    );

    expect(screen.queryByText("\u753B\u50CF\u3092\u4FDD\u5B58")).toBeNull();
  });

  it("should call onSaveImage when save image button is clicked", () => {
    const onSaveImage = vi.fn();

    render(
      <GameShareButtons
        shareText="test result"
        gameTitle="Test Game"
        gameSlug="test-game"
        onSaveImage={onSaveImage}
      />,
    );

    fireEvent.click(screen.getByText("\u753B\u50CF\u3092\u4FDD\u5B58"));
    expect(onSaveImage).toHaveBeenCalledTimes(1);
  });

  it("should show copied feedback after clicking copy button", async () => {
    render(
      <GameShareButtons
        shareText="test result"
        gameTitle="Test Game"
        gameSlug="test-game"
      />,
    );

    fireEvent.click(screen.getByText("\u7D50\u679C\u3092\u30B3\u30D4\u30FC"));

    // The "copied" message should appear (async state update)
    await waitFor(() => {
      expect(
        screen.getByText("\u30B3\u30D4\u30FC\u3057\u307E\u3057\u305F!"),
      ).toBeDefined();
    });
  });

  it("should have a status region for the copied message", () => {
    const { container } = render(
      <GameShareButtons
        shareText="test result"
        gameTitle="Test Game"
        gameSlug="test-game"
      />,
    );

    const statusRegion = container.querySelector('[role="status"]');
    expect(statusRegion).toBeDefined();
    expect(statusRegion?.getAttribute("aria-live")).toBe("polite");
  });
});
