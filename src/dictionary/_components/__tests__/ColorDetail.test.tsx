import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import ColorDetail from "@/dictionary/_components/color/ColorDetail";
import { getColorBySlug } from "@/dictionary/_lib/colors";
import { followsPhraseRules } from "@/lib/phrase-breaks";

const toki = getColorBySlug("toki")!;
const namePhrases = [toki.name];

describe("ColorDetail の同じカテゴリの伝統色", () => {
  test("見出しを名前に持つ一覧に6色が並び、行のリンクの読み上げの名前は色名だけである", () => {
    render(
      <ColorDetail
        color={toki}
        namePhrases={namePhrases}
        nameFontAttr={{}}
        head={null}
      />,
    );
    const list = screen.getByRole("list", {
      name: "同じカテゴリの伝統色（赤系）",
    });
    const links = Array.from(list.querySelectorAll("a"));
    expect(links).toHaveLength(6);
    for (const link of links) {
      const name = link.textContent ?? "";
      expect(name).not.toBe("");
      expect(link).toHaveAccessibleName(name);
      expect(link.getAttribute("href")).toMatch(/^\/dictionary\/colors\//);
    }
  });

  test("行は色見本とローマ字を持つ", () => {
    render(
      <ColorDetail
        color={toki}
        namePhrases={namePhrases}
        nameFontAttr={{}}
        head={null}
      />,
    );
    const list = screen.getByRole("list", {
      name: "同じカテゴリの伝統色（赤系）",
    });
    const rows = Array.from(list.querySelectorAll("li"));
    for (const row of rows) {
      const swatch = row.querySelector("[aria-hidden='true']");
      expect(swatch).not.toBeNull();
      expect((swatch as HTMLElement).style.backgroundColor).not.toBe("");
      expect(row.textContent).toMatch(/[a-z]+$/);
    }
  });
});

describe("ColorDetail の色見本", () => {
  test("大きな色見本は、色の名前とカラーコードを本文が伝えるので、読み上げの木に現れない", () => {
    const { getByTestId } = render(
      <ColorDetail
        color={toki}
        namePhrases={namePhrases}
        nameFontAttr={{}}
        head={null}
      />,
    );
    const swatch = getByTestId("color-swatch");
    expect(swatch.style.backgroundColor).not.toBe("");
    expect(swatch).toHaveAttribute("aria-hidden", "true");
    expect(swatch).not.toHaveAttribute("aria-label");
  });
});

describe("ColorDetail の主見出しと読みと色見本", () => {
  test("主見出しは色名だけを言い、読みはそのすぐ下に添え、大きな色見本は読みのすぐ下に置く（DESIGN.md §4・§5）", () => {
    render(
      <ColorDetail
        color={toki}
        namePhrases={namePhrases}
        nameFontAttr={{}}
        head={null}
      />,
    );
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveTextContent(new RegExp(`^${toki.name}$`));
    const reading = h1.nextElementSibling!;
    expect(reading.tagName).toBe("P");
    expect(reading).toHaveTextContent(new RegExp(`^${toki.romaji}$`));
    expect(reading.nextElementSibling).toBe(screen.getByTestId("color-swatch"));
  });
});

describe("ColorDetail のカラーコードの表", () => {
  test("見出しを名前に持つ表に、HEX・RGB・HSL の行が行の見出しと値とコピーのボタンを持って並ぶ", () => {
    render(
      <ColorDetail
        color={toki}
        namePhrases={namePhrases}
        nameFontAttr={{}}
        head={null}
      />,
    );
    const table = screen.getByRole("table", { name: "カラーコード" });
    const rows = Array.from(table.querySelectorAll("tbody > tr"));
    expect(
      rows.map((row) => row.querySelector("th[scope='row']")?.textContent),
    ).toEqual(["HEX", "RGB", "HSL"]);
    expect(rows[0].textContent).toContain(toki.hex);
    expect(rows[1].textContent).toContain(`rgb(${toki.rgb.join(", ")})`);
    for (const target of ["HEX", "RGB", "HSL"]) {
      expect(
        screen.getByRole("button", { name: `${target}をコピー` }).closest("tr"),
      ).toBe(rows[["HEX", "RGB", "HSL"].indexOf(target)]);
    }
  });
});

describe("ColorDetail のセクション", () => {
  test("項目の本文・同じカテゴリの伝統色・関連ツールを、この順にそれぞれ別の兄弟のセクションに置く（DESIGN.md §5）", () => {
    const { container } = render(
      <ColorDetail
        color={toki}
        namePhrases={namePhrases}
        nameFontAttr={{}}
        head={null}
      />,
    );
    const sections = Array.from(container.children);
    expect(sections.map((section) => section.tagName)).toEqual([
      "SECTION",
      "SECTION",
      "SECTION",
    ]);
    expect(
      sections.map(
        (section) => section.querySelector("h1, h2")?.textContent ?? "",
      ),
    ).toEqual([toki.name, "同じカテゴリの伝統色（赤系）", "関連ツール"]);
    // 本文の中の見出し（カラーコード・カテゴリ）は、最初のセクションの中の小見出しである。
    expect(
      Array.from(sections[0].querySelectorAll("h2")).map((h) => h.textContent),
    ).toEqual(["カラーコード", "カテゴリ"]);
  });
});

describe("ColorDetail のカラーコードのコピー", () => {
  const writeText = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("navigator", { ...navigator, clipboard: { writeText } });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    writeText.mockReset();
    delete (document as { execCommand?: unknown }).execCommand;
  });

  test("写せたら、押したボタンだけが「コピー済み」になる", async () => {
    writeText.mockResolvedValue(undefined);
    render(
      <ColorDetail
        color={toki}
        namePhrases={namePhrases}
        nameFontAttr={{}}
        head={null}
      />,
    );
    const hexButton = screen.getByRole("button", { name: "HEXをコピー" });
    fireEvent.click(hexButton);
    await waitFor(() => expect(hexButton).toHaveTextContent("コピー済み"));
    expect(writeText).toHaveBeenCalledWith(toki.hex);
    expect(
      screen.getByRole("button", { name: "RGBをコピー" }),
    ).toBeInTheDocument();
  });

  test("どの写し方でも写せなければ、押したボタンに「コピー失敗」を出す", async () => {
    writeText.mockRejectedValue(new Error("denied"));
    Object.defineProperty(document, "execCommand", {
      value: vi.fn(() => false),
      configurable: true,
      writable: true,
    });
    render(
      <ColorDetail
        color={toki}
        namePhrases={namePhrases}
        nameFontAttr={{}}
        head={null}
      />,
    );
    const hexButton = screen.getByRole("button", { name: "HEXをコピー" });
    fireEvent.click(hexButton);
    await waitFor(() => expect(hexButton).toHaveTextContent("コピー失敗"));
  });
});

