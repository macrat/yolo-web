import { describe, test, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import NextGameBanner from "@/components/games/shared/NextGameBanner";

describe("NextGameBanner", () => {
  afterEach(() => {
    vi.useRealTimers();
    window.localStorage.clear();
  });

  test("shows other games excluding current game", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-15T12:00:00Z"));

    render(<NextGameBanner currentGameSlug="kanji-kanaru" />);

    expect(screen.getByText("四字キメル")).toBeInTheDocument();
    expect(screen.getByText("ナカマワケ")).toBeInTheDocument();
    expect(screen.getByText("イロドリ")).toBeInTheDocument();
    // Current game should not appear as a link
    expect(screen.queryByText("漢字カナール")).not.toBeInTheDocument();
  });

  test("shows progress text with count", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-15T12:00:00Z"));

    window.localStorage.setItem(
      "kanji-kanaru-stats",
      JSON.stringify({ lastPlayedDate: "2026-02-15" }),
    );

    render(<NextGameBanner currentGameSlug="kanji-kanaru" />);

    expect(screen.getByText("今日のパズル 1/4 クリア")).toBeInTheDocument();
  });

  test("shows unplayed status for games not played today", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-15T12:00:00Z"));

    render(<NextGameBanner currentGameSlug="kanji-kanaru" />);

    const unplayedElements = screen.getAllByText("未プレイ");
    expect(unplayedElements).toHaveLength(3);
  });

  test("shows played status for games played today", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-15T12:00:00Z"));

    window.localStorage.setItem(
      "yoji-kimeru-stats",
      JSON.stringify({ lastPlayedDate: "2026-02-15" }),
    );

    render(<NextGameBanner currentGameSlug="kanji-kanaru" />);

    expect(screen.getByText("クリア済")).toBeInTheDocument();
  });

  test("shows all complete message when all games played", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-02-15T12:00:00Z"));

    window.localStorage.setItem(
      "kanji-kanaru-stats",
      JSON.stringify({ lastPlayedDate: "2026-02-15" }),
    );
    window.localStorage.setItem(
      "yoji-kimeru-stats",
      JSON.stringify({ lastPlayedDate: "2026-02-15" }),
    );
    window.localStorage.setItem(
      "nakamawake-stats",
      JSON.stringify({ lastPlayedDate: "2026-02-15" }),
    );
    window.localStorage.setItem(
      "irodori-stats",
      JSON.stringify({ lastPlayedDate: "2026-02-15" }),
    );

    render(<NextGameBanner currentGameSlug="kanji-kanaru" />);

    expect(screen.getByText("今日のパズル 完全制覇!")).toBeInTheDocument();
  });
});
