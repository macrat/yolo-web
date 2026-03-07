import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import AchievementToast from "../AchievementToast";

// Mock state for useAchievements
const mockNewlyUnlocked: { current: string[] } = { current: [] };
const mockDismissNotifications = vi.fn();

vi.mock("../useAchievements", () => ({
  useAchievements: () => ({
    store: null,
    recordPlay: vi.fn(),
    newlyUnlocked: mockNewlyUnlocked.current,
    dismissNotifications: mockDismissNotifications,
  }),
}));

describe("AchievementToast", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockNewlyUnlocked.current = [];
    mockDismissNotifications.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders nothing when no badges are unlocked", () => {
    const { container } = render(<AchievementToast />);
    expect(container.querySelector("[role='status']")).toBeNull();
  });

  it("displays a toast when a badge is unlocked", () => {
    mockNewlyUnlocked.current = ["first-use"];
    render(<AchievementToast />);
    expect(screen.getByText("はじめの一歩")).toBeInTheDocument();
    expect(screen.getByText("初めて1コンテンツ利用")).toBeInTheDocument();
  });

  it("shows the correct rank icon for bronze badge", () => {
    mockNewlyUnlocked.current = ["first-use"];
    render(<AchievementToast />);
    expect(screen.getByText("\uD83E\uDD49")).toBeInTheDocument();
  });

  it("shows the correct rank icon for silver badge", () => {
    mockNewlyUnlocked.current = ["all-once"];
    render(<AchievementToast />);
    expect(screen.getByText("\uD83E\uDD48")).toBeInTheDocument();
  });

  it("shows the correct rank icon for gold badge", () => {
    mockNewlyUnlocked.current = ["all-ten"];
    render(<AchievementToast />);
    expect(screen.getByText("\uD83C\uDFC6")).toBeInTheDocument();
  });

  it("calls dismissNotifications when badges are queued", () => {
    mockNewlyUnlocked.current = ["first-use"];
    render(<AchievementToast />);
    expect(mockDismissNotifications).toHaveBeenCalled();
  });

  it("auto-dismisses after 4 seconds", () => {
    mockNewlyUnlocked.current = ["first-use"];
    render(<AchievementToast />);
    expect(screen.getByText("はじめの一歩")).toBeInTheDocument();

    // Advance past auto-dismiss timer (4000ms) + exit animation (300ms)
    act(() => {
      vi.advanceTimersByTime(4300);
    });

    expect(screen.queryByText("はじめの一歩")).toBeNull();
  });

  it("dismisses on click", () => {
    mockNewlyUnlocked.current = ["first-use"];
    render(<AchievementToast />);

    const toast = screen.getByRole("status");
    act(() => {
      fireEvent.click(toast);
    });

    // After exit animation (300ms)
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.queryByText("はじめの一歩")).toBeNull();
  });

  it("has aria-live=polite for accessibility", () => {
    mockNewlyUnlocked.current = ["first-use"];
    const { container } = render(<AchievementToast />);
    const liveRegion = container.querySelector("[aria-live='polite']");
    expect(liveRegion).toBeInTheDocument();
  });

  it("shows the label text for achievement unlock", () => {
    mockNewlyUnlocked.current = ["first-use"];
    render(<AchievementToast />);
    expect(screen.getByText("実績解除")).toBeInTheDocument();
  });

  it("processes queue: shows second badge after first is dismissed", () => {
    mockNewlyUnlocked.current = ["first-use", "streak-3"];
    render(<AchievementToast />);

    // First badge is displayed
    expect(screen.getByText("はじめの一歩")).toBeInTheDocument();

    // Auto-dismiss first badge (4000ms dismiss + 300ms exit animation)
    act(() => {
      vi.advanceTimersByTime(4300);
    });

    // Second badge should now be displayed
    expect(screen.getByText("三日坊主卒業")).toBeInTheDocument();
  });

  it("ignores unknown badge IDs gracefully", () => {
    mockNewlyUnlocked.current = ["unknown-badge-id"];
    const { container } = render(<AchievementToast />);
    // Should render nothing since badge is not found
    expect(container.querySelector("[role='status']")).toBeNull();
  });

  it("is keyboard accessible with Enter key", () => {
    mockNewlyUnlocked.current = ["first-use"];
    render(<AchievementToast />);

    const toast = screen.getByRole("status");
    act(() => {
      fireEvent.keyDown(toast, { key: "Enter" });
    });

    // After exit animation
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.queryByText("はじめの一歩")).toBeNull();
  });

  it("is keyboard accessible with Space key", () => {
    mockNewlyUnlocked.current = ["streak-3"];
    render(<AchievementToast />);

    const toast = screen.getByRole("status");
    act(() => {
      fireEvent.keyDown(toast, { key: " " });
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.queryByText("三日坊主卒業")).toBeNull();
  });
});
