/**
 * Base64Tile のテスト
 *
 * - エンコードとデコードの変換と、向きを切り替えたときに結果を入力へ移すこと
 * - 結果が結果のボックス（名前を持つ region）に段落で出て、読み取り専用の入力欄に出ないこと
 * - エンコードの結果だけが、全体を1語として字のあいだのどこでも折る組みを持つこと
 * - 打ちかけの入力のあいだは理由の文を出さず、手が止まってから出すこと
 * - 理由の文・ライブリージョン・コピー・結果を画面に入れる送り
 */
import {
  act,
  render,
  screen,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import { revealResult } from "@/lib/reveal";
import Base64Tile, { TYPING_PAUSE_MS } from "../Base64Tile";

vi.mock("@/lib/reveal", () => ({ revealResult: vi.fn() }));

const ENCODE_INPUT = "エンコードするテキスト";
const DECODE_INPUT = "デコードするBase64";
const ENCODED_RESULT = "エンコードしたBase64";
const DECODED_RESULT = "デコードしたテキスト";

beforeEach(() => {
  vi.mocked(revealResult).mockClear();
});

function type(label: string, value: string): void {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

function chooseDecode(): void {
  fireEvent.click(screen.getByRole("radio", { name: "デコード" }));
}

/** 結果のボックスの、結果の文の段落。ボックスの名前（補助情報の行）の後ろの段落。 */
function resultParagraph(name: string): HTMLParagraphElement {
  const region = screen.getByRole("region", { name });
  const paragraphs = region.querySelectorAll("p");
  return paragraphs[paragraphs.length - 1];
}

function resultText(name: string): string | null {
  return resultParagraph(name).textContent;
}

describe("エンコード", () => {
  it("はじめはエンコードの向きで、URL-safe のチェックボックスを出す", () => {
    render(<Base64Tile />);
    expect(screen.getByRole("radio", { name: "エンコード" })).toBeChecked();
    expect(screen.getByRole("checkbox")).toBeInTheDocument();
    expect(screen.getByLabelText(ENCODE_INPUT)).toBeInTheDocument();
  });

  it("テキストをエンコードする", () => {
    render(<Base64Tile />);
    type(ENCODE_INPUT, "Hello, World!");
    expect(resultText(ENCODED_RESULT)).toBe("SGVsbG8sIFdvcmxkIQ==");
  });

  it("日本語（UTF-8）をエンコードする", () => {
    render(<Base64Tile />);
    type(ENCODE_INPUT, "こんにちは");
    expect(resultText(ENCODED_RESULT)).toBe("44GT44KT44Gr44Gh44Gv");
  });

  it("URL-safe にすると + と / が - と _ になる", () => {
    render(<Base64Tile />);
    type(ENCODE_INPUT, ">>>");
    expect(resultText(ENCODED_RESULT)).toBe("Pj4+");
    fireEvent.click(screen.getByRole("checkbox"));
    expect(resultText(ENCODED_RESULT)).toBe("Pj4-");
  });

  it("URL-safe のチェックボックスが、その説明を指す", () => {
    const { container } = render(<Base64Tile />);
    const checkbox = screen.getByRole("checkbox");
    const descId = checkbox.getAttribute("aria-describedby")!;
    expect(
      container.querySelector(`#${CSS.escape(descId)}`)?.textContent,
    ).toContain("JWT");
  });
});

describe("デコード", () => {
  it("デコードに切り替えると入力欄のラベルが変わり、URL-safe のチェックボックスが消える", () => {
    render(<Base64Tile />);
    chooseDecode();
    expect(screen.getByLabelText(DECODE_INPUT)).toBeInTheDocument();
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });

  it("Base64 をデコードする", () => {
    render(<Base64Tile />);
    chooseDecode();
    type(DECODE_INPUT, "SGVsbG8sIFdvcmxkIQ==");
    expect(resultText(DECODED_RESULT)).toBe("Hello, World!");
  });

  it("URL-safe でパディングの無い Base64 をデコードする", () => {
    render(<Base64Tile />);
    chooseDecode();
    type(DECODE_INPUT, "Pj4-");
    expect(resultText(DECODED_RESULT)).toBe(">>>");
  });

  it.each([
    ["末尾の改行", "SGVsbG8=\n"],
    ["76字ごとのような途中の改行", "SGVs\nbG8="],
    ["前後の空白", "  SGVsbG8=  "],
  ])("%s を含む Base64 をデコードする", (_, input) => {
    render(<Base64Tile />);
    chooseDecode();
    type(DECODE_INPUT, input);
    expect(resultText(DECODED_RESULT)).toBe("Hello");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});

describe("向きの切り替え", () => {
  it("エンコードの結果を、デコードの入力に移す", () => {
    render(<Base64Tile />);
    type(ENCODE_INPUT, "Hello");
    chooseDecode();
    expect(screen.getByLabelText(DECODE_INPUT)).toHaveValue("SGVsbG8=");
    expect(resultText(DECODED_RESULT)).toBe("Hello");
  });

  it("デコードの結果を、エンコードの入力に移す", () => {
    render(<Base64Tile />);
    chooseDecode();
    type(DECODE_INPUT, "44GT44KT44Gr44Gh44Gv");
    fireEvent.click(screen.getByRole("radio", { name: "エンコード" }));
    expect(screen.getByLabelText(ENCODE_INPUT)).toHaveValue("こんにちは");
    expect(resultText(ENCODED_RESULT)).toBe("44GT44KT44Gr44Gh44Gv");
  });

  it("結果が無いときは、入力をそのまま残す", () => {
    render(<Base64Tile />);
    chooseDecode();
    type(DECODE_INPUT, "!@#$");
    fireEvent.click(screen.getByRole("radio", { name: "エンコード" }));
    expect(screen.getByLabelText(ENCODE_INPUT)).toHaveValue("!@#$");
  });
});

describe("結果のボックス", () => {
  it("入力が空のあいだは結果のボックスを出さない", () => {
    render(<Base64Tile />);
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
  });

  it("結果を読み取り専用の入力欄に出さない", () => {
    const { container } = render(<Base64Tile />);
    type(ENCODE_INPUT, "test");
    expect(container.querySelectorAll("textarea")).toHaveLength(1);
    expect(container.querySelector("[readonly]")).toBeNull();
  });

  it("エンコードの結果だけが、全体を1語として字のあいだで折る組みを持つ", () => {
    render(<Base64Tile />);
    type(ENCODE_INPUT, "Hello");
    expect(resultParagraph(ENCODED_RESULT).className).toMatch(/encoded/);
    chooseDecode();
    expect(resultParagraph(DECODED_RESULT).className).not.toMatch(/encoded/);
  });

  it("コピーのボタンを結果のボックスの中に置く", () => {
    render(<Base64Tile />);
    type(ENCODE_INPUT, "hello");
    const region = screen.getByRole("region", { name: ENCODED_RESULT });
    expect(region).toContainElement(
      screen.getByRole("button", { name: "Base64をコピー" }),
    );
  });

  it("結果が現れたときに1度だけ、入力欄と結果を渡して画面に入れる", () => {
    render(<Base64Tile />);
    type(ENCODE_INPUT, "a");
    expect(revealResult).toHaveBeenCalledTimes(1);
    const [operations, result] = vi.mocked(revealResult).mock.calls[0];
    expect(operations).toContainElement(screen.getByLabelText(ENCODE_INPUT));
    expect(result).toBe(screen.getByRole("region", { name: ENCODED_RESULT }));
    type(ENCODE_INPUT, "ab");
    expect(revealResult).toHaveBeenCalledTimes(1);
  });
});

describe("打ちかけの入力", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("4字に満たない区切りのあいだは前の結果を出したままにし、理由の文を出さない", () => {
    render(<Base64Tile />);
    chooseDecode();
    type(DECODE_INPUT, "5pel");
    const region = screen.getByRole("region", { name: DECODED_RESULT });
    expect(resultText(DECODED_RESULT)).toBe("日");
    type(DECODE_INPUT, "5pel5");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByRole("region", { name: DECODED_RESULT })).toBe(region);
    expect(resultText(DECODED_RESULT)).toBe("日");
    type(DECODE_INPUT, "5pel5pys");
    expect(resultText(DECODED_RESULT)).toBe("日本");
    expect(screen.getByRole("region", { name: DECODED_RESULT })).toBe(region);
  });

  it("手が止まると、理由と直し方を言い、結果を消す", () => {
    render(<Base64Tile />);
    chooseDecode();
    type(DECODE_INPUT, "SGVsb");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(TYPING_PAUSE_MS);
    });
    expect(screen.getByRole("alert")).toHaveTextContent(
      "字の数が1つ足りないか、1つ多すぎます。",
    );
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
  });

  it("手が止まる前に打ち進めて読めるようになれば、理由の文を出さない", () => {
    render(<Base64Tile />);
    chooseDecode();
    type(DECODE_INPUT, "SGVsb");
    act(() => {
      vi.advanceTimersByTime(TYPING_PAUSE_MS - 100);
    });
    type(DECODE_INPUT, "SGVsbG8");
    act(() => {
      vi.advanceTimersByTime(TYPING_PAUSE_MS);
    });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(resultText(DECODED_RESULT)).toBe("Hello");
  });
});

