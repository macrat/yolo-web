import { createRef } from "react";
import { describe, expect, test } from "vitest";
import { render, screen, within } from "@testing-library/react";
import ResultBox from "@/components/ResultBox";

const phrases = ["先頭を", "走りながら", "「全員来てるか！」と"];

describe("ResultBox", () => {
  test("結果の見出しを名前に持つ region になる", () => {
    render(
      <ResultBox caption="あなたに似たキャラ診断の結果" heading={{ phrases }}>
        <p>説明</p>
      </ResultBox>,
    );
    const region = screen.getByRole("region", { name: phrases.join("") });
    expect(region.tagName).toBe("SECTION");
    expect(within(region).getByRole("heading", { level: 2 }).innerHTML).toBe(
      phrases.join("<wbr>"),
    );
  });

  test("見出しを持たない結果は、補助情報の行を名前に持つ", () => {
    render(
      <ResultBox caption="文字数の結果">
        <p>1,234文字</p>
      </ResultBox>,
    );
    expect(
      screen.getByRole("region", { name: "文字数の結果" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("heading")).toBeNull();
  });

  test("見出しの段を変えられる", () => {
    render(
      <ResultBox heading={{ phrases, level: 3 }}>
        <p>説明</p>
      </ResultBox>,
    );
    expect(screen.getByRole("heading", { level: 3 })).toBeInTheDocument();
  });

  test("コピーのボタンは頭の行にあり、結果の中身より前にある", () => {
    render(
      <ResultBox caption="整形した JSON" copyButton={<button>コピー</button>}>
        <pre>
          <code>{"{}"}</code>
        </pre>
      </ResultBox>,
    );
    const button = screen.getByRole("button", { name: "コピー" });
    const code = screen.getByText("{}");
    expect(
      button.compareDocumentPosition(code) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  test("中身の形のクラスを持ち、形を持たないボックスは持たない", () => {
    render(
      <ResultBox caption="コード" kind="code">
        <pre>code</pre>
      </ResultBox>,
    );
    render(
      <ResultBox caption="数字">
        <p>1</p>
      </ResultBox>,
    );
    expect(screen.getByRole("region", { name: "コード" }).className).toMatch(
      /code/,
    );
    expect(screen.getByRole("region", { name: "数字" }).className).not.toMatch(
      /code|table/,
    );
  });

  test("結果に着いたときにフォーカスを移せるよう、ref と tabIndex を section に渡す", () => {
    const ref = createRef<HTMLElement>();
    render(
      <ResultBox caption="結果" ref={ref} tabIndex={-1}>
        <p>1</p>
      </ResultBox>,
    );
    expect(ref.current).toBe(screen.getByRole("region", { name: "結果" }));
    ref.current?.focus();
    expect(document.activeElement).toBe(ref.current);
  });
});
