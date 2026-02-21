import { expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import Footer from "../Footer";

test("Footer renders disclaimer text about AI experiment", () => {
  render(<Footer />);
  expect(
    screen.getByText(
      /このサイトはAIによる実験的プロジェクトです。コンテンツはAIが生成しており、内容が壊れていたり不正確な場合があります。/,
    ),
  ).toBeInTheDocument();
});

test("Footer has contentinfo role", () => {
  render(<Footer />);
  expect(screen.getByRole("contentinfo")).toBeInTheDocument();
});

test("Footer renders navigation links", () => {
  render(<Footer />);
  const nav = screen.getByRole("navigation", { name: "Footer navigation" });
  expect(nav).toBeInTheDocument();

  expect(screen.getByRole("link", { name: "ツール一覧" })).toHaveAttribute(
    "href",
    "/tools",
  );
  expect(screen.getByRole("link", { name: "チートシート" })).toHaveAttribute(
    "href",
    "/cheatsheets",
  );
  expect(screen.getByRole("link", { name: "ゲーム一覧" })).toHaveAttribute(
    "href",
    "/games",
  );
  expect(screen.getByRole("link", { name: "クイズ・診断" })).toHaveAttribute(
    "href",
    "/quiz",
  );
  expect(screen.getByRole("link", { name: "ブログ" })).toHaveAttribute(
    "href",
    "/blog",
  );
  expect(
    screen.getByRole("link", { name: "このサイトについて" }),
  ).toHaveAttribute("href", "/about");
});
