import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import YojiSearchTile from "../YojiSearchTile";

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
    expect(
      screen.getAllByRole("button", { name: /の詳細を表示/ }).length,
    ).toBeGreaterThan(0);
    // the list is paged, and a "もっと見る" button lets browse-all visitors
    // reach every entry (not a dead end)
    expect(
      screen.getByRole("button", { name: /もっと見る/ }),
    ).toBeInTheDocument();
  });

  it("reveals more entries when もっと見る is clicked", async () => {
    const user = userEvent.setup();
    render(<YojiSearchTile />);

    const before = screen.getAllByRole("button", {
      name: /の詳細を表示/,
    }).length;
    await user.click(screen.getByRole("button", { name: /もっと見る/ }));
    const after = screen.getAllByRole("button", {
      name: /の詳細を表示/,
    }).length;

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

    const firstPage = screen.getAllByRole("button", {
      name: /の詳細を表示/,
    }).length;
    await user.click(screen.getByRole("button", { name: /もっと見る/ }));
    expect(
      screen.getAllByRole("button", { name: /の詳細を表示/ }).length,
    ).toBeGreaterThan(firstPage);

    // changing the query, then clearing it, returns to a single page of results
    const input = screen.getByPlaceholderText("四字熟語・読み・意味で検索...");
    await user.type(input, "一");
    await user.clear(input);

    expect(screen.getAllByRole("button", { name: /の詳細を表示/ }).length).toBe(
      firstPage,
    );
  });

  it("filters results when typing a query", async () => {
    const user = userEvent.setup();
    render(<YojiSearchTile />);

    const input = screen.getByPlaceholderText("四字熟語・読み・意味で検索...");
    await user.type(input, "一期一会");

    expect(screen.getByText("一期一会")).toBeInTheDocument();
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

    const button = screen.getByRole("button", {
      name: /一期一会 の詳細を表示/,
    });
    await user.click(button);

    expect(screen.getByText("例文")).toBeInTheDocument();
    expect(screen.getByText("カテゴリ")).toBeInTheDocument();
    expect(screen.getByText("難易度")).toBeInTheDocument();
  });

  it("collapses detail panel on second click", async () => {
    const user = userEvent.setup();
    render(<YojiSearchTile />);

    const input = screen.getByPlaceholderText("四字熟語・読み・意味で検索...");
    await user.type(input, "一期一会");

    const expandButton = screen.getByRole("button", {
      name: /一期一会 の詳細を表示/,
    });
    await user.click(expandButton);

    const collapseButton = screen.getByRole("button", {
      name: /一期一会 の詳細を閉じる/,
    });
    await user.click(collapseButton);

    expect(screen.queryByText("例文")).not.toBeInTheDocument();
  });
});
