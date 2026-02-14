import { expect, test, describe } from "vitest";
import { render, screen } from "@testing-library/react";
import Breadcrumb from "../Breadcrumb";

describe("Breadcrumb", () => {
  const items = [
    { label: "ホーム", href: "/" },
    { label: "ツール", href: "/tools" },
    { label: "文字数カウント" },
  ];

  test("renders all breadcrumb items", () => {
    render(<Breadcrumb items={items} />);
    expect(screen.getByText("ホーム")).toBeInTheDocument();
    expect(screen.getByText("ツール")).toBeInTheDocument();
    expect(screen.getByText("文字数カウント")).toBeInTheDocument();
  });

  test("renders links for items with href", () => {
    render(<Breadcrumb items={items} />);
    const homeLink = screen.getByRole("link", { name: "ホーム" });
    expect(homeLink).toHaveAttribute("href", "/");
    const toolsLink = screen.getByRole("link", { name: "ツール" });
    expect(toolsLink).toHaveAttribute("href", "/tools");
  });

  test("last item has aria-current='page'", () => {
    render(<Breadcrumb items={items} />);
    const current = screen.getByText("文字数カウント");
    expect(current).toHaveAttribute("aria-current", "page");
  });

  test("renders nav with correct aria-label", () => {
    render(<Breadcrumb items={items} />);
    expect(
      screen.getByRole("navigation", { name: "パンくずリスト" }),
    ).toBeInTheDocument();
  });

  test("renders separators between items", () => {
    render(<Breadcrumb items={items} />);
    const separators = screen.getAllByText("/");
    expect(separators).toHaveLength(2);
    for (const sep of separators) {
      expect(sep).toHaveAttribute("aria-hidden", "true");
    }
  });

  test("renders BreadcrumbList JSON-LD script", () => {
    const { container } = render(<Breadcrumb items={items} />);
    const script = container.querySelector(
      'script[type="application/ld+json"]',
    );
    expect(script).not.toBeNull();
    const jsonLd = JSON.parse(script!.textContent!);
    expect(jsonLd["@type"]).toBe("BreadcrumbList");
    expect(jsonLd.itemListElement).toHaveLength(3);
    expect(jsonLd.itemListElement[0].position).toBe(1);
    expect(jsonLd.itemListElement[0].name).toBe("ホーム");
    expect(jsonLd.itemListElement[2].name).toBe("文字数カウント");
    // Last item should not have an "item" property (no href)
    expect(jsonLd.itemListElement[2].item).toBeUndefined();
  });
});
