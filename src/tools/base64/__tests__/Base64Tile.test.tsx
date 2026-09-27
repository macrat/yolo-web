/**
 * Base64Tile のテスト
 *
 * - variant ごとに出すコントロール（向きのラジオボタン・URL-safe のチェックボックス）
 * - エンコードとデコードの変換と、向きの切り替え
 * - 結果が結果のボックス（名前を持つ region）に段落で出て、読み取り専用の入力欄に出ないこと
 * - 複数を同じページに置いたときの id の一意性と aria-describedby の結び付き
 * - デコードできない入力のエラー・ライブリージョン・コピー
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Base64Tile from "../Base64Tile";

const ENCODE_INPUT = "エンコードするテキスト";
const DECODE_INPUT = "デコードするBase64";
const ENCODED_RESULT = "エンコードしたBase64";
const DECODED_RESULT = "デコードしたテキスト";

function type(label: string, value: string): void {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

/** 結果のボックスに出た結果の文。ボックスの名前（補助情報の行）の後ろの段落。 */
function resultText(name: string): string | null {
  const region = screen.getByRole("region", { name });
  const paragraphs = region.querySelectorAll("p");
  return paragraphs[paragraphs.length - 1].textContent;
}

describe("variant=full", () => {
  it("向きのラジオボタンと URL-safe のチェックボックスを出す", () => {
    render(<Base64Tile variant="full" />);
    expect(screen.getByRole("radiogroup")).toBeInTheDocument();
    expect(screen.getByRole("checkbox")).toBeInTheDocument();
    expect(screen.getByLabelText(ENCODE_INPUT)).toBeInTheDocument();
  });

  it("variant を渡さないときは full になる", () => {
    render(<Base64Tile />);
    expect(screen.getByRole("radiogroup")).toBeInTheDocument();
  });

  it("デコードに切り替えると入力欄のラベルが変わり、デコードする", () => {
    render(<Base64Tile variant="full" />);
    fireEvent.click(screen.getByRole("radio", { name: "デコード" }));
    type(DECODE_INPUT, "SGVsbG8sIFdvcmxkIQ==");
    expect(resultText(DECODED_RESULT)).toBe("Hello, World!");
  });

  it("URL-safe のチェックボックスはエンコードの向きのときだけ出る", () => {
    render(<Base64Tile variant="full" />);
    fireEvent.click(screen.getByRole("radio", { name: "デコード" }));
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("radio", { name: "エンコード" }));
    expect(screen.getByRole("checkbox")).toBeInTheDocument();
  });
});

describe("variant=encode", () => {
  it("向きのラジオボタンを出さず、URL-safe のチェックボックスを出す", () => {
    render(<Base64Tile variant="encode" />);
    expect(screen.queryByRole("radiogroup")).not.toBeInTheDocument();
    expect(screen.getByRole("checkbox")).toBeInTheDocument();
  });

  it("テキストをエンコードする", () => {
    render(<Base64Tile variant="encode" />);
    type(ENCODE_INPUT, "Hello, World!");
    expect(resultText(ENCODED_RESULT)).toBe("SGVsbG8sIFdvcmxkIQ==");
  });

  it("日本語（UTF-8）をエンコードする", () => {
    render(<Base64Tile variant="encode" />);
    type(ENCODE_INPUT, "こんにちは");
    expect(resultText(ENCODED_RESULT)).toBe("44GT44KT44Gr44Gh44Gv");
  });

  it("URL-safe にすると + と / が - と _ になる", () => {
    render(<Base64Tile variant="encode" />);
    type(ENCODE_INPUT, ">>>");
    expect(resultText(ENCODED_RESULT)).toBe("Pj4+");
    fireEvent.click(screen.getByRole("checkbox"));
    expect(resultText(ENCODED_RESULT)).toBe("Pj4-");
  });
});

describe("variant=decode", () => {
  it("向きのラジオボタンも URL-safe のチェックボックスも出さない", () => {
    render(<Base64Tile variant="decode" />);
    expect(screen.queryByRole("radiogroup")).not.toBeInTheDocument();
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    expect(screen.getByLabelText(DECODE_INPUT)).toBeInTheDocument();
  });

  it("Base64 をデコードする", () => {
    render(<Base64Tile variant="decode" />);
    type(DECODE_INPUT, "SGVsbG8sIFdvcmxkIQ==");
    expect(resultText(DECODED_RESULT)).toBe("Hello, World!");
  });

  it("URL-safe でパディングの無い Base64 をデコードする", () => {
    render(<Base64Tile variant="decode" />);
    type(DECODE_INPUT, "Pj4-");
    expect(resultText(DECODED_RESULT)).toBe(">>>");
  });
});

