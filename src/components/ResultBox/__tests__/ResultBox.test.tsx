import { act, createRef } from "react";
import { describe, expect, test, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
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

  test("ブラウザで新しく描いたボックスは登場の動きを持つ", () => {
    render(
      <ResultBox caption="結果">
        <p>1</p>
      </ResultBox>,
    );
    expect(screen.getByRole("region", { name: "結果" }).className).toMatch(
      /appears/,
    );
  });

  test("サーバーの HTML に初めからあるボックスは、水和のあとも登場の動きを持たない", async () => {
    const element = (
      <ResultBox caption="結果">
        <p>1</p>
      </ResultBox>
    );
    const container = document.createElement("div");
    container.innerHTML = renderToString(element);
    document.body.appendChild(container);
    expect(container.querySelector("section")!.className).not.toMatch(
      /appears/,
    );

    const actEnvironment = globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean };
    const previousActEnvironment = actEnvironment.IS_REACT_ACT_ENVIRONMENT;
    actEnvironment.IS_REACT_ACT_ENVIRONMENT = true;
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});
    const root = await act(async () => hydrateRoot(container, element));
    expect(errors).not.toHaveBeenCalled();
    expect(container.querySelector("section")!.className).not.toMatch(
      /appears/,
    );
    errors.mockRestore();
    act(() => root.unmount());
    container.remove();
    actEnvironment.IS_REACT_ACT_ENVIRONMENT = previousActEnvironment;
  });

  test("横に送る枠は、中身がはみ出すときだけ Tab で止まり、名前を持つ", () => {
    const scrollWidth = vi
      .spyOn(HTMLElement.prototype, "scrollWidth", "get")
      .mockReturnValue(500);
    const clientWidth = vi
      .spyOn(HTMLElement.prototype, "clientWidth", "get")
      .mockReturnValue(300);
    render(
      <ResultBox caption="整形した JSON" kind="code">
        <pre>code</pre>
      </ResultBox>,
    );
    const frame = screen.getByRole("region", {
      name: "コード（横にスクロールできます）",
    });
    expect(frame.tabIndex).toBe(0);
    expect(frame).toContainElement(screen.getByText("code"));
    scrollWidth.mockRestore();
    clientWidth.mockRestore();
  });

  test("中身がはみ出さない表の枠は、Tab で止まらず名前も持たない", () => {
    render(
      <ResultBox caption="年齢の計算の結果" kind="table">
        <table>
          <tbody>
            <tr>
              <td>34歳</td>
            </tr>
          </tbody>
        </table>
      </ResultBox>,
    );
    const frame = screen.getByRole("table").parentElement!;
    expect(frame.hasAttribute("tabindex")).toBe(false);
    expect(frame.hasAttribute("aria-label")).toBe(false);
  });
});
