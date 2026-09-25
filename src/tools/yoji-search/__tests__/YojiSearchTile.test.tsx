import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import YojiSearchTile from "../YojiSearchTile";

/** 結果の並びの行（開閉の行）の数。 */
function countResultRows(): number {
  return document.querySelectorAll("li details > summary").length;
}

/** 四字熟語の結果の行の開閉の行を返す。 */
function getResultSummary(yoji: string): HTMLElement {
  const summary = within(document.body)
    .getByText(yoji, { selector: "summary *" })
    .closest("summary");
  if (!summary) throw new Error(`${yoji} の行が無い`);
  return summary as HTMLElement;
}

describe("YojiSearchTile", () => {
  it("renders search input", () => {
    render(<YojiSearchTile />);
    expect(
      screen.getByPlaceholderText("四字熟語・読み・意味で検索..."),
    ).toBeInTheDocument();
  });

  it("shows a browsable list by default (browse-first, no blank screen)", () => {
    render(<YojiSearchTile />);
    // total count is shown above the list
    expect(screen.getByRole("status")).toHaveTextContent(/\d+語を収録/);
    // the old blank "search first" guide screen is gone
    expect(
      screen.queryByText("キーワードやカテゴリで四字熟語を検索できます"),
    ).not.toBeInTheDocument();
    // idioms are rendered immediately so 一覧-intent visitors see content
    expect(countResultRows()).toBeGreaterThan(0);
    // the list is paged, and a "もっと見る" button lets browse-all visitors
    // reach every entry (not a dead end)
    expect(
      screen.getByRole("button", { name: /もっと見る/ }),
    ).toBeInTheDocument();
  });

  it("reveals more entries when もっと見る is clicked", async () => {
    const user = userEvent.setup();
    render(<YojiSearchTile />);

    const before = countResultRows();
    await user.click(screen.getByRole("button", { name: /もっと見る/ }));
    const after = countResultRows();

    expect(after).toBeGreaterThan(before);
  });

  it("hides もっと見る when a query narrows results below one page", async () => {
    const user = userEvent.setup();
    render(<YojiSearchTile />);

    const input = screen.getByPlaceholderText("四字熟語・読み・意味で検索...");
    await user.type(input, "一期一会");

    expect(
      screen.queryByRole("button", { name: /もっと見る/ }),
    ).not.toBeInTheDocument();
  });

  it("resets to one page when filters change after もっと見る", async () => {
    const user = userEvent.setup();
    render(<YojiSearchTile />);

    const firstPage = countResultRows();
    await user.click(screen.getByRole("button", { name: /もっと見る/ }));
    expect(countResultRows()).toBeGreaterThan(firstPage);

    // changing the query, then clearing it, returns to a single page of results
    const input = screen.getByPlaceholderText("四字熟語・読み・意味で検索...");
    await user.type(input, "一");
    await user.clear(input);

    expect(countResultRows()).toBe(firstPage);
  });

  it("filters results when typing a query", async () => {
    const user = userEvent.setup();
    render(<YojiSearchTile />);

    const input = screen.getByPlaceholderText("四字熟語・読み・意味で検索...");
    await user.type(input, "一期一会");

    expect(getResultSummary("一期一会")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(/\d+語中 \d+件/);
  });

  it("shows empty state when no results match", async () => {
    const user = userEvent.setup();
    render(<YojiSearchTile />);

    const input = screen.getByPlaceholderText("四字熟語・読み・意味で検索...");
    await user.type(input, "zzznonexistent");

    expect(
      screen.getByText("条件に合う四字熟語が見つかりません"),
    ).toBeInTheDocument();
  });

  it("expands detail panel on click", async () => {
    const user = userEvent.setup();
    render(<YojiSearchTile />);

    const input = screen.getByPlaceholderText("四字熟語・読み・意味で検索...");
    await user.type(input, "一期一会");

    await user.click(getResultSummary("一期一会"));

    // 絞り込みの組の見出しと同じ語なので、詳細の見出し（dt）に絞って探す。
    expect(screen.getByText("例文", { selector: "dt" })).toBeInTheDocument();
    expect(
      screen.getByText("カテゴリ", { selector: "dt" }),
    ).toBeInTheDocument();
    expect(screen.getByText("難易度", { selector: "dt" })).toBeInTheDocument();
  });

  it("collapses detail panel on second click", async () => {
    const user = userEvent.setup();
    render(<YojiSearchTile />);

    const input = screen.getByPlaceholderText("四字熟語・読み・意味で検索...");
    await user.type(input, "一期一会");

    await user.click(getResultSummary("一期一会"));
    await user.click(getResultSummary("一期一会"));

    expect(screen.queryByText("例文")).not.toBeInTheDocument();
  });
});