describe("結果のボックス", () => {
  it("入力が空のあいだは結果のボックスを出さない", () => {
    render(<Base64Tile variant="full" />);
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
  });

  it("結果を読み取り専用の入力欄に出さない", () => {
    const { container } = render(<Base64Tile variant="encode" />);
    type(ENCODE_INPUT, "test");
    expect(container.querySelectorAll("textarea")).toHaveLength(1);
    expect(container.querySelector("[readonly]")).toBeNull();
  });

  it("コピーのボタンを結果のボックスの中に置く", () => {
    render(<Base64Tile variant="encode" />);
    type(ENCODE_INPUT, "hello");
    const region = screen.getByRole("region", { name: ENCODED_RESULT });
    expect(region).toContainElement(
      screen.getByRole("button", { name: "Base64をコピー" }),
    );
  });

  it("初めの入力から出ている結果は登場の動きを持たず、入れ直して現れた結果は持つ", () => {
    render(<Base64Tile variant="encode" defaultInput="test" />);
    const initial = screen.getByRole("region", { name: ENCODED_RESULT });
    expect(initial.className).not.toMatch(/appears/);
    type(ENCODE_INPUT, "");
    type(ENCODE_INPUT, "again");
    const reappeared = screen.getByRole("region", { name: ENCODED_RESULT });
    expect(reappeared.className).toMatch(/appears/);
  });
});

describe("id の一意性", () => {
  it("同じページに2つ置いても、どの id も重ならない", () => {
    const { container: c1 } = render(<Base64Tile variant="full" />);
    const { container: c2 } = render(<Base64Tile variant="encode" />);
    const ids1 = [...c1.querySelectorAll("[id]")].map((el) => el.id);
    const ids2 = [...c2.querySelectorAll("[id]")].map((el) => el.id);
    expect(ids1.length).toBeGreaterThan(0);
    expect(ids1.filter((id) => ids2.includes(id))).toHaveLength(0);
  });

  it("URL-safe のチェックボックスは、自分のタイルの説明を指す", () => {
    const { container: c1 } = render(<Base64Tile variant="full" />);
    const { container: c2 } = render(<Base64Tile variant="encode" />);
    for (const container of [c1, c2]) {
      const checkbox = container.querySelector('input[type="checkbox"]')!;
      const descId = checkbox.getAttribute("aria-describedby")!;
      const desc = container.querySelector(`#${CSS.escape(descId)}`);
      expect(desc?.textContent).toContain("JWT");
    }
  });
});

describe("エラーとライブリージョン", () => {
  it("デコードできない入力では、入力欄の直下に日本語の理由を出し、結果を出さない", () => {
    render(<Base64Tile variant="decode" />);
    type(DECODE_INPUT, "!@#$%");
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Base64 として読めない文字列です",
    );
    expect(screen.getByLabelText(DECODE_INPUT)).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
  });

  it("結果が出たことをライブリージョンで知らせる", () => {
    render(<Base64Tile variant="full" />);
    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-live", "polite");
    type(ENCODE_INPUT, "test");
    expect(status).toHaveTextContent("エンコードしました");
  });

  it("デコードの結果もライブリージョンで知らせる", () => {
    render(<Base64Tile variant="decode" />);
    type(DECODE_INPUT, "dGVzdA");
    expect(screen.getByRole("status")).toHaveTextContent("デコードしました");
  });
});

describe("コピー", () => {
  it("押すと面の字が「コピー済み」になる", async () => {
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      writable: true,
      configurable: true,
    });
    render(<Base64Tile variant="encode" />);
    type(ENCODE_INPUT, "test");
    const copyButton = screen.getByRole("button", { name: "Base64をコピー" });
    fireEvent.click(copyButton);
    await waitFor(() => {
      expect(copyButton).toHaveTextContent("コピー済み");
    });
  });

  it("navigator.clipboard の無い環境でも、押して例外を投げない", async () => {
    const originalClipboard = navigator.clipboard;
    Object.defineProperty(navigator, "clipboard", {
      value: undefined,
      writable: true,
      configurable: true,
    });
    render(<Base64Tile variant="decode" />);
    type(DECODE_INPUT, "dGVzdA");
    const copyButton = screen.getByRole("button", { name: "テキストをコピー" });
    await expect(async () => {
      fireEvent.click(copyButton);
      await new Promise((resolve) => setTimeout(resolve, 10));
    }).not.toThrow();
    Object.defineProperty(navigator, "clipboard", {
      value: originalClipboard,
      writable: true,
      configurable: true,
    });
  });
});
