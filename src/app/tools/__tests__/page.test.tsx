/**
 * ツールの一覧（/tools）のテスト。レジストリはモックせず実データを使い、データが変わってもテストが追従する。
 */
import { describe, expect, test, vi } from "vitest";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import ToolsPage, { metadata } from "../page";
import { allToolMetas } from "@/tools/registry";
import { TOOL_CATEGORIES, toolCategoryLabel } from "@/tools/categories";
import { formatDate } from "@/lib/date";
import type { ToolMeta } from "@/tools/types";

const navigation = vi.hoisted(() => ({ pathname: "/tools" }));

vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
}));

function visit(path: string) {
  navigation.pathname = "/tools";
  window.history.replaceState(null, "", path);
}

function list(): HTMLElement {
  return screen.getByRole("list", { name: "ツールの一覧" });
}

function rows(): HTMLElement[] {
  return within(list()).getAllByRole("listitem");
}

function shownTools(): ToolMeta[] {
  return rows().map((row) => {
    const name = within(row).getByRole("link").textContent;
    const meta = allToolMetas.find((tool) => tool.name === name);
    if (!meta) throw new Error(`no tool named ${name}`);
    return meta;
  });
}

const kindOrder = TOOL_CATEGORIES.map((choice) => choice.value);

describe("app/tools/page.tsx", () => {
  test("パンくずの2つ目と h1 が、上端のナビと同じ「ツール」である", () => {
    visit("/tools");
    render(<ToolsPage />);
    const h1s = screen.getAllByRole("heading", { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent("ツール");
    const crumbs = screen.getByRole("navigation", { name: "パンくずリスト" });
    expect(
      within(crumbs).getByRole("link", { name: "ホーム" }),
    ).toHaveAttribute("href", "/");
    expect(within(crumbs).getByText("ツール")).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  test("タブと OGP・Twitter の題が「ツール | yolos.net」である", () => {
    expect(metadata.title).toBe("ツール | yolos.net");
    expect(metadata.openGraph?.title).toBe("ツール | yolos.net");
    expect(metadata.twitter?.title).toBe("ツール | yolos.net");
    expect(metadata.description).toContain(`全${allToolMetas.length}個`);
  });

  test("全件を1つの一覧に並べ、行のリンクの名前はツール名だけで、行き先はツールのページである", () => {
    visit("/tools");
    render(<ToolsPage />);
    expect(rows()).toHaveLength(allToolMetas.length);
    for (const tool of allToolMetas) {
      expect(
        within(list()).getByRole("link", { name: tool.name }),
      ).toHaveAttribute("href", `/tools/${tool.slug}`);
    }
  });

  test("件数の行が全件を言う", () => {
    visit("/tools");
    render(<ToolsPage />);
    expect(screen.getByText(`全${allToolMetas.length}件`)).toBeInTheDocument();
  });

  test("行は説明・種別の語・公開日を持つ", () => {
    visit("/tools");
    render(<ToolsPage />);
    for (const tool of allToolMetas) {
      const row = within(list())
        .getByRole("link", { name: tool.name })
        .closest("li") as HTMLElement;
      expect(row).toHaveTextContent(tool.shortDescription);
      expect(row).toHaveTextContent(toolCategoryLabel(tool.category));
      expect(row.querySelector("time")).toHaveAttribute(
        "datetime",
        tool.publishedAt,
      );
      expect(row).toHaveTextContent(formatDate(tool.publishedAt));
    }
  });

  test("既定の並びは種別順で、同じ種別の中は公開日の新しい順である", () => {
    visit("/tools");
    render(<ToolsPage />);
    const shown = shownTools();
    for (let i = 1; i < shown.length; i++) {
      const prev = shown[i - 1];
      const next = shown[i];
      const kindDiff =
        kindOrder.indexOf(next.category) - kindOrder.indexOf(prev.category);
      expect(kindDiff).toBeGreaterThanOrEqual(0);
      if (kindDiff === 0) {
        expect(
          formatDate(next.publishedAt) <= formatDate(prev.publishedAt),
        ).toBe(true);
      }
    }
  });

  test("種別の組は「すべて」と5つの種別を持ち、選ぶとその種別の行だけが残り、URL に kind が入る", () => {
    visit("/tools");
    render(<ToolsPage />);
    const group = screen.getByRole("radiogroup", { name: "種別" });
    expect(
      within(group)
        .getAllByRole("radio")
        .map((radio) => radio.closest("label")?.textContent),
    ).toEqual(["すべて", "文章", "数値", "データ", "画像", "色"]);

    fireEvent.click(within(group).getByRole("radio", { name: "画像" }));
    const images = allToolMetas.filter((tool) => tool.category === "image");
    expect(shownTools()).toHaveLength(images.length);
    expect(shownTools().every((tool) => tool.category === "image")).toBe(true);
    expect(window.location.search).toBe("?kind=image");
  });

  test("新しい順では、種別をまたいで公開日の新しい順に並ぶ", () => {
    visit("/tools?sort=newest");
    render(<ToolsPage />);
    const dates = shownTools().map((tool) => formatDate(tool.publishedAt));
    expect(dates).toEqual([...dates].sort().reverse());
  });

  test("名前の欄に打つと、名前と説明で絞られる", () => {
    vi.useFakeTimers();
    try {
      visit("/tools");
      render(<ToolsPage />);
      fireEvent.change(
        screen.getByRole("searchbox", { name: "名前・説明で探す" }),
        { target: { value: "変換" } },
      );
      act(() => {
        vi.advanceTimersByTime(300);
      });
      const shown = shownTools();
      expect(shown.length).toBeGreaterThan(0);
      for (const tool of shown) {
        expect(`${tool.name}${tool.shortDescription}`).toContain("変換");
      }
    } finally {
      vi.useRealTimers();
    }
  });
});
