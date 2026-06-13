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

  it("shows guide text when no filters are active", () => {
    render(<YojiSearchTile />);
    expect(screen.getByRole("status")).toHaveTextContent(/\d+語を収録/);
    expect(
      screen.getByText("キーワードやカテゴリで四字熟語を検索できます"),
    ).toBeInTheDocument();
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
