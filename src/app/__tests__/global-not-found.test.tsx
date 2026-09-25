import { expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import GlobalNotFound from "../global-not-found-content";

test("404 page renders heading", () => {
  render(<GlobalNotFound />);
  expect(
    screen.getByRole("heading", {
      level: 1,
      name: "ページが見つかりませんでした",
    }),
  ).toBeInTheDocument();
});

test("404 page has links to main sections", () => {
  render(<GlobalNotFound />);

  const homeLink = screen.getByRole("link", { name: "ホーム" });
  expect(homeLink).toHaveAttribute("href", "/");

  const toolsLink = screen.getByRole("link", { name: "無料オンラインツール" });
  expect(toolsLink).toHaveAttribute("href", "/tools");

  const gamesLink = screen.getByRole("link", { name: "遊ぶ" });
  expect(gamesLink).toHaveAttribute("href", "/play");

  const blogLink = screen.getByRole("link", { name: "ブログ" });
  expect(blogLink).toHaveAttribute("href", "/blog");
});
