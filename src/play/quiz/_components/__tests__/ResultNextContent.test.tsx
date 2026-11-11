import { describe, test, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import type { ItemListItem } from "@/components/ItemList";
import ResultNextContent from "../ResultNextContent";
import { followsPhraseRules } from "@/lib/phrase-breaks";

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

function renderNext(items: ItemListItem[] = mockItems) {
  return render(
    <ResultNextContent items={items}>
      <button type="button">もう一度挑戦する</button>
    </ResultNextContent>,
  );
}

describe("ResultNextContent", () => {
  test("1つのセクションで、見出し「次はこれを試してみよう」（セクションの見出しの段の h2）のすぐ下に操作を置き、その下に次の遊びの一覧を置く", () => {
    const { container } = renderNext();

    const sections = container.querySelectorAll(":scope > section");
    expect(sections).toHaveLength(1);
    const heading = screen.getByRole("heading", {
      level: 2,
      name: "次はこれを試してみよう",
    });
    const retry = screen.getByRole("button", { name: "もう一度挑戦する" });
    const list = screen.getByRole("list", { name: "次はこれを試してみよう" });
    const all = Array.from(container.querySelectorAll("*"));
    const positions = [heading, retry, list].map((element) =>
      all.indexOf(element),
    );
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
    expect(sections[0]).toHaveAccessibleName("次はこれを試してみよう");
  });

  test("行を渡された順に並べ、リンクの読み上げの名前が行の名前だけであること", () => {
    renderNext();

    const list = screen.getByRole("list", { name: "次はこれを試してみよう" });
    const links = within(list).getAllByRole("link");
    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      "/play/animal-personality",
      "/play/kanji-level",
      "/play/kanji-kanaru",
    ]);
    expect(links.map((link) => link.textContent)).toEqual([
      "動物診断",
      "漢字レベル診断",
      "漢字カナール",
    ]);
  });

  test("説明・種別・補助情報を行に出すこと", () => {
    renderNext();

    expect(screen.getByText("固有種12タイプで自分を知る")).toBeInTheDocument();
    expect(screen.getByText("診断")).toBeInTheDocument();
    expect(screen.getByText("全12問")).toBeInTheDocument();
    expect(screen.getByText("毎日更新")).toBeInTheDocument();
  });

  test("並べる行が無いときも、見出しと操作は置き、空の一覧を置かないこと", () => {
    renderNext([]);
    expect(
      screen.getByRole("heading", { name: "次はこれを試してみよう" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "もう一度挑戦する" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  test("見出しは書き手が分けた文節の切れ目でだけ折れる（DESIGN.md §4）", () => {
    renderNext();
    const headings: string[][] = [["次は", "これを", "試して", "みよう"]];
    for (const phrases of headings) {
      expect(followsPhraseRules(phrases), phrases.join("|")).toBe(true);
      const heading = screen.getByRole("heading", { name: phrases.join("") });
      expect(heading.innerHTML).toBe(phrases.join("<wbr>"));
    }
  });
});
