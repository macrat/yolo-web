import { expect, test, describe } from "vitest";
import { render, screen } from "@testing-library/react";
import Breadcrumb from "@/components/Breadcrumb";
import { BASE_URL } from "@/lib/constants";

describe("Breadcrumb", () => {
  const items = [
    { label: "ホーム", href: "/" },
    { label: "ツール", href: "/tools" },
    { label: "文字数カウント" },
  ];

  test("items 配列の長さに応じた <li> が生成される", () => {
    render(<Breadcrumb items={items} />);
    const listItems = screen.getAllByRole("listitem");
    expect(listItems).toHaveLength(3);
  });

  test("1 件のみの場合も <li> が 1 つ生成される", () => {
    render(<Breadcrumb items={[{ label: "ホーム" }]} />);
    const listItems = screen.getAllByRole("listitem");
    expect(listItems).toHaveLength(1);
  });

  test("最後の要素に aria-current='page' が付く", () => {
    render(<Breadcrumb items={items} />);
    const current = screen.getByText("文字数カウント");
    expect(current).toHaveAttribute("aria-current", "page");
  });

  test("最後の要素にリンクがない（href なし）", () => {
    render(<Breadcrumb items={items} />);
    const links = screen.getAllByRole("link");
    // ホームとツールの 2 リンクのみで、最後の要素はリンクではない
    expect(links).toHaveLength(2);
    const linkNames = links.map((l) => l.textContent);
    expect(linkNames).not.toContain("文字数カウント");
  });

  test("href を持つ要素はリンクとしてレンダリングされる", () => {
    render(<Breadcrumb items={items} />);
    const homeLink = screen.getByRole("link", { name: "ホーム" });
    expect(homeLink).toHaveAttribute("href", "/");
    const toolsLink = screen.getByRole("link", { name: "ツール" });
    expect(toolsLink).toHaveAttribute("href", "/tools");
  });

  test("nav 要素に aria-label='パンくずリスト' が付く", () => {
    render(<Breadcrumb items={items} />);
    expect(
      screen.getByRole("navigation", { name: "パンくずリスト" }),
    ).toBeInTheDocument();
  });

  test("<ol> リストが存在する", () => {
    render(<Breadcrumb items={items} />);
    const list = screen.getByRole("list");
    expect(list.tagName).toBe("OL");
  });

  test("BreadcrumbList JSON-LD script が出力される", () => {
    const { container } = render(<Breadcrumb items={items} />);
    const script = container.querySelector(
      'script[type="application/ld+json"]',
    );
    expect(script).not.toBeNull();
    const parsed = JSON.parse(script!.textContent ?? "");
    expect(parsed["@type"]).toBe("BreadcrumbList");
    expect(parsed.itemListElement).toHaveLength(3);
    expect(parsed.itemListElement[0].name).toBe("ホーム");
    expect(parsed.itemListElement[0].item).toBe(`${BASE_URL}/`);
    expect(parsed.itemListElement[2].name).toBe("文字数カウント");
    // 最後の要素（現在位置）は item プロパティを持たない
    expect(parsed.itemListElement[2].item).toBeUndefined();
  });
});
