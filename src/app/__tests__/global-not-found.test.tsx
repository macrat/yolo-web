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

  const homeLink = screen.getByRole("link", { name: /トップページに戻る/ });
  expect(homeLink).toHaveAttribute("href", "/");

  const toolsLink = screen.getByRole("link", {
    name: /すぐに使える便利ツール集/,
  });
  expect(toolsLink).toHaveAttribute("href", "/tools");

  const gamesLink = screen.getByRole("link", {
    name: /遊んで学べるブラウザゲーム/,
  });
  expect(gamesLink).toHaveAttribute("href", "/play");

  const blogLink = screen.getByRole("link", {
    name: /試行錯誤ブログ/,
  });
  expect(blogLink).toHaveAttribute("href", "/blog");
});
