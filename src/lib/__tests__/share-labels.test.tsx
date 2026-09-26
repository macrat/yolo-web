import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import ShareButtons from "@/components/ShareButtons";
import QuizShareButtons from "@/play/quiz/_components/ShareButtons";
import GameShareButtons from "@/play/games/shared/_components/new/GameShareButtons";

// jsdom の navigator は share を持たないので、どの部品も外部の共有先のボタンを並べる。
describe("共有のボタンの文言と読み上げの名前", () => {
  test("記事・道具の共有は、外部を新しいタブで開くボタンだけが名前で予告する", () => {
    render(<ShareButtons url="/blog/test" title="テスト記事" />);
    const expected = [
      ["X でシェア", "X でシェア（外部サイト・新しいタブで開く）"],
      ["LINE でシェア", "LINE でシェア（外部サイト・新しいタブで開く）"],
      [
        "はてブに追加",
        "はてブに追加（はてなブックマーク・外部サイト・新しいタブで開く）",
      ],
      ["URLをコピー", "URLをコピー"],
    ];
    const buttons = screen.getAllByRole("button");
    expect(
      buttons.map((b) => [
        b.textContent,
        b.getAttribute("aria-label") ?? b.textContent,
      ]),
    ).toEqual(expected);
    for (const [, name] of expected) {
      expect(screen.getByRole("button", { name })).toBeInTheDocument();
    }
  });

  test("診断・クイズの結果の共有も、同じ文言と名前を持つ", () => {
    render(
      <QuizShareButtons
        shareText="結果"
        shareUrl="https://example.com/play/x/result/a"
        quizTitle="診断"
      />,
    );
    expect(
      screen.getByRole("button", {
        name: "X でシェア（外部サイト・新しいタブで開く）",
      }),
    ).toHaveTextContent(/^X でシェア$/);
    expect(
      screen.getByRole("button", {
        name: "LINE でシェア（外部サイト・新しいタブで開く）",
      }),
    ).toHaveTextContent(/^LINE でシェア$/);
    expect(
      screen.getByRole("button", { name: "結果をコピー" }),
    ).not.toHaveAttribute("aria-label");
  });

  test("ゲームの結果の共有も、同じ文言と名前を持ち、コピーと画像の保存は予告しない", () => {
    render(
      <GameShareButtons
        shareText="結果"
        gameTitle="ゲーム"
        gameSlug="irodori"
        onSaveImage={() => {}}
      />,
    );
    expect(
      screen.getByRole("button", {
        name: "X でシェア（外部サイト・新しいタブで開く）",
      }),
    ).toHaveTextContent(/^X でシェア$/);
    for (const name of ["結果をコピー", "画像を保存"]) {
      expect(screen.getByRole("button", { name })).not.toHaveAttribute(
        "aria-label",
      );
    }
  });
});
