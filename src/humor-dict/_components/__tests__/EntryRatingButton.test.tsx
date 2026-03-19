import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import EntryRatingButton from "../EntryRatingButton";

const mockIsRated = vi.fn();
const mockMarkAsRated = vi.fn();
const mockTrackContentRating = vi.fn();

vi.mock("@/humor-dict/_lib/rating-storage", () => ({
  isRated: (...args: unknown[]) => mockIsRated(...args),
  markAsRated: (...args: unknown[]) => mockMarkAsRated(...args),
}));

vi.mock("@/lib/analytics", () => ({
  trackContentRating: () => mockTrackContentRating(),
}));

describe("EntryRatingButton", () => {
  beforeEach(() => {
    mockIsRated.mockReset();
    mockMarkAsRated.mockReset();
    mockTrackContentRating.mockReset();
    // Default: not yet rated
    mockIsRated.mockReturnValue(false);
  });

  it("初期表示: ボタンが表示され、aria-pressed が false であること", () => {
    render(<EntryRatingButton slug="test-entry" />);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("aria-pressed", "false");
    expect(button).toHaveTextContent("おもしろかった");
  });

  it("クリック: markAsRated と trackContentRating が呼ばれ、aria-pressed が true になること", async () => {
    render(<EntryRatingButton slug="test-entry" />);
    const button = screen.getByRole("button");

    fireEvent.click(button);

    expect(mockMarkAsRated).toHaveBeenCalledTimes(1);
    expect(mockMarkAsRated).toHaveBeenCalledWith("test-entry");
    expect(mockTrackContentRating).toHaveBeenCalledTimes(1);
    expect(button).toHaveAttribute("aria-pressed", "true");
  });

  it("クリック後: ボタンのテキストが『おもしろかった!』に変わること", () => {
    render(<EntryRatingButton slug="test-entry" />);
    const button = screen.getByRole("button");

    fireEvent.click(button);

    expect(button).toHaveTextContent("おもしろかった!");
  });

  it("評価済み復元: isRated が true を返す場合、useEffect 後に aria-pressed が true になること", async () => {
    mockIsRated.mockReturnValue(true);

    render(<EntryRatingButton slug="already-rated" />);

    await waitFor(() => {
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-pressed", "true");
    });
  });

  it("二重クリック防止: 評価済み状態でクリックしても markAsRated が追加で呼ばれないこと", () => {
    render(<EntryRatingButton slug="test-entry" />);
    const button = screen.getByRole("button");

    // 1回目のクリックで評価済みになる
    fireEvent.click(button);
    expect(mockMarkAsRated).toHaveBeenCalledTimes(1);

    // 2回目のクリックでは呼ばれない
    fireEvent.click(button);
    expect(mockMarkAsRated).toHaveBeenCalledTimes(1);
    expect(mockTrackContentRating).toHaveBeenCalledTimes(1);
  });

  it("二重クリック防止: isRated が true の初期状態でクリックしても markAsRated が呼ばれないこと", async () => {
    mockIsRated.mockReturnValue(true);

    render(<EntryRatingButton slug="already-rated" />);

    // useEffect で rated = true になるのを待つ
    await waitFor(() => {
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-pressed", "true");
    });

    fireEvent.click(screen.getByRole("button"));

    expect(mockMarkAsRated).not.toHaveBeenCalled();
    expect(mockTrackContentRating).not.toHaveBeenCalled();
  });
});
