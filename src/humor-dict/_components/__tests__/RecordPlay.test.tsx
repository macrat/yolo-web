import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import RecordPlay from "../RecordPlay";

const mockRecordPlay = vi.fn();

vi.mock("@/lib/achievements/useAchievements", () => ({
  useAchievements: () => ({
    store: null,
    recordPlay: mockRecordPlay,
    newlyUnlocked: [],
    dismissNotifications: vi.fn(),
  }),
}));

describe("RecordPlay (humor-dict)", () => {
  beforeEach(() => {
    mockRecordPlay.mockClear();
  });

  it("calls recordPlay with 'humor-dictionary' on mount", () => {
    render(<RecordPlay />);
    expect(mockRecordPlay).toHaveBeenCalledTimes(1);
    expect(mockRecordPlay).toHaveBeenCalledWith("humor-dictionary");
  });

  it("renders nothing visible", () => {
    const { container } = render(<RecordPlay />);
    expect(container.firstChild).toBeNull();
  });

  it("does not call recordPlay more than once on re-render", () => {
    const { rerender } = render(<RecordPlay />);
    rerender(<RecordPlay />);
    expect(mockRecordPlay).toHaveBeenCalledTimes(1);
  });
});
