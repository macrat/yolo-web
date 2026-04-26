import { describe, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import SiteFooter from "../SiteFooter";

const LINK_GROUPS = [
  {
    heading: "ツール",
    links: [
      { href: "/tools", label: "ツール一覧" },
      { href: "/cheatsheets", label: "チートシート" },
    ],
  },
];

describe("SiteFooter", () => {
  // --- レンダリング ---

  test("renders contentinfo landmark", () => {
    render(<SiteFooter linkGroups={LINK_GROUPS} />);
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  test("renders footer navigation", () => {
    render(<SiteFooter linkGroups={LINK_GROUPS} />);
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });

  test("renders group heading", () => {
    render(<SiteFooter linkGroups={LINK_GROUPS} />);
    expect(screen.getByText("ツール")).toBeInTheDocument();
  });

  test("renders group links with correct href", () => {
    render(<SiteFooter linkGroups={LINK_GROUPS} />);
    const link = screen.getByRole("link", { name: "ツール一覧" });
    expect(link).toHaveAttribute("href", "/tools");
  });

  test("renders disclaimer text by default", () => {
    render(<SiteFooter linkGroups={LINK_GROUPS} />);
    // AIによる実験的プロジェクト の免責文が表示される
    expect(screen.getByText(/AI/)).toBeInTheDocument();
  });

  test("renders custom disclaimer when provided", () => {
    render(<SiteFooter linkGroups={LINK_GROUPS} disclaimer="カスタム免責" />);
    expect(screen.getByText("カスタム免責")).toBeInTheDocument();
  });

  // --- アクセシビリティ ---

  test("navigation has accessible label", () => {
    render(<SiteFooter linkGroups={LINK_GROUPS} />);
    const nav = screen.getByRole("navigation");
    expect(nav).toHaveAttribute("aria-label");
  });

  // --- データバリエーション ---

  test("renders multiple link groups", () => {
    const groups = [
      { heading: "A", links: [{ href: "/a", label: "A link" }] },
      { heading: "B", links: [{ href: "/b", label: "B link" }] },
    ];
    render(<SiteFooter linkGroups={groups} />);
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
  });
});
