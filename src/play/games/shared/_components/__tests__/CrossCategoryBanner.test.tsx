import { describe, test, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { CrossCategoryBanner } from "../CrossCategoryBanner";

const items = [
  { name: "今日のユーモア運勢", href: "/play/daily", kind: "運勢" },
  { name: "漢字力診断", href: "/play/kanji-level", kind: "クイズ" },
];

describe("CrossCategoryBanner", () => {
  test("小見出しが一覧の名前になり、リンクの読み上げの名前が行の名前だけであること", () => {
    render(<CrossCategoryBanner items={items} />);

    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "他のコンテンツも試してみよう",
      }),
    ).toBeInTheDocument();
    const list = screen.getByRole("list", {
      name: "他のコンテンツも試してみよう",
    });
    const names = within(list)
      .getAllByRole("link")
      .map((link) => link.textContent);
    expect(names).toEqual(["今日のユーモア運勢", "漢字力診断"]);
  });

  test("種別を行に出すこと", () => {
    render(<CrossCategoryBanner items={items} />);

    expect(screen.getByText("運勢")).toBeInTheDocument();
    expect(screen.getByText("クイズ")).toBeInTheDocument();
  });

  test("行が無いときは何も描かないこと", () => {
    const { container } = render(<CrossCategoryBanner items={[]} />);
    expect(container.firstChild).toBeNull();
  });
});
