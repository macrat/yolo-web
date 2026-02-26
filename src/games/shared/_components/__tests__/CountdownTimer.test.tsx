import { describe, test, expect, vi, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import CountdownTimer from "@/games/shared/_components/CountdownTimer";

describe("CountdownTimer", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  test("renders the countdown label", () => {
    vi.useFakeTimers();
    // Set to a known time: 2026-02-15 12:00:00 UTC = 2026-02-15 21:00:00 JST
    vi.setSystemTime(new Date("2026-02-15T12:00:00Z"));

    render(<CountdownTimer />);

    expect(screen.getByText("次の問題まで")).toBeInTheDocument();
  });

  test("displays time in HH:MM:SS format", () => {
    vi.useFakeTimers();
    // 2026-02-15 12:00:00 UTC = 2026-02-15 21:00:00 JST
    // Time until next JST midnight = 3 hours
    vi.setSystemTime(new Date("2026-02-15T12:00:00Z"));

    render(<CountdownTimer />);

    expect(screen.getByText("03:00:00")).toBeInTheDocument();
  });

  test("updates every second", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-15T12:00:00Z"));

    render(<CountdownTimer />);

    expect(screen.getByText("03:00:00")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
      vi.setSystemTime(new Date("2026-02-15T12:00:01Z"));
    });

    expect(screen.getByText("02:59:59")).toBeInTheDocument();
  });
});
