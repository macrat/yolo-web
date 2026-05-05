import { expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import AboutPage from "../page";

test("About page renders heading", () => {
  render(<AboutPage />);
  expect(
    screen.getByRole("heading", { level: 1, name: /このサイトについて/ }),
  ).toBeInTheDocument();
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
