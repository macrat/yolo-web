import { act, render, screen, fireEvent, within } from "@testing-library/react";
import { afterEach, describe, it, expect, vi } from "vitest";
import CharCountTile from "../CharCountTile";

function type(value: string) {
  fireEvent.change(screen.getByRole("textbox", { name: "数えるテキスト" }), {
    target: { value },
  });
}

function resultBox() {
  return screen.getByRole("region", { name: "数えた結果" });
}

/** 表の行の名前（見出しのセル）から、その行の値を引く。 */
function countOf(label: string): string {
  const row = within(resultBox()).getByRole("rowheader", { name: label });
  return row.closest("tr")!.querySelector("td")!.textContent ?? "";
}

/** 要素の中の字を、<wbr> の所を「|」にして並べる。どこで折れうるかを見る。 */
function withBreaks(element: Element): string {
  return [...element.childNodes]
    .map((node) => (node.nodeName === "WBR" ? "|" : (node.textContent ?? "")))
    .join("");
}

afterEach(() => {
  vi.useRealTimers();
});

describe("入力と結果の組み方", () => {
  it("入力欄はラベルを持ち、結果のボックスの外にある", () => {
    render(<CharCountTile />);
    const textarea = screen.getByRole("textbox", { name: "数えるテキスト" });
    expect(resultBox()).not.toContainElement(textarea);
  });
});

describe("主役の数", () => {
  it("文字数を桁区切りと単位つきで出す", () => {
    render(<CharCountTile />);
    type("あ".repeat(1234));
    expect(within(resultBox()).getByText("1,234文字")).toBeInTheDocument();
  });

  it("桁区切りの後ろにだけ折り所を置き、単位は数から離さない", () => {
    render(<CharCountTile />);
    type("a".repeat(1234567));
    const count = within(resultBox()).getByText("1,234,567文字");
    expect(withBreaks(count)).toBe("1,|234,|567文字");
  });

  it("空の入力では 0文字 を出し、エラーを出さない", () => {
    render(<CharCountTile />);
    expect(within(resultBox()).getByText("0文字")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it.each([
    ["😀", "絵文字"],
    ["👨‍👩‍👧", "ZWJ でつないだ絵文字"],
    ["🇯🇵", "国旗"],
    ["👍🏽", "肌の色つきの絵文字"],
    ["が", "濁点を分けて書いた「が」"],
  ])("%s（%s）を1文字として数える", (text) => {
    render(<CharCountTile />);
    type(text);
    expect(within(resultBox()).getByText("1文字")).toBeInTheDocument();
  });
});

describe("ほかの数の表", () => {
  it("5つの数を、この順で並べる", () => {
    render(<CharCountTile />);
    expect(
      within(resultBox())
        .getAllByRole("rowheader")
        .map((th) => th.textContent),
    ).toEqual([
      "空白と改行を除いた文字数",
      "UTF-8のバイト数",
      "単語数",
      "行数",
      "段落数",
    ]);
  });

  it("入力に合わせてそれぞれの数を出す", () => {
    render(<CharCountTile />);
    type("Hello World\n\nfoo");
    expect(countOf("空白と改行を除いた文字数")).toBe("13");
    expect(countOf("UTF-8のバイト数")).toBe("16");
    expect(countOf("単語数")).toBe("3");
    expect(countOf("行数")).toBe("3");
    expect(countOf("段落数")).toBe("2");
  });

  it("空白と改行を除いた文字数は、空白・全角の空白・タブ・改行を数えない", () => {
    render(<CharCountTile />);
    type("a b　c\td\n\ne");
    expect(countOf("空白と改行を除いた文字数")).toBe("5");
  });

  it("名前は文節の切れ目で、値は桁区切りで折り所を持つ", () => {
    render(<CharCountTile />);
    type("あ".repeat(1000));
    const row = within(resultBox()).getByRole("rowheader", {
      name: "UTF-8のバイト数",
    });
    expect(withBreaks(row)).toBe("UTF-8の|バイト数");
    expect(withBreaks(row.closest("tr")!.querySelector("td")!)).toBe("3,|000");
  });
});

describe("読み上げ", () => {
  it("打つ手が止まってから、主な数をまとめた文を1度だけ知らせる", () => {
    vi.useFakeTimers();
    render(<CharCountTile />);
    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(status).toHaveTextContent("テキストを入力してください");

    type("a");
    act(() => vi.advanceTimersByTime(300));
    type("ab");
    act(() => vi.advanceTimersByTime(300));
    type("abc");
    // 打っているあいだは、前に知らせた文のまま変えない。
    expect(status).toHaveTextContent("テキストを入力してください");

    act(() => vi.advanceTimersByTime(1000));
    expect(status).toHaveTextContent("3文字、3バイト、1行、1単語");
  });

  it("表示の数は、知らせを待たずに打つたびに変わる", () => {
    vi.useFakeTimers();
    render(<CharCountTile />);
    type("abc");
    expect(within(resultBox()).getByText("3文字")).toBeInTheDocument();
  });

  it("知らせの文は表の数を含まない", () => {
    vi.useFakeTimers();
    render(<CharCountTile />);
    type("hello\n\nworld");
    act(() => vi.advanceTimersByTime(1000));
    const status = screen.getByRole("status");
    expect(status.textContent).not.toContain("段落");
    expect(status.querySelector("table")).toBeNull();
  });
});

describe("複数を同じページに置く", () => {
  it("id が重ならず、ラベルがそれぞれの欄に結び付く", () => {
    const { container: first } = render(<CharCountTile />);
    const { container: second } = render(<CharCountTile />);
    const ids = (root: HTMLElement) =>
      [...root.querySelectorAll("[id]")].map((element) => element.id);
    expect(ids(first).filter((id) => ids(second).includes(id))).toHaveLength(0);
    expect(
      screen.getAllByRole("textbox", { name: "数えるテキスト" }),
    ).toHaveLength(2);
  });
});

describe("コピー", () => {
  it("コピーのボタンを持たない（数は写して使う値でなく、読んで知るもの）", () => {
    render(<CharCountTile />);
    expect(
      screen.queryByRole("button", { name: /コピー/ }),
    ).not.toBeInTheDocument();
  });
});
