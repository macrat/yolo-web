import { expect, test } from "vitest";
import { render, screen, within } from "@testing-library/react";
import Section from "@/components/Section";
import { followsPhraseRules } from "@/lib/phrase-breaks";
import RelatedGames from "../RelatedGames";

/** Section が描く要素の class。関連ゲームの根がこれと同じなら、同じセクションの罫線と余白を持つ。 */
function sectionClassName(): string {
  const { container, unmount } = render(<Section />);
  const className = (container.firstElementChild as HTMLElement).className;
  unmount();
  return className;
}

test("ページの1つのセクション（Section）として描き、見出しはセクションの見出し（h2）", () => {
  const expectedClassName = sectionClassName();
  const { container } = render(
    <RelatedGames
      currentSlug="kanji-kanaru"
      relatedSlugs={["yoji-kimeru", "nakamawake"]}
    />,
  );
  const root = container.firstElementChild as HTMLElement;
  expect(container.childElementCount).toBe(1);
  expect(root.tagName).toBe("SECTION");
  expect(root.className).toBe(expectedClassName);
  expect(
    within(root).getByRole("heading", { level: 2, name: "関連ゲーム" }),
  ).toBeInTheDocument();
});

test("挙げた関連ゲームを、見出しの名前を持つ一覧に並べる", () => {
  render(
    <RelatedGames
      currentSlug="kanji-kanaru"
      relatedSlugs={["yoji-kimeru", "nakamawake"]}
    />,
  );
  const list = screen.getByRole("list", { name: "関連ゲーム" });
  expect(
    within(list)
      .getAllByRole("link")
      .map((link) => link.getAttribute("href")),
  ).toEqual(["/play/yoji-kimeru", "/play/nakamawake"]);
});

test("いまのゲームと、ゲームに無い slug は並べない", () => {
  render(
    <RelatedGames
      currentSlug="kanji-kanaru"
      relatedSlugs={["kanji-kanaru", "no-such-game", "irodori"]}
    />,
  );
  const list = screen.getByRole("list", { name: "関連ゲーム" });
  expect(
    within(list)
      .getAllByRole("link")
      .map((link) => link.getAttribute("href")),
  ).toEqual(["/play/irodori"]);
});

test("並べるものが無いときは、セクションごと描かない", () => {
  for (const relatedSlugs of [undefined, [], ["kanji-kanaru"]]) {
    const { container, unmount } = render(
      <RelatedGames currentSlug="kanji-kanaru" relatedSlugs={relatedSlugs} />,
    );
    expect(container.firstChild).toBeNull();
    unmount();
  }
});

test("見出しは文節の切れ目でだけ折れる（DESIGN.md §4）", () => {
  render(
    <RelatedGames currentSlug="kanji-kanaru" relatedSlugs={["irodori"]} />,
  );
  const phrases = ["関連", "ゲーム"];
  expect(followsPhraseRules(phrases)).toBe(true);
  expect(
    screen.getByRole("heading", { name: phrases.join("") }).innerHTML,
  ).toBe(phrases.join("<wbr>"));
});
