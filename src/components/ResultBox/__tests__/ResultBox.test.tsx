import { act, createRef } from "react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { hydrateRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import ResultBox from "@/components/ResultBox";
import { revealFocusedFrame } from "@/lib/reveal";

vi.mock("@/lib/reveal", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/reveal")>()),
  revealFocusedFrame: vi.fn(),
}));

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

  test("見出しの読み方は、見出しのすぐ下の頭の行に置き、見出しの名前には入れない", () => {
    render(
      <ResultBox
        caption="日本の伝統色診断の結果"
        heading={{ phrases: ["藍色"], reading: "あいいろ" }}
      >
        <p>説明</p>
      </ResultBox>,
    );
    const heading = screen.getByRole("heading", { level: 2, name: "藍色" });
    const reading = screen.getByText("あいいろ");
    expect(heading.nextElementSibling).toBe(reading);
    expect(
      reading.compareDocumentPosition(screen.getByText("説明")) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(screen.getByRole("region", { name: "藍色" })).toBeInTheDocument();
  });

  test("読み方を渡さなければ、見出しのあとに読みの行を持たない", () => {
    render(
      <ResultBox heading={{ phrases }}>
        <p>説明</p>
      </ResultBox>,
    );
    expect(
      screen.getByRole("heading", { level: 2 }).nextElementSibling,
    ).toBeNull();
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

  test("操作に応えて現れたと渡されたボックスだけが登場の動きを持つ", () => {
    render(
      <ResultBox caption="数えた結果" appear>
        <p>1</p>
      </ResultBox>,
    );
    expect(
      screen.getByRole("region", { name: "数えた結果" }).className,
    ).toMatch(/appears/);
  });

  test("ブラウザで新しく描いても、渡されなければ登場の動きを持たない（リンクで移ってきたページ）", () => {
    render(
      <ResultBox caption="初めからある結果">
        <p>1</p>
      </ResultBox>,
    );
    expect(
      screen.getByRole("region", { name: "初めからある結果" }).className,
    ).not.toMatch(/appears/);
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
    const actEnvironment = globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean };
    const previousActEnvironment = actEnvironment.IS_REACT_ACT_ENVIRONMENT;
    actEnvironment.IS_REACT_ACT_ENVIRONMENT = true;
    const errors = vi.spyOn(console, "error").mockImplementation(() => {});
    let root: Root | undefined;
    try {
      root = await act(async () => hydrateRoot(container, element));
      expect(errors).not.toHaveBeenCalled();
      expect(container.querySelector("section")!.className).not.toMatch(
        /appears/,
      );
    } finally {
      errors.mockRestore();
      if (root) act(() => root!.unmount());
      container.remove();
      actEnvironment.IS_REACT_ACT_ENVIRONMENT = previousActEnvironment;
    }
  });

  test("横に送る枠は、中身がはみ出すときだけ Tab で止まり、名前を持つ", () => {
    // 中身（pre）の幅が、枠（中身の区画）の幅を超える。
    const rect = vi
      .spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockImplementation(function (this: HTMLElement) {
        return { width: this.tagName === "PRE" ? 500 : 300 } as DOMRect;
      });
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
    rect.mockRestore();
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

  describe("キーボードで中身の区画に着いたとき", () => {
    beforeEach(() => {
      vi.mocked(revealFocusedFrame).mockClear();
    });

    interface Arrival {
      /** キーボードで着いたか（:focus-visible）。 */
      keyboard: boolean;
      /** フォーカスがどこから来たか。 */
      from: "before" | "after" | "copy";
    }

    function arrive({ keyboard, from }: Arrival) {
      const onFocus = vi.fn();
      render(
        <>
          <button type="button">前</button>
          <ResultBox
            caption="整形したJSON"
            kind="code"
            onFocus={onFocus}
            copyButton={<button type="button">コピー</button>}
          >
            <pre>code</pre>
          </ResultBox>
          <button type="button">後</button>
        </>,
      );
      const box = screen.getByRole("region", { name: "整形したJSON" });
      const region = screen.getByText("code").parentElement!;
      region.tabIndex = 0;
      const matches = region.matches.bind(region);
      vi.spyOn(region, "matches").mockImplementation((selector) =>
        selector === ":focus-visible" ? keyboard : matches(selector),
      );
      const names = { before: "前", after: "後", copy: "コピー" } as const;
      const previous = screen.getByRole("button", { name: names[from] });
      if (from === "copy") {
        fireEvent.focus(previous);
      } else {
        fireEvent.focus(region, { relatedTarget: previous });
      }
      return { box, onFocus };
    }

    test("前から着くと、前から着いたとして送り直しを頼む", () => {
      const { box, onFocus } = arrive({ keyboard: true, from: "before" });
      expect(revealFocusedFrame).toHaveBeenCalledWith(
        box,
        false,
        expect.any(Number),
      );
      expect(onFocus).toHaveBeenCalledTimes(1);
    });

    test("後ろから戻ってくると、後ろから着いたとして送り直しを頼む", () => {
      const { box } = arrive({ keyboard: true, from: "after" });
      expect(revealFocusedFrame).toHaveBeenCalledWith(
        box,
        true,
        expect.any(Number),
      );
    });

    test("マウスで押して着いたときは、押した所を動かさない", () => {
      arrive({ keyboard: false, from: "before" });
      expect(revealFocusedFrame).not.toHaveBeenCalled();
    });

    test("コピーのボタンに着いたときは何もしない", () => {
      const { onFocus } = arrive({ keyboard: true, from: "copy" });
      expect(revealFocusedFrame).not.toHaveBeenCalled();
      expect(onFocus).toHaveBeenCalledTimes(1);
    });
  });

  describe("Tab を押した時点の位置を覚える受け手", () => {
    function keydownListeners(spy: { mock: { calls: unknown[][] } }): number {
      return spy.mock.calls.filter((call) => call[0] === "keydown").length;
    }

    test("横に送る区画を持つボックスだけが置き、外すときに外す", () => {
      const add = vi.spyOn(window, "addEventListener");
      const remove = vi.spyOn(window, "removeEventListener");
      const { unmount } = render(
        <ResultBox caption="整形したJSON" kind="code">
          <pre>code</pre>
        </ResultBox>,
      );
      expect(keydownListeners(add)).toBe(1);
      expect(keydownListeners(remove)).toBe(0);
      unmount();
      expect(keydownListeners(remove)).toBe(1);
      const added = add.mock.calls.find(([type]) => type === "keydown");
      const removed = remove.mock.calls.find(([type]) => type === "keydown");
      expect(removed?.[1]).toBe(added?.[1]);
      add.mockRestore();
      remove.mockRestore();
    });

    test("区画を持たないボックスは置かない", () => {
      const add = vi.spyOn(window, "addEventListener");
      render(
        <ResultBox caption="文字数の結果">
          <p>1,234文字</p>
        </ResultBox>,
      );
      expect(keydownListeners(add)).toBe(0);
      add.mockRestore();
    });
  });
});
