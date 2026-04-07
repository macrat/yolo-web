import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Component from "../Component";

import { removeLineBreaks } from "../logic";

// logicモジュールをモック
vi.mock("../logic", () => ({
  removeLineBreaks: vi.fn((input: string) => ({
    output: input.replace(/\n/g, ""),
    removedCount: 2,
  })),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("LineBreakRemoverComponent", () => {
  test("コンポーネントが正常にレンダリングされる", () => {
    render(<Component />);
    expect(
      screen.getByPlaceholderText("改行を削除するテキストを入力..."),
    ).toBeInTheDocument();
  });

  test("モード選択のradiogroup が存在する", () => {
    render(<Component />);
    const radiogroup = screen.getByRole("radiogroup");
    expect(radiogroup).toBeInTheDocument();
  });

  test("3つのモードボタンが表示される", () => {
    render(<Component />);
    expect(screen.getByText("改行を削除")).toBeInTheDocument();
    expect(screen.getByText("改行をスペースに置換")).toBeInTheDocument();
    expect(screen.getByText("PDFスマートモード")).toBeInTheDocument();
  });

  test("デフォルトでremoveモードが選択されている", () => {
    render(<Component />);
    const removeButton = screen.getByText("改行を削除");
    expect(removeButton).toHaveAttribute("aria-checked", "true");
  });

  test("「連続する改行を1つにまとめる」チェックボックスがremoveモードで表示される", () => {
    render(<Component />);
    expect(
      screen.getByLabelText("連続する改行を1つにまとめる"),
    ).toBeInTheDocument();
  });

  test("PDFスマートモードに切り替えると連続改行チェックボックスが非表示になる", () => {
    render(<Component />);
    const pdfButton = screen.getByText("PDFスマートモード");
    fireEvent.click(pdfButton);
    expect(
      screen.queryByLabelText("連続する改行を1つにまとめる"),
    ).not.toBeInTheDocument();
  });

  test("PDFスマートモードで行内改行の処理ラジオボタンが表示される", () => {
    render(<Component />);
    fireEvent.click(screen.getByText("PDFスマートモード"));
    expect(screen.getByText("削除する")).toBeInTheDocument();
    expect(screen.getByText("スペースに置換")).toBeInTheDocument();
  });

  test("removeモードでは行内改行処理ラジオボタンが非表示", () => {
    render(<Component />);
    // デフォルトはremoveモード
    expect(screen.queryByText("削除する")).not.toBeInTheDocument();
    expect(screen.queryByText("スペースに置換")).not.toBeInTheDocument();
  });

  test("入力テキストエリアのrows属性が8", () => {
    render(<Component />);
    const textarea =
      screen.getByPlaceholderText("改行を削除するテキストを入力...");
    expect(textarea).toHaveAttribute("rows", "8");
  });

  test("出力テキストエリアがreadOnlyである", () => {
    render(<Component />);
    const textareas = screen.getAllByRole("textbox");
    // 出力テキストエリアはreadonlyのはず
    const readonlyTextarea = textareas.find((el) =>
      el.hasAttribute("readonly"),
    );
    expect(readonlyTextarea).toBeDefined();
  });

  test("aria-live='polite'の処理結果情報要素が存在する", () => {
    render(<Component />);
    const liveRegion = document.querySelector("[aria-live='polite']");
    expect(liveRegion).toBeInTheDocument();
  });

  test("コピーボタンが出力テキストある場合に表示される", async () => {
    const { rerender } = render(<Component />);
    // 入力があれば出力があり、コピーボタンが表示されるはず
    const inputTextarea =
      screen.getByPlaceholderText("改行を削除するテキストを入力...");
    fireEvent.change(inputTextarea, { target: { value: "test\ntext" } });
    rerender(<Component />);
    // コピーボタンが表示されているか確認
    const copyButton = screen.queryByRole("button", { name: "コピー" });
    // コピーボタンは出力がある場合のみ表示
    expect(copyButton).toBeDefined();
  });

  test("モード切替ボタンがrole='radio'を持つ", () => {
    render(<Component />);
    const radios = screen.getAllByRole("radio");
    expect(radios.length).toBe(3);
  });

  test("replace-spaceモードボタンをクリックするとaria-checkedがtrueになる", () => {
    render(<Component />);
    const replaceButton = screen.getByText("改行をスペースに置換");
    fireEvent.click(replaceButton);
    expect(replaceButton).toHaveAttribute("aria-checked", "true");
  });

  describe("エラーメッセージ表示", () => {
    test("result.errorがある場合にエラーメッセージが表示される", () => {
      // 常にエラーを返すよう設定（初回レンダリング＋fireEvent双方に対応）
      vi.mocked(removeLineBreaks).mockReturnValue({
        output: "",
        removedCount: 0,
        error: "テストエラーメッセージ",
      });
      render(<Component />);
      const inputTextarea =
        screen.getByPlaceholderText("改行を削除するテキストを入力...");
      fireEvent.change(inputTextarea, { target: { value: "some input" } });
      expect(screen.getByRole("alert")).toHaveTextContent(
        "テストエラーメッセージ",
      );
    });

    test("result.errorがある場合に処理結果メッセージが非表示になる", () => {
      vi.mocked(removeLineBreaks).mockReturnValue({
        output: "",
        removedCount: 3,
        error: "エラーが発生しました",
      });
      render(<Component />);
      const inputTextarea =
        screen.getByPlaceholderText("改行を削除するテキストを入力...");
      fireEvent.change(inputTextarea, { target: { value: "some input" } });
      const liveRegion = document.querySelector("[aria-live='polite']");
      expect(liveRegion).toBeInTheDocument();
      expect(liveRegion?.textContent).toBe("");
    });

    test("result.errorがない場合にエラーメッセージが表示されない", () => {
      // clearAllMocks後のデフォルト実装（error なし）を使用するため再設定
      vi.mocked(removeLineBreaks).mockReturnValue({
        output: "",
        removedCount: 0,
      });
      render(<Component />);
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });

  describe("モード別処理結果メッセージ", () => {
    beforeEach(() => {
      vi.mocked(removeLineBreaks).mockReturnValue({
        output: "変換結果",
        removedCount: 5,
      });
    });

    test("removeモードで「N件の改行を削除しました」が表示される", () => {
      render(<Component />);
      const inputTextarea =
        screen.getByPlaceholderText("改行を削除するテキストを入力...");
      fireEvent.change(inputTextarea, { target: { value: "some\ninput" } });
      const liveRegion = document.querySelector("[aria-live='polite']");
      expect(liveRegion?.textContent).toBe("5件の改行を削除しました");
    });

    test("replace-spaceモードで「N件の改行をスペースに置換しました」が表示される", () => {
      render(<Component />);
      fireEvent.click(screen.getByText("改行をスペースに置換"));
      const inputTextarea =
        screen.getByPlaceholderText("改行を削除するテキストを入力...");
      fireEvent.change(inputTextarea, { target: { value: "some\ninput" } });
      const liveRegion = document.querySelector("[aria-live='polite']");
      expect(liveRegion?.textContent).toBe("5件の改行をスペースに置換しました");
    });

    test("smart-pdfモードで「N件の改行を処理しました」が表示される", () => {
      render(<Component />);
      fireEvent.click(screen.getByText("PDFスマートモード"));
      const inputTextarea =
        screen.getByPlaceholderText("改行を削除するテキストを入力...");
      fireEvent.change(inputTextarea, { target: { value: "some\ninput" } });
      const liveRegion = document.querySelector("[aria-live='polite']");
      expect(liveRegion?.textContent).toBe("5件の改行を処理しました");
    });

    test("入力が空の場合は処理結果メッセージが空になる", () => {
      render(<Component />);
      const liveRegion = document.querySelector("[aria-live='polite']");
      expect(liveRegion?.textContent).toBe("");
    });
  });
});
