import { expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import TableOfContents from "../TableOfContents";

test("TableOfContents renders section links", () => {
  const sections = [
    { id: "basics", title: "基本操作" },
    { id: "advanced", title: "応用" },
  ];
  render(<TableOfContents sections={sections} />);
  expect(screen.getByText("基本操作")).toBeInTheDocument();
  expect(screen.getByText("応用")).toBeInTheDocument();
});

test("TableOfContents generates correct anchor links", () => {
  const sections = [
    { id: "basics", title: "基本操作" },
    { id: "advanced", title: "応用" },
  ];
  render(<TableOfContents sections={sections} />);
  const links = screen.getAllByRole("link");
  expect(links[0]).toHaveAttribute("href", "#basics");
  expect(links[1]).toHaveAttribute("href", "#advanced");
});

test("TableOfContents returns null for empty sections", () => {
  const { container } = render(<TableOfContents sections={[]} />);
  expect(container.innerHTML).toBe("");
});

test("TableOfContents has navigation role", () => {
  const sections = [{ id: "s1", title: "Section 1" }];
  render(<TableOfContents sections={sections} />);
  expect(screen.getByRole("navigation", { name: "目次" })).toBeInTheDocument();
});