describe("理由の文とライブリージョン", () => {
  it("Base64 に使わない字は、すぐにその字と使える字を言い、結果を出さない", () => {
    render(<Base64Tile />);
    chooseDecode();
    type(DECODE_INPUT, "SGV$");
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Base64に使わない字「$」が入っています。使えるのは英字・数字と「+」「/」「-」「_」「=」です。",
    );
    expect(screen.getByLabelText(DECODE_INPUT)).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
  });

  it("途中の「=」は、すぐに直し方を言う", () => {
    render(<Base64Tile />);
    chooseDecode();
    type(DECODE_INPUT, "SGk=SGk=");
    expect(screen.getByRole("alert")).toHaveTextContent(
      "「=」は末尾にだけ置けます。",
    );
  });

  it("結果が出たことをライブリージョンで知らせる", () => {
    render(<Base64Tile />);
    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-live", "polite");
    type(ENCODE_INPUT, "test");
    expect(status).toHaveTextContent("エンコードしました");
    chooseDecode();
    expect(status).toHaveTextContent("デコードしました");
  });

  it("デコードできないときは、ライブリージョンを空にする", () => {
    render(<Base64Tile />);
    chooseDecode();
    type(DECODE_INPUT, "dGVzdA");
    expect(screen.getByRole("status")).toHaveTextContent("デコードしました");
    type(DECODE_INPUT, "dGVzdA$");
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });
});

describe("コピー", () => {
  it("押すと面の字が「コピー済み」になる", async () => {
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      writable: true,
      configurable: true,
    });
    render(<Base64Tile />);
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
    render(<Base64Tile />);
    chooseDecode();
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
