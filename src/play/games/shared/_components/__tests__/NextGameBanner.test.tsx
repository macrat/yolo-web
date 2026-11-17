import { describe, test, expect, vi, beforeEach } from "vitest";
import { useLayoutEffect, useRef } from "react";
import { render, screen, within } from "@testing-library/react";
import { getTodayJst } from "@/play/games/shared/_lib/crossGameProgress";
import NextGameBanner from "../NextGameBanner";

// 遊んだかどうかは、ほんとうの進みの読み取り（crossGameProgress）が端末の記録から決める。
// デイリーゲームの登録だけを3本に差し替える。
vi.mock("@/play/games/registry", () => ({
  allGameMetas: [
    {
      slug: "kanji-kanaru",
      title: "漢字カナール",
      statsKey: "a",
      isDaily: true,
    },
    { slug: "yoji-kimeru", title: "四字キメル", statsKey: "b", isDaily: true },
    { slug: "nakamawake", title: "ナカマワケ", statsKey: "c", isDaily: true },
  ],
  getGamePath: (slug: string) => `/play/${slug}`,
}));

/** その端末で今日そのゲームを遊び終えた記録を置く。won が false なら、当てられずに終えた回。 */
function playToday(statsKey: string, won: boolean) {
  window.localStorage.setItem(
    statsKey,
    JSON.stringify({
      gamesPlayed: 1,
      gamesWon: won ? 1 : 0,
      currentStreak: won ? 1 : 0,
      maxStreak: won ? 1 : 0,
      guessDistribution: [0, 0, 0, won ? 1 : 0, 0, 0],
      lastPlayedDate: getTodayJst(),
    }),
  );
}

describe("NextGameBanner", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  test("見出し「今日のほかのパズル」が一覧の名前になり、いまのゲームを除いたデイリーゲームを並べること", () => {
    playToday("a", true);
    render(<NextGameBanner currentGameSlug="kanji-kanaru" />);

    expect(
      screen.getByRole("heading", { level: 2, name: "今日のほかのパズル" }),
    ).toBeInTheDocument();
    const list = screen.getByRole("list", { name: "今日のほかのパズル" });
    const names = within(list)
      .getAllByRole("link")
      .map((link) => link.textContent);
    expect(names).toEqual(["四字キメル", "ナカマワケ"]);
  });

  test("当てられずに終えた回のあとも、進みの行がその回を「遊んだ」と数えること", () => {
    playToday("a", false);
    render(<NextGameBanner currentGameSlug="kanji-kanaru" />);

    expect(
      screen.getByText("今日は3本のうち1本を遊びました"),
    ).toBeInTheDocument();
    expect(screen.queryByText(/クリア|制覇/)).not.toBeInTheDocument();
  });

  test("今日遊んだゲームの行だけが「今日は遊んだ」を補助情報に持つこと", () => {
    playToday("a", true);
    playToday("b", false);
    render(<NextGameBanner currentGameSlug="kanji-kanaru" />);

    const rows = screen.getAllByRole("listitem");
    expect(within(rows[0]).getByText("今日は遊んだ")).toBeInTheDocument();
    expect(within(rows[1]).queryByText("今日は遊んだ")).not.toBeInTheDocument();
  });

  test("すべて遊んだ日は、一覧を出さずに、すべて遊んだことを言うこと", () => {
    playToday("a", true);
    playToday("b", false);
    playToday("c", true);
    render(<NextGameBanner currentGameSlug="kanji-kanaru" />);

    expect(screen.getByText("今日の3本をすべて遊びました")).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  test("ブラウザで新しく描くとき、最初の描画から並びを持ち、あとから並びが現れて下を押し下げないこと", () => {
    playToday("a", true);
    const firstCommit: { rows: number | null } = { rows: null };
    // 最初の描画を画面に反映した直後（記録を購読する前）に、並びがすでにあるかを見る。
    function FirstCommitProbe() {
      const ref = useRef<HTMLDivElement>(null);
      useLayoutEffect(() => {
        firstCommit.rows = ref.current?.querySelectorAll("li").length ?? null;
      }, []);
      return (
        <div ref={ref}>
          <NextGameBanner currentGameSlug="kanji-kanaru" />
        </div>
      );
    }
    render(<FirstCommitProbe />);
    expect(firstCommit.rows).toBe(2);
  });
});
