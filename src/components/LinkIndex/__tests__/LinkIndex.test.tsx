import { describe, expect, test } from "vitest";
import { render, screen, within } from "@testing-library/react";
import LinkIndex, {
  type LinkIndexGroup,
  type LinkIndexItem,
} from "@/components/LinkIndex";

const tags: LinkIndexItem[] = [
  { label: "Web開発", href: "/blog/tag/Web開発", count: 35 },
  { label: "設計パターン", href: "/blog/tag/設計パターン", count: 20 },
  { label: "SQL", href: "/blog/tag/SQL", count: 4 },
];

const strokeGroups: LinkIndexGroup[] = [
  {
    heading: "4画",
    items: [
      { label: "氷", href: "/dictionary/kanji/氷" },
      { label: "永", href: "/dictionary/kanji/永" },
    ],
  },
  {
    heading: "5画",
    headingFont: { "data-heading-font": "fallback" },
    items: [{ label: "汁", href: "/dictionary/kanji/汁" }],
  },
];

describe("LinkIndex", () => {
  test("語は名前を持つリストの項目で、Safari でもリストとして読まれるよう role を明示する", () => {
    render(<LinkIndex label="タグ（3）" items={tags} />);
    const list = screen.getByRole("list", { name: "タグ（3）" });
    expect(list).toHaveAttribute("role", "list");
    expect(within(list).getAllByRole("listitem")).toHaveLength(3);
  });

  test("項目の数を持つ語は、語の後ろに数を添え、渡された順に並ぶ", () => {
    render(<LinkIndex label="タグ（3）" items={tags} />);
    const links = screen.getAllByRole("link");
    expect(links.map((link) => link.textContent)).toEqual([
      "Web開発（35）",
      "設計パターン（20）",
      "SQL（4）",
    ]);
    expect(links[0]).toHaveAttribute("href", "/blog/tag/Web開発");
  });

  test("数を持たない語は、語だけを言う", () => {
    render(
      <LinkIndex
        label="学年（2）"
        items={[
          { label: "小学1年", href: "/dictionary/kanji/grade/1" },
          { label: "小学2年", href: "/dictionary/kanji/grade/2" },
        ]}
      />,
    );
    expect(screen.getAllByRole("link").map((l) => l.textContent)).toEqual([
      "小学1年",
      "小学2年",
    ]);
  });

  test("いま開いているページを指す語だけが現在地になる", () => {
    render(
      <LinkIndex
        label="タグ（3）"
        items={tags}
        currentHref="/blog/tag/設計パターン"
      />,
    );
    const current = screen.getByRole("link", { current: "page" });
    expect(current).toHaveTextContent("設計パターン（20）");
    expect(
      screen
        .getAllByRole("link")
        .filter((link) => link.hasAttribute("aria-current")),
    ).toHaveLength(1);
  });

  test("見出しの id で名前を付けられる", () => {
    render(
      <>
        <h2 id="tag-heading">タグ（3）</h2>
        <LinkIndex labelledBy="tag-heading" items={tags} />
      </>,
    );
    expect(screen.getByRole("list", { name: "タグ（3）" })).toBeInTheDocument();
  });

  test("区切りを持つ索引は、区切りごとに見出しと、その見出しを名前に持つリストを置く", () => {
    render(
      <LinkIndex
        label="同じ部首の漢字（3字）"
        groups={strokeGroups}
        groupHeadingLevel={3}
      />,
    );
    const group = screen.getByRole("group", { name: "同じ部首の漢字（3字）" });
    const headings = within(group).getAllByRole("heading", { level: 3 });
    expect(headings.map((h) => h.textContent)).toEqual(["4画", "5画"]);

    const fourStrokes = within(group).getByRole("list", { name: "4画" });
    expect(fourStrokes).toHaveAttribute("role", "list");
    expect(
      within(fourStrokes)
        .getAllByRole("link")
        .map((l) => l.textContent),
    ).toEqual(["氷", "永"]);
    expect(
      within(within(group).getByRole("list", { name: "5画" })).getAllByRole(
        "link",
      ),
    ).toHaveLength(1);
  });

  test("区切りの見出しは、渡された段と書体の属性で組む", () => {
    render(
      <LinkIndex
        label="部首（2）"
        groups={strokeGroups}
        groupHeadingLevel={4}
      />,
    );
    expect(screen.getAllByRole("heading", { level: 4 })).toHaveLength(2);
    expect(screen.getByRole("heading", { name: "5画" })).toHaveAttribute(
      "data-heading-font",
      "fallback",
    );
    expect(screen.getByRole("heading", { name: "4画" })).not.toHaveAttribute(
      "data-heading-font",
    );
  });
});
