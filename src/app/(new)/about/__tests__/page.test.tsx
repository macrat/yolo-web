import { expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import AboutPage, { metadata } from "../page";

test("About page renders heading", () => {
  render(<AboutPage />);
  expect(
    screen.getByRole("heading", { level: 1, name: /このサイトについて/ }),
  ).toBeInTheDocument();
});

test("About page describes the new concept (tools beside daily work)", () => {
  render(<AboutPage />);
  expect(
    screen.getByText(/日常のちょっとした作業の傍で使える道具を集めたサイト/),
  ).toBeInTheDocument();
});

test("About page explains the toolbox (in-place tiles and browser persistence)", () => {
  render(<AboutPage />);
  expect(
    screen.getByRole("heading", { name: /道具箱（トップページ）の使い方/ }),
  ).toBeInTheDocument();
  expect(
    screen.getByText(/各タイルはページを離れずにその場で動きます/),
  ).toBeInTheDocument();
  expect(screen.getByText(/お使いのブラウザに保存され/)).toBeInTheDocument();
});

test("About page does not contain the old concept catchphrase", () => {
  const { container } = render(<AboutPage />);
  expect(container.textContent).not.toMatch(/占い・診断の遊園地/);
  expect(container.textContent).not.toMatch(/占い・診断パーク/);
});

test("About page links to toolbox, tools, blog, and play", () => {
  render(<AboutPage />);
  expect(screen.getByRole("link", { name: "道具箱" })).toHaveAttribute(
    "href",
    "/",
  );
  expect(screen.getByRole("link", { name: "ツール一覧" })).toHaveAttribute(
    "href",
    "/tools",
  );
  // /blog へのリンクは「サイトの歩き方」と「AIによる運営について」の2箇所にある
  const blogLinks = screen.getAllByRole("link", { name: "ブログ" });
  expect(blogLinks.length).toBeGreaterThan(0);
  for (const blogLink of blogLinks) {
    expect(blogLink).toHaveAttribute("href", "/blog");
  }
  expect(screen.getByRole("link", { name: "遊び" })).toHaveAttribute(
    "href",
    "/play",
  );
});

test("About page renders AI disclaimer section", () => {
  render(<AboutPage />);
  expect(
    screen.getByText(/AIエージェントが自律的に企画・開発・運営/),
  ).toBeInTheDocument();
});

test("About page renders disclaimer section", () => {
  render(<AboutPage />);
  expect(
    screen.getByText(/正確性、完全性、有用性に関する保証はいたしません/),
  ).toBeInTheDocument();
});

test("About page renders GitHub link", () => {
  render(<AboutPage />);
  const link = screen.getByRole("link", { name: /GitHubリポジトリ/ });
  expect(link).toHaveAttribute("href", "https://github.com/macrat/yolo-web");
  expect(link).toHaveAttribute("target", "_blank");
  expect(link).toHaveAttribute("rel", "noopener noreferrer");
});

test("metadata reflects the new concept and has no fortune-telling wording", () => {
  const description = metadata.description ?? "";
  expect(description).toContain("道具");
  expect(description).not.toContain("占い");
  expect(description).not.toContain("診断");
  expect(metadata.title).toBe("このサイトについて | yolos.net");
});
