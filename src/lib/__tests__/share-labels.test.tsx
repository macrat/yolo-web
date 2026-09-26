import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import ShareButtons from "@/components/ShareButtons";
import Button from "@/components/Button";

// jsdom の navigator は share を持たないので、結果の共有も外部の共有先のボタンを並べる。
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

  test("診断・占いの結果の共有も、同じ文言と名前を持ち、コピーは予告しない", () => {
    render(
      <ShareButtons
        url="https://example.com/play/x/result/a"
        title="診断"
        text="結果"
        sns={["x", "line", "copy"]}
      />,
    );
    expect(
      screen
        .getAllByRole("button")
        .map((b) => [
          b.textContent,
          b.getAttribute("aria-label") ?? b.textContent,
        ]),
    ).toEqual([
      ["X でシェア", "X でシェア（外部サイト・新しいタブで開く）"],
      ["LINE でシェア", "LINE でシェア（外部サイト・新しいタブで開く）"],
      ["結果をコピー", "結果をコピー"],
    ]);
  });

  test("ゲームの結果の共有も、同じ文言と名前を持ち、コピーと画像の保存は予告しない", () => {
    render(
      <ShareButtons
        url="/play/irodori"
        title="ゲーム"
        text="結果"
        sns={["x", "line", "copy"]}
      >
        <Button onClick={() => {}}>画像を保存</Button>
      </ShareButtons>,
    );
    expect(
      screen
        .getAllByRole("button")
        .map((b) => [
          b.textContent,
          b.getAttribute("aria-label") ?? b.textContent,
        ]),
    ).toEqual([
      ["X でシェア", "X でシェア（外部サイト・新しいタブで開く）"],
      ["LINE でシェア", "LINE でシェア（外部サイト・新しいタブで開く）"],
      ["結果をコピー", "結果をコピー"],
      ["画像を保存", "画像を保存"],
    ]);
  });
});
