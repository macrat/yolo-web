import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import PhrasedText from "@/components/PhrasedText";

const phrases = ["「よし行くぞ！」と", "叫んで", "3秒後に", "空を"];
const text = phrases.join("");

describe("PhrasedText", () => {
  test("見出しの中の要素は文節のあいだの <wbr> だけで、字を分ける要素を持たない", () => {
    render(<PhrasedText as="h2" phrases={phrases} />);
    const heading = screen.getByRole("heading", { level: 2 });
    const elements = [...heading.children];
    expect(elements.map((element) => element.tagName)).toEqual([
      "WBR",
      "WBR",
      "WBR",
    ]);
    expect(heading.querySelectorAll("span")).toHaveLength(0);
  });

  test("見出しの文と読み上げの名前は元の文と一字も違わない", () => {
    render(<PhrasedText as="h1" phrases={phrases} />);
    const heading = screen.getByRole("heading", { level: 1, name: text });
    expect(heading.textContent).toBe(text);
  });

  test("<wbr> は文節のあいだにだけ置き、文の頭と終わりに置かない", () => {
    render(<PhrasedText as="h2" phrases={phrases} />);
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading.firstChild?.nodeName).toBe("#text");
    expect(heading.lastChild?.nodeName).toBe("#text");
    expect(heading.innerHTML).toBe(phrases.join("<wbr>"));
  });

  test("文節が1つなら <wbr> を持たない", () => {
    render(<PhrasedText as="h3" phrases={["博士"]} />);
    expect(screen.getByRole("heading", { level: 3 }).innerHTML).toBe("博士");
  });

  test("渡したクラスと属性を要素に付け、文節で折るクラスも保つ", () => {
    render(
      <PhrasedText
        as="h2"
        phrases={phrases}
        className="title"
        id="result-title"
        data-heading-font="fallback"
      />,
    );
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading).toHaveClass("title");
    expect(heading.classList).toHaveLength(2);
    expect(heading).toHaveAttribute("id", "result-title");
    expect(heading).toHaveAttribute("data-heading-font", "fallback");
  });
});
