import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import YojiSearchTile from "../YojiSearchTile";
import { YOJI_DIFFICULTY_LABELS } from "@/dictionary/_lib/types";
import { YOJI_SEARCH_ITEMS } from "../logic";

// 見えている件数の行。読み上げに伝える文は、これとは別の見えない role="status" が持つ。
function countLine(): HTMLElement {
  const line = document.querySelector<HTMLElement>('p[tabindex="-1"]');
  if (!line) throw new Error("件数の行がありません");
  return line;
}

/** 結果の行の開閉のボタン。 */
function rowButtons(): HTMLElement[] {
  return Array.from(
    document.querySelectorAll<HTMLElement>("li > button[aria-expanded]"),
  );
}

function rowButton(yoji: string): HTMLElement {
  return screen.getByRole("button", { name: yoji });
}

function visit(search: string) {
  window.history.replaceState(null, "", `/tools/yoji-search${search}`);
}

beforeEach(() => {
  // jsdom はスクロールを持たない。ページを送ったあとに件数の行を画面に出す処理だけを受け止める。
  Element.prototype.scrollIntoView = vi.fn();
});

afterEach(() => {
  visit("");
});

describe("YojiSearchTile", () => {
  it("全400語のうち1ページ目の50語を並べ、「もっと見る」ではなくページ送りを持つ", () => {
    render(<YojiSearchTile />);
    expect(countLine()).toHaveTextContent("全400語のうち1〜50語目");
    expect(rowButtons()).toHaveLength(50);
    expect(
      screen.queryByRole("button", { name: /もっと見る/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("navigation", { name: "ページナビゲーション" }),
    ).toBeInTheDocument();
  });

  it("名前の欄は語・読み・意味・例文で探せることをラベルで言う", () => {
    render(<YojiSearchTile />);
    expect(
      screen.getByRole("searchbox", { name: "語・読み・意味・例文で探す" }),
    ).toBeInTheDocument();
  });

  it("打った字で絞り込み、該当件数を件数の行に出し、URL の q に書く", async () => {
    render(<YojiSearchTile />);
    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "一期一会" },
    });
    expect(countLine()).toHaveTextContent(/^\d+語（全400語）$/);
    expect(rowButtons()[0]).toBe(rowButton("一期一会"));
    await act(() => new Promise((resolve) => setTimeout(resolve, 350)));
    expect(new URLSearchParams(window.location.search).get("q")).toBe(
      "一期一会",
    );
  });

  it("当たらないときは件数の行が言い、「絞り込みを外す」で名前の欄へ戻る", () => {
    render(<YojiSearchTile />);
    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "zzznonexistent" },
    });
    expect(countLine()).toHaveTextContent(
      "条件に合う語はありません（全400語）",
    );
    fireEvent.click(screen.getByRole("button", { name: "絞り込みを外す" }));
    expect(countLine()).toHaveTextContent("全400語のうち1〜50語目");
    expect(screen.getByRole("searchbox")).toHaveFocus();
  });

  it("カテゴリ・難易度・出典の組を畳み、ラベルがいまの選択を言う", () => {
    render(<YojiSearchTile />);
    const toggle = screen.getByRole("button", {
      name: "絞り込みと並び順（すべて、読みの五十音順）",
    });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(screen.getByRole("radio", { name: "人生" }));
    fireEvent.click(screen.getByRole("radio", { name: "初級" }));
    fireEvent.click(screen.getByRole("radio", { name: "やさしい順" }));
    expect(toggle).toHaveTextContent(
      "絞り込みと並び順（人生、初級、やさしい順）",
    );
    const params = new URLSearchParams(window.location.search);
    expect(params.get("kind")).toBe("life");
    expect(params.get("level")).toBe("1");
    expect(params.get("sort")).toBe("easy");
  });

  it("URL のクエリの状態で出す", () => {
    visit("?kind=life&origin=日本");
    render(<YojiSearchTile />);
    const expected = YOJI_SEARCH_ITEMS.filter(
      ({ entry }) => entry.category === "life" && entry.origin === "日本",
    ).length;
    expect(countLine()).toHaveTextContent(`${expected}語（全400語）`);
    expect(screen.getByRole("radio", { name: "日本" })).toBeChecked();
  });

  it("ページを送ると、URL の page に書き、件数の行へフォーカスを移す", () => {
    render(<YojiSearchTile />);
    fireEvent.click(screen.getByRole("button", { name: "次へ（ページ2）" }));
    expect(new URLSearchParams(window.location.search).get("page")).toBe("2");
    expect(countLine()).toHaveTextContent("全400語のうち51〜100語目");
    expect(countLine()).toHaveFocus();
    expect(rowButtons()[0]).toBe(rowButton(YOJI_SEARCH_ITEMS[50].name));
  });

  it("行の読み上げの名前は語だけで、読み・難易度・意味は説明になる", () => {
    render(<YojiSearchTile />);
    const { entry } = YOJI_SEARCH_ITEMS[0];
    const button = rowButton(entry.yoji);
    expect(button).toHaveAccessibleName(entry.yoji);
    expect(button).toHaveAccessibleDescription(
      `${entry.reading} ${YOJI_DIFFICULTY_LABELS[entry.difficulty]} ${entry.meaning}`,
    );
  });

  it("やさしい順では、閉じた行に見えている難易度の順に並ぶ", () => {
    // 初級から中級へ移るところを含むページ。
    const firstIntermediate = YOJI_SEARCH_ITEMS.filter(
      ({ entry }) => entry.difficulty === 1,
    ).length;
    const page = Math.ceil((firstIntermediate + 1) / 50);
    visit(`?sort=easy&page=${page}`);
    render(<YojiSearchTile />);
    const labels = Object.values(YOJI_DIFFICULTY_LABELS);
    const shown = rowButtons().map((button) =>
      labels.findIndex((label) => within(button).queryByText(label) !== null),
    );
    expect(shown).not.toContain(-1);
    expect(new Set(shown).size).toBeGreaterThan(1);
    expect(shown).toEqual([...shown].sort((a, b) => a - b));
  });

  it("行を押すと詳細が開き、もう一度押すと閉じる。開く行は1つだけ", () => {
    render(<YojiSearchTile />);
    const [first, second] = rowButtons();
    fireEvent.click(first);
    expect(first).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("例文", { selector: "dt" })).toBeInTheDocument();
    fireEvent.click(second);
    expect(first).toHaveAttribute("aria-expanded", "false");
    expect(second).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(second);
    expect(screen.queryByText("例文", { selector: "dt" })).toBeNull();
  });
});
