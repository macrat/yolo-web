import { describe, expect, test } from "vitest";
import { render, screen, within } from "@testing-library/react";
import IndexAccordion from "@/components/IndexAccordion";

const categories = [
  { label: "人生", href: "/dictionary/yoji/category/life", count: 58 },
  { label: "努力", href: "/dictionary/yoji/category/effort", count: 45 },
];

describe("IndexAccordion", () => {
  test("索引が1つなら、ラベルが語の数を言い、索引はラベルを名前に持つ", () => {
    const { container } = render(
      <IndexAccordion
        summary={["カテゴリから", "探す"]}
        index={categories}
        currentHref="/dictionary/yoji/category/life"
      />,
    );
    expect(container.querySelector("details")).not.toHaveAttribute("open");
    expect(container.querySelector("summary")).toHaveTextContent(
      "カテゴリから探す（2）",
    );
    expect(screen.queryByRole("heading", { hidden: true })).toBeNull();
    const list = screen.getByRole("list", {
      name: "カテゴリから探す（2）",
      hidden: true,
    });
    const links = within(list).getAllByRole("link", { hidden: true });
    expect(links[0]).toHaveAttribute("aria-current", "page");
    expect(links[1]).not.toHaveAttribute("aria-current");
  });

  test("索引が2つ以上なら、索引ごとの見出しが語の数を言い、区切りを持つ索引を最後に置く", () => {
    render(
      <IndexAccordion
        summary={["学年・", "画数・", "部首から", "探す"]}
        indexes={[
          {
            name: "学年",
            items: [{ label: "小学1年", href: "/dictionary/kanji/grade/1" }],
          },
          {
            name: "画数",
            items: [
              { label: "1画", href: "/dictionary/kanji/stroke/1" },
              { label: "2画", href: "/dictionary/kanji/stroke/2" },
            ],
          },
        ]}
        groupedIndex={{
          name: "部首",
          singleCharacters: true,
          groups: [
            {
              heading: "1画",
              items: [{ label: "一", href: "/dictionary/kanji/radical/一" }],
            },
            {
              heading: "4画",
              items: [
                { label: "水", href: "/dictionary/kanji/radical/水" },
                { label: "火", href: "/dictionary/kanji/radical/火" },
              ],
            },
          ],
        }}
        currentHref="/dictionary/kanji"
      />,
    );
    const headings = screen.getAllByRole("heading", { hidden: true });
    expect(
      headings.map((heading) => [heading.tagName, heading.textContent]),
    ).toEqual([
      ["H2", "学年（1）"],
      ["H2", "画数（2）"],
      ["H2", "部首（3）"],
      ["H3", "1画"],
      ["H3", "4画"],
    ]);
    expect(
      screen.getByRole("list", { name: "画数（2）", hidden: true }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("list", { name: "4画", hidden: true }),
    ).toBeInTheDocument();
  });

  test("名前は渡された語の切れ目と、語の数の始め括弧の前でだけ折れる", () => {
    const { container } = render(
      <IndexAccordion
        summary={["カテゴリから", "探す"]}
        index={categories}
        currentHref="/dictionary/yoji"
      />,
    );
    const name = container.querySelector("summary wbr")?.parentElement;
    expect(
      [...(name?.childNodes ?? [])].map((node) =>
        node.nodeName === "WBR" ? "|" : node.textContent,
      ),
    ).toEqual(["カテゴリから", "|", "探す", "|", "（2）"]);
  });

  test("索引の見出しは、名前の語と語の数のあいだでだけ折れる", () => {
    render(
      <IndexAccordion
        summary={["分類・", "タグから", "探す"]}
        indexes={[{ name: "分類", items: categories }]}
        currentHref="/blog"
      />,
    );
    const heading = screen.getByRole("heading", {
      name: "分類（2）",
      hidden: true,
    });
    expect(heading.querySelectorAll("wbr")).toHaveLength(1);
    expect(heading.querySelector("wbr")?.previousSibling?.textContent).toBe(
      "分類",
    );
  });
});
