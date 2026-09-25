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

  it("初期表示: 「おもしろかった」のボタンがあり、切り替えのボタンではないこと", () => {
    render(<EntryRatingButton slug="test-entry" />);
    const button = screen.getByRole("button", { name: "おもしろかった" });
    expect(button).not.toHaveAttribute("aria-pressed");
    expect(screen.getByRole("status")).toHaveTextContent("");
  });

  it("クリック: markAsRated と trackContentRating が呼ばれ、ボタンが消えて送ったことを文で言うこと", () => {
    render(<EntryRatingButton slug="test-entry" />);

    fireEvent.click(screen.getByRole("button", { name: "おもしろかった" }));

    expect(mockMarkAsRated).toHaveBeenCalledTimes(1);
    expect(mockMarkAsRated).toHaveBeenCalledWith("test-entry");
    expect(mockTrackContentRating).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(
      "「おもしろかった」を送りました",
    );
  });

  it("評価済み復元: isRated が true を返す場合、ボタンを出さず送ったことを文で言うこと", async () => {
    mockIsRated.mockReturnValue(true);

    render(<EntryRatingButton slug="already-rated" />);

    await waitFor(() => {
      expect(screen.getByRole("status")).toHaveTextContent(
        "「おもしろかった」を送りました",
      );
    });
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(mockMarkAsRated).not.toHaveBeenCalled();
    expect(mockTrackContentRating).not.toHaveBeenCalled();
  });
});
