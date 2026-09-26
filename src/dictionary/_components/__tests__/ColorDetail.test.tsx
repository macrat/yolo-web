import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import ColorDetail from "@/dictionary/_components/color/ColorDetail";
import { getColorBySlug } from "@/dictionary/_lib/colors";

const toki = getColorBySlug("toki")!;

describe("ColorDetail の同じカテゴリの伝統色", () => {
  test("見出しを名前に持つ一覧に6色が並び、行のリンクの読み上げの名前は色名だけである", () => {
    render(<ColorDetail color={toki} titleFontAttr={{}} />);
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
    render(<ColorDetail color={toki} titleFontAttr={{}} />);
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
      <ColorDetail color={toki} titleFontAttr={{}} />,
    );
    const swatch = getByTestId("color-detail").firstElementChild!;
    expect((swatch as HTMLElement).style.backgroundColor).not.toBe("");
    expect(swatch).toHaveAttribute("aria-hidden", "true");
    expect(swatch).not.toHaveAttribute("aria-label");
  });
});
