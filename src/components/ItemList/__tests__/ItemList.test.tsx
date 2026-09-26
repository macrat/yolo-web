import { describe, expect, test } from "vitest";
import { render, screen, within } from "@testing-library/react";
import ItemList, { type ItemListItem } from "@/components/ItemList";

const items: ItemListItem[] = [
  {
    name: "文字数カウント",
    href: "/tools/char-count",
    description: "貼り付けた文章の文字数をすぐ数えます。",
    kind: "文章",
    facts: [{ text: "2026-02-13", dateTime: "2026-02-13T09:00:00+09:00" }],
  },
  {
    name: "水",
    href: "/dictionary/kanji/水",
    reading: "スイ・みず",
    kind: "小学1年",
    facts: [{ text: "4画" }],
  },
  {
    name: "鴇色",
    href: "/dictionary/colors/toki",
    reading: "tokiiro",
    facts: [{ text: "#f4b3c2" }],
    swatch: "#f4b3c2",
  },
];

describe("ItemList", () => {
  test("各行のリンクの読み上げの名前は、行の名前と完全に一致する", () => {
    render(<ItemList label="見本" items={items} />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(items.length);
    links.forEach((link, index) => {
      expect(link).toHaveAccessibleName(items[index].name);
      expect(link).toHaveAttribute("href", items[index].href);
    });
  });

  test("読み・説明・種別・補助情報は行の中に出るが、リンクの外にある", () => {
    render(<ItemList label="見本" items={items} />);
    const [firstRow, secondRow] = screen.getAllByRole("listitem");
    for (const text of [
      "貼り付けた文章の文字数をすぐ数えます。",
      "文章",
      "2026-02-13",
    ]) {
      const element = within(firstRow).getByText(text);
      expect(element.closest("a")).toBeNull();
    }
    expect(within(secondRow).getByText("スイ・みず").closest("a")).toBeNull();
  });

  test("日付の補助情報は <time dateTime> で包み、ほかの値は包まない", () => {
    render(<ItemList label="見本" items={items} />);
    const time = screen.getByText("2026-02-13");
    expect(time.tagName).toBe("TIME");
    expect(time).toHaveAttribute("dateTime", "2026-02-13T09:00:00+09:00");
    expect(screen.getByText("4画").tagName).toBe("SPAN");
  });

  test("色見本は読み上げの木に現れず、コンテンツの色を地に持つ", () => {
    const { container } = render(<ItemList label="見本" items={items} />);
    const swatches = container.querySelectorAll('[aria-hidden="true"]');
    expect(swatches).toHaveLength(1);
    expect((swatches[0] as HTMLElement).style.backgroundColor).not.toBe("");
  });

  test("行に見出し要素を置かない", () => {
    render(<ItemList label="見本" items={items} />);
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });

  test("見出しの id を渡すと、一覧の名前がその見出しになる", () => {
    render(
      <section>
        <h2 id="shelf">道具</h2>
        <ItemList labelledBy="shelf" items={items} />
      </section>,
    );
    expect(screen.getByRole("list", { name: "道具" })).toBeInTheDocument();
  });

  test("見出しが無いときは、渡した文が一覧の名前になる", () => {
    render(<ItemList label="主要な一覧" items={items} />);
    expect(
      screen.getByRole("list", { name: "主要な一覧" }),
    ).toBeInTheDocument();
  });

  test("既定は ul で、順に読む一覧は ol にする", () => {
    const { unmount } = render(<ItemList label="見本" items={items} />);
    expect(screen.getByRole("list").tagName).toBe("UL");
    unmount();
    render(<ItemList label="連載" items={items} ordered />);
    expect(screen.getByRole("list").tagName).toBe("OL");
  });

  test("いま開いているページの行だけが現在地になり、リンクのまま名前も変わらない", () => {
    render(
      <ItemList
        label="見本"
        items={items}
        currentHref="/dictionary/kanji/水"
      />,
    );
    const current = screen.getByRole("link", { name: "水" });
    expect(current).toHaveAttribute("aria-current", "page");
    expect(current).toHaveAttribute("href", "/dictionary/kanji/水");
    expect(
      screen.getByRole("link", { name: "文字数カウント" }),
    ).not.toHaveAttribute("aria-current");
  });

  test("既定はボックスで囲み、boxed={false} では囲まない", () => {
    const { container, unmount } = render(
      <ItemList label="見本" items={items} />,
    );
    expect(container.firstElementChild?.tagName).toBe("DIV");
    expect(container.firstElementChild?.firstElementChild?.tagName).toBe("UL");
    unmount();
    const { container: bare } = render(
      <ItemList label="見本" items={items} boxed={false} />,
    );
    expect(bare.firstElementChild?.tagName).toBe("UL");
  });

  test("持たない値の要素は出さない", () => {
    render(
      <ItemList label="見本" items={[{ name: "素の項目", href: "/x" }]} />,
    );
    const row = screen.getByRole("listitem");
    expect(row.querySelectorAll("p")).toHaveLength(1);
    expect(row.querySelector("time, [aria-hidden]")).toBeNull();
  });
});
