import { render, screen, fireEvent, within } from "@testing-library/react";
import { describe, it, expect } from "vitest";
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

describe("入力と結果の組み方", () => {
  it("入力欄はラベルを持ち、結果のボックスの外にある", () => {
    render(<CharCountTile />);
    const textarea = screen.getByRole("textbox", { name: "数えるテキスト" });
    expect(resultBox()).not.toContainElement(textarea);
  });

  it("ルートは枠を持たず、入力欄と結果のボックスを積むだけの div", () => {
    const { container } = render(<CharCountTile />);
    expect(container.firstElementChild?.tagName).toBe("DIV");
  });
});

describe("主役の数", () => {
  it("文字数を桁区切りと単位つきで出す", () => {
    render(<CharCountTile />);
    type("あ".repeat(1234));
    expect(within(resultBox()).getByText("1,234文字")).toBeInTheDocument();
  });

  it("桁区切りの後ろにだけ折り所を置く", () => {
    render(<CharCountTile />);
    type("a".repeat(1234567));
    const count = within(resultBox()).getByText("1,234,567文字");
    expect(count.innerHTML).toBe("1,<wbr>234,<wbr>567文字");
  });

  it("空の入力では 0文字 を出し、エラーを出さない", () => {
    render(<CharCountTile />);
    expect(within(resultBox()).getByText("0文字")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("絵文字を1文字として数える", () => {
    render(<CharCountTile />);
    type("😀");
    expect(within(resultBox()).getByText("1文字")).toBeInTheDocument();
  });
});

describe("ほかの数の表", () => {
  it("full では5つの数を並べる", () => {
    render(<CharCountTile variant="full" />);
    type("Hello World\n\nfoo");
    expect(countOf("空白を除いた文字数")).toBe("13");
    expect(countOf("UTF-8のバイト数")).toBe("16");
    expect(countOf("単語数")).toBe("3");
    expect(countOf("行数")).toBe("3");
    expect(countOf("段落数")).toBe("2");
  });

  it("variant を渡さないときは full と同じ", () => {
    render(<CharCountTile />);
    expect(
      within(resultBox())
        .getAllByRole("rowheader")
        .map((th) => th.textContent),
    ).toEqual([
      "空白を除いた文字数",
      "UTF-8のバイト数",
      "単語数",
      "行数",
      "段落数",
    ]);
  });

  it("compact ではバイト数・単語数・行数だけを並べる", () => {
    render(<CharCountTile variant="compact" />);
    expect(
      within(resultBox())
        .getAllByRole("rowheader")
        .map((th) => th.textContent),
    ).toEqual(["UTF-8のバイト数", "単語数", "行数"]);
  });

  it("名前は文節の切れ目で、値は桁区切りで折り所を持つ", () => {
    render(<CharCountTile />);
    type("あ".repeat(1000));
    const row = within(resultBox()).getByRole("rowheader", {
      name: "UTF-8のバイト数",
    });
    expect(row.innerHTML).toBe("UTF-8の<wbr>バイト数");
    expect(row.closest("tr")!.querySelector("td")!.innerHTML).toBe(
      "3,<wbr>000",
    );
  });
});

describe("読み上げ", () => {
  it("主な数をまとめた文をライブリージョンで知らせる", () => {
    render(<CharCountTile />);
    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(status).toHaveTextContent("テキストを入力してください");
    type("abc");
    expect(status).toHaveTextContent("3文字、3バイト、1行、1単語");
  });

  it("ライブリージョンは表を含まない", () => {
    render(<CharCountTile />);
    type("hello");
    const status = screen.getByRole("status");
    expect(status).not.toContainElement(resultBox());
    expect(status.textContent).not.toContain("段落数");
  });
});

describe("複数を同じページに置く", () => {
  it("id が重ならず、ラベルがそれぞれの欄に結び付く", () => {
    const { container: first } = render(<CharCountTile />);
    const { container: second } = render(<CharCountTile variant="compact" />);
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
