import { describe, test, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import type { ItemListItem } from "@/components/ItemList";
import ResultNextContent from "../ResultNextContent";

const mockItems: ItemListItem[] = [
  {
    name: "動物診断",
    href: "/play/animal-personality",
    description: "固有種12タイプで自分を知る",
    kind: "診断",
    facts: [{ text: "全12問" }],
  },
  {
    name: "漢字レベル診断",
    href: "/play/kanji-level",
    description: "あなたの漢字力を測定",
    kind: "クイズ",
    facts: [{ text: "全10問" }],
  },
  {
    name: "漢字カナール",
    href: "/play/kanji-kanaru",
    description: "毎日の漢字パズル",
    kind: "パズル",
    facts: [{ text: "毎日更新" }],
  },
];

describe("ResultNextContent", () => {
  test("見出しが一覧の名前になり、行を渡された順に並べること", () => {
    render(<ResultNextContent items={mockItems} />);

    expect(
      screen.getByRole("heading", { level: 3, name: "次はこれを試してみよう" }),
    ).toBeInTheDocument();
    const list = screen.getByRole("list", { name: "次はこれを試してみよう" });
    const links = within(list).getAllByRole("link");
    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      "/play/animal-personality",
      "/play/kanji-level",
      "/play/kanji-kanaru",
    ]);
  });

  test("リンクの読み上げの名前が行の名前だけであること", () => {
    render(<ResultNextContent items={mockItems} />);

    const names = screen.getAllByRole("link").map((link) => link.textContent);
    expect(names).toEqual(["動物診断", "漢字レベル診断", "漢字カナール"]);
  });

  test("説明・種別・補助情報を行に出すこと", () => {
    render(<ResultNextContent items={mockItems} />);

    expect(screen.getByText("固有種12タイプで自分を知る")).toBeInTheDocument();
    expect(screen.getByText("診断")).toBeInTheDocument();
    expect(screen.getByText("全12問")).toBeInTheDocument();
    expect(screen.getByText("毎日更新")).toBeInTheDocument();
  });

  test("空配列の場合は何も描かないこと", () => {
    const { container } = render(<ResultNextContent items={[]} />);
    expect(container.firstChild).toBeNull();
  });
});