test("見出しは文節の切れ目でだけ折れる（DESIGN.md §4）", () => {
  render(
    <ColorDetail
      color={toki}
      namePhrases={namePhrases}
      nameFontAttr={{}}
      head={null}
    />,
  );
  const headings: string[][] = [
    ["カラーコード"],
    ["カテゴリ"],
    ["関連", "ツール"],
    ["同じ", "カテゴリの", "伝統色", "（赤系）"],
  ];
  for (const phrases of headings) {
    expect(followsPhraseRules(phrases), phrases.join("|")).toBe(true);
    const heading = screen.getByRole("heading", { name: phrases.join("") });
    expect(heading.innerHTML).toBe(phrases.join("<wbr>"));
  }
  expect(screen.getByRole("heading", { level: 1 }).innerHTML).toBe(
    namePhrases.join("<wbr>"),
  );
});

test("渡されたページの頭を、項目の本文のセクションの最初の子として、主見出しより前に置く", () => {
  const { container } = render(
    <ColorDetail
      color={toki}
      namePhrases={namePhrases}
      nameFontAttr={{}}
      head={<nav data-testid="page-head" />}
    />,
  );
  const head = screen.getByTestId("page-head");
  expect(container.querySelector("section")!.firstElementChild).toBe(head);
  expect(
    head.compareDocumentPosition(screen.getByRole("heading", { level: 1 })) &
      Node.DOCUMENT_POSITION_FOLLOWING,
  ).toBeTruthy();
});
