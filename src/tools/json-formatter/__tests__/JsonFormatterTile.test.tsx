import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import JsonFormatterTile from "../JsonFormatterTile";

// クリップボードの API を持つ端末にする。
const writeText = vi.fn();

beforeEach(() => {
  vi.stubGlobal("navigator", { ...navigator, clipboard: { writeText } });
  writeText.mockReset();
  writeText.mockResolvedValue(undefined);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function enter(value: string): void {
  fireEvent.change(screen.getByLabelText("JSON"), { target: { value } });
}

function press(name: string): void {
  fireEvent.click(screen.getByRole("button", { name }));
}

function resultRegion(name: string): HTMLElement {
  return screen.getByRole("region", { name });
}

describe("JsonFormatterTile", () => {
  describe("入力と操作", () => {
    test("JSON の欄とインデントの欄がラベルを持つ", () => {
      render(<JsonFormatterTile />);
      expect(screen.getByLabelText("JSON").tagName).toBe("TEXTAREA");
      expect(screen.getByLabelText("インデント").tagName).toBe("SELECT");
    });

    test("入力は太い枠の結果のボックスに入らない", () => {
      render(<JsonFormatterTile />);
      enter('{"a":1}');
      press("整形");
      expect(screen.getByLabelText("JSON").closest("section")).toBeNull();
    });

    test("操作する前は結果のボックスを持たない", () => {
      render(<JsonFormatterTile />);
      expect(screen.queryByRole("region")).not.toBeInTheDocument();
    });

    test("format-only は整形だけを持つ", () => {
      render(<JsonFormatterTile variant="format-only" />);
      expect(screen.getByRole("button", { name: "整形" })).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "圧縮" }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "検証" }),
      ).not.toBeInTheDocument();
      expect(screen.getByLabelText("インデント")).toBeInTheDocument();
    });
  });

  describe("整形", () => {
    test("既定の2スペースで整形し、結果をコードで出す", () => {
      render(<JsonFormatterTile />);
      enter('{"x":1}');
      press("整形");
      const region = resultRegion("整形した JSON");
      expect(region.querySelector("pre code")?.textContent).toBe(
        '{\n  "x": 1\n}',
      );
    });

    test("インデントを4スペースにすると、4スペースで整形する", () => {
      render(<JsonFormatterTile />);
      fireEvent.change(screen.getByLabelText("インデント"), {
        target: { value: "4" },
      });
      enter('{"x":1}');
      press("整形");
      expect(
        resultRegion("整形した JSON").querySelector("code")?.textContent,
      ).toBe('{\n    "x": 1\n}');
    });

    test("整形したことを読み上げで知らせる", () => {
      render(<JsonFormatterTile />);
      enter('{"a":1}');
      press("整形");
      expect(screen.getByRole("status")).toHaveTextContent("整形しました");
    });

    test("format-only でも整形できる", () => {
      render(<JsonFormatterTile variant="format-only" />);
      enter('{"x":1}');
      press("整形");
      expect(
        resultRegion("整形した JSON").querySelector("code")?.textContent,
      ).toBe('{\n  "x": 1\n}');
    });
  });

  describe("圧縮", () => {
    test("空白を除いた1行のコードを出す", () => {
      render(<JsonFormatterTile />);
      enter('{\n  "a": 1,\n  "b": 2\n}');
      press("圧縮");
      expect(
        resultRegion("圧縮した JSON").querySelector("code")?.textContent,
      ).toBe('{"a":1,"b":2}');
      expect(screen.getByRole("status")).toHaveTextContent("圧縮しました");
    });
  });

  describe("検証", () => {
    test("正しい JSON なら、日本語の文で結果を出し、コピーのボタンを持たない", () => {
      render(<JsonFormatterTile />);
      enter('{"key": "value"}');
      press("検証");
      const region = resultRegion("検証の結果");
      expect(region).toHaveTextContent("正しいJSONです。");
      expect(region.querySelector("pre")).toBeNull();
      expect(
        screen.queryByRole("button", { name: /コピー/ }),
      ).not.toBeInTheDocument();
      expect(screen.getByRole("status")).toHaveTextContent("正しいJSONです");
    });
  });

  describe("エラー", () => {
    test.each(["整形", "圧縮", "検証"])(
      "%s で形式の誤りを日本語の文で欄の直下に言い、欄をエラーにする",
      (operation) => {
        render(<JsonFormatterTile />);
        enter("{invalid}");
        press(operation);
        const alert = screen.getByRole("alert");
        expect(alert.textContent).toMatch(/^JSONの形式が正しくありません。/);
        expect(alert.textContent).not.toMatch(
          /Expected|Unexpected|position|at line|column/i,
        );
        const field = screen.getByLabelText("JSON");
        expect(field).toHaveAttribute("aria-invalid", "true");
        expect(field.getAttribute("aria-describedby")).toBe(alert.id);
        expect(screen.queryByRole("region")).not.toBeInTheDocument();
      },
    );

    test("空のまま押すと、JSON を入れるよう言う", () => {
      render(<JsonFormatterTile />);
      press("整形");
      expect(screen.getByRole("alert")).toHaveTextContent(
        "JSONを入力してください。",
      );
    });

    test("正しい JSON で操作し直すと、エラーが消えて結果が出る", () => {
      render(<JsonFormatterTile />);
      enter("{invalid}");
      press("整形");
      expect(screen.getByRole("alert")).toBeInTheDocument();
      enter('{"a":1}');
      press("整形");
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      expect(screen.getByLabelText("JSON")).not.toHaveAttribute("aria-invalid");
      expect(resultRegion("整形した JSON")).toBeInTheDocument();
    });

    test("エラーになると、前の結果を消す", () => {
      render(<JsonFormatterTile />);
      enter('{"a":1}');
      press("整形");
      enter("{invalid}");
      press("整形");
      expect(screen.queryByRole("region")).not.toBeInTheDocument();
    });
  });

  describe("コピー", () => {
    test("コピーのボタンは結果のボックスの頭の行にあり、結果のコードを写す", async () => {
      render(<JsonFormatterTile />);
      enter('{"a":1}');
      press("整形");
      const region = resultRegion("整形した JSON");
      const copyButton = screen.getByRole("button", {
        name: "整形した JSONをコピー",
      });
      const head = region.firstElementChild as HTMLElement;
      expect(head.contains(copyButton)).toBe(true);
      expect(head.querySelector("pre")).toBeNull();
      fireEvent.click(copyButton);
      await waitFor(() => expect(copyButton).toHaveTextContent("コピー済み"));
      expect(writeText).toHaveBeenCalledWith('{\n  "a": 1\n}');
    });

    test("圧縮した結果は「圧縮した JSON」として写す", () => {
      render(<JsonFormatterTile />);
      enter('{"a": 1}');
      press("圧縮");
      expect(
        screen.getByRole("button", { name: "圧縮した JSONをコピー" }),
      ).toBeInTheDocument();
    });
  });

  describe("結果が出たときの送り", () => {
    function stubBottom(bottom: number): void {
      vi.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue({
        bottom,
      } as DOMRect);
    }

    beforeEach(() => {
      vi.stubGlobal("visualViewport", undefined);
      vi.stubGlobal("innerHeight", 600);
      vi.stubGlobal("scrollBy", vi.fn());
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    test("コピーのボタンが画面の下にはみ出すと、入るまで即時に送る", () => {
      stubBottom(700.4);
      render(<JsonFormatterTile />);
      enter('{"a":1}');
      press("整形");
      expect(window.scrollBy).toHaveBeenCalledWith({
        top: 101,
        behavior: "instant",
      });
    });

    test("コピーのボタンが画面に入っていれば送らない", () => {
      stubBottom(500);
      render(<JsonFormatterTile />);
      enter('{"a":1}');
      press("整形");
      expect(window.scrollBy).not.toHaveBeenCalled();
    });
  });

  describe("同じページに複数置く", () => {
    test("id が重ならず、ラベルがそれぞれの欄を指す", () => {
      render(
        <div>
          <JsonFormatterTile variant="full" />
          <JsonFormatterTile variant="format-only" />
        </div>,
      );
      const ids = Array.from(document.querySelectorAll("[id]")).map(
        (el) => el.id,
      );
      expect(new Set(ids).size).toBe(ids.length);
      expect(screen.getAllByLabelText("JSON")).toHaveLength(2);
      expect(screen.getAllByLabelText("インデント")).toHaveLength(2);
    });
  });
});
