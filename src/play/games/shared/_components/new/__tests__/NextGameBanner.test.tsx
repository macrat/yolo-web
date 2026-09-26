import { describe, test, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import NextGameBanner from "../NextGameBanner";

const { games, played } = vi.hoisted(() => ({
  games: [
    {
      slug: "kanji-kanaru",
      title: "漢字カナール",
      path: "/play/kanji-kanaru",
      statsKey: "a",
    },
    {
      slug: "yoji-kimeru",
      title: "四字キメル",
      path: "/play/yoji-kimeru",
      statsKey: "b",
    },
    {
      slug: "nakamawake",
      title: "ナカマワケ",
      path: "/play/nakamawake",
      statsKey: "c",
    },
  ],
  played: new Set<string>(),
}));

vi.mock("@/play/games/shared/_lib/crossGameProgress", () => ({
  ALL_GAMES: games,
  getAllGameStatus: () =>
    games.map((game) => ({ game, playedToday: played.has(game.slug) })),
}));

describe("NextGameBanner", () => {
  test("いまのゲームを除いたデイリーゲームを並べ、リンクの読み上げの名前がゲーム名だけであること", () => {
    played.clear();
    played.add("kanji-kanaru");
    played.add("yoji-kimeru");
    render(<NextGameBanner currentGameSlug="kanji-kanaru" />);

    const list = screen.getByRole("list", { name: "今日のパズル 2/3 クリア" });
    const names = within(list)
      .getAllByRole("link")
      .map((link) => link.textContent);
    expect(names).toEqual(["四字キメル", "ナカマワケ"]);
  });

  test("今日遊んだゲームの行だけが「今日は遊んだ」を補助情報に持つこと", () => {
    played.clear();
    played.add("kanji-kanaru");
    played.add("yoji-kimeru");
    render(<NextGameBanner currentGameSlug="kanji-kanaru" />);

    const rows = screen.getAllByRole("listitem");
    expect(within(rows[0]).getByText("今日は遊んだ")).toBeInTheDocument();
    expect(within(rows[1]).queryByText("今日は遊んだ")).not.toBeInTheDocument();
  });

  test("すべて遊んだ日は、一覧を出さずに完全制覇を言うこと", () => {
    played.clear();
    for (const game of games) played.add(game.slug);
    render(<NextGameBanner currentGameSlug="kanji-kanaru" />);

    expect(screen.getByText("今日のパズル 完全制覇!")).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });
});
