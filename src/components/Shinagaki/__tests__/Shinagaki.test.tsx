import { expect, test, describe } from "vitest";
import { render, screen } from "@testing-library/react";
import Shinagaki, { type ShinagakiItem } from "@/components/Shinagaki";

const items: ShinagakiItem[] = [
  {
    name: "文字数カウント",
    href: "/tools/char-count",
    note: "貼り付けた文章の文字数をすぐ数えます。",
    tags: ["3分", "コピーできます"],
  },
  {
    name: "今日の運勢",
    href: "/play/fortune",
    note: "今日のあなたの運勢を占います。",
    tags: ["診断"],
    meta: "2026-07-12",
  },
];

describe("Shinagaki", () => {
  test("各項目の品名がリンクとして正しい href で描画される", () => {
    render(<Shinagaki items={items} />);
    const link1 = screen.getByRole("link", { name: "文字数カウント" });
    expect(link1).toHaveAttribute("href", "/tools/char-count");
    const link2 = screen.getByRole("link", { name: "今日の運勢" });
    expect(link2).toHaveAttribute("href", "/play/fortune");
  });

  test("ひとこと（説明）が表示される", () => {
    render(<Shinagaki items={items} />);
    expect(
      screen.getByText("貼り付けた文章の文字数をすぐ数えます。"),
    ).toBeInTheDocument();
  });

  test("値札が表示される", () => {
    render(<Shinagaki items={items} />);
    expect(screen.getByText("3分")).toBeInTheDocument();
    expect(screen.getByText("コピーできます")).toBeInTheDocument();
    expect(screen.getByText("診断")).toBeInTheDocument();
  });

  test("右端メタが表示される", () => {
    render(<Shinagaki items={items} />);
    expect(screen.getByText("2026-07-12")).toBeInTheDocument();
  });

  test("罫区切りのリスト構造（<ul> + <li>）である（カードグリッドではない）", () => {
    render(<Shinagaki items={items} />);
    const list = screen.getByRole("list");
    expect(list.tagName).toBe("UL");
    const rows = screen.getAllByRole("listitem");
    expect(rows).toHaveLength(items.length);
  });

  test("項目数と <li> 数が一致する", () => {
    render(<Shinagaki items={[items[0]]} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
  });

  test("空配列でも <ul> は描画され、行は 0 件になる", () => {
    render(<Shinagaki items={[]} />);
    expect(screen.getByRole("list").tagName).toBe("UL");
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });

  test("note が無い項目は説明段落を出さない", () => {
    render(<Shinagaki items={[{ name: "素の項目", href: "/x" }]} />);
    const item = screen.getByRole("listitem");
    // 品名リンク以外にテキスト段落（p）が無いこと
    expect(item.querySelector("p")).toBeNull();
  });

  test("tags が無い項目は値札を描画しない", () => {
    const { container } = render(
      <Shinagaki items={[{ name: "素の項目", href: "/x" }]} />,
    );
    // 品名リンクは <a>。値札の span が無いことを確認するため、リンク配下以外の span を数える
    const spans = container.querySelectorAll("li span");
    expect(spans).toHaveLength(0);
  });

  test("meta が空文字なら右端メタを描画しない", () => {
    const { container } = render(
      <Shinagaki items={[{ name: "素の項目", href: "/x", meta: "  " }]} />,
    );
    expect(container.querySelectorAll("li span")).toHaveLength(0);
  });

  test("metaDateTime を与えると右端メタが <time dateTime> で描画される", () => {
    const { container } = render(
      <Shinagaki
        items={[
          {
            name: "日付付きの項目",
            href: "/x",
            meta: "2026-07-12",
            metaDateTime: "2026-07-12T09:00:00+09:00",
          },
        ]}
      />,
    );
    const time = container.querySelector("li time");
    expect(time).not.toBeNull();
    expect(time).toHaveAttribute("dateTime", "2026-07-12T09:00:00+09:00");
    expect(time).toHaveTextContent("2026-07-12");
  });

  test("metaDateTime が無い meta はプレーンな <span>（<time> にしない）", () => {
    const { container } = render(
      <Shinagaki items={[{ name: "件数の項目", href: "/x", meta: "12件" }]} />,
    );
    expect(container.querySelector("li time")).toBeNull();
    expect(container.querySelector("li span")).toHaveTextContent("12件");
  });

  test("heading を与えると既定でレベル 2 の見出しになる", () => {
    render(<Shinagaki items={items} heading="道具" />);
    const h = screen.getByRole("heading", { level: 2, name: "道具" });
    expect(h).toBeInTheDocument();
  });

  test("headingLevel で見出しレベルを変えられる", () => {
    render(<Shinagaki items={items} heading="遊び" headingLevel={3} />);
    expect(
      screen.getByRole("heading", { level: 3, name: "遊び" }),
    ).toBeInTheDocument();
  });

  test("heading を与えなければ見出しは描画されない", () => {
    render(<Shinagaki items={items} />);
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });

  test("ariaLabel をリストに付与できる", () => {
    render(<Shinagaki items={items} ariaLabel="道具の品書き" />);
    expect(
      screen.getByRole("list", { name: "道具の品書き" }),
    ).toBeInTheDocument();
  });
});
