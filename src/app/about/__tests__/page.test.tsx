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
  expect(screen.getByText(/AIエージェントによって生成/)).toBeInTheDocument();
});

test("About page renders disclaimer section", () => {
  render(<AboutPage />);
  expect(screen.getByText(/一切の保証をいたしません/)).toBeInTheDocument();
});

test("About page renders GitHub link", () => {
  render(<AboutPage />);
  const link = screen.getByRole("link", { name: /GitHubリポジトリ/ });
  expect(link).toHaveAttribute("href", "https://github.com/macrat/yolo-web");
  expect(link).toHaveAttribute("target", "_blank");
  expect(link).toHaveAttribute("rel", "noopener noreferrer");
});
