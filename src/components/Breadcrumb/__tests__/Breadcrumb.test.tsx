import { expect, test, describe } from "vitest";
import { render, screen } from "@testing-library/react";
import Breadcrumb from "@/components/Breadcrumb";
import { BASE_URL } from "@/lib/constants";

describe("Breadcrumb", () => {
  const items = [
    { label: "ホーム", href: "/" },
    { label: "ツール", href: "/tools" },
    { label: "文字数カウント", href: "/tools/char-count" },
  ];

  test("items 配列の長さに応じた <li> が生成される", () => {
    render(<Breadcrumb items={items} />);
    const listItems = screen.getAllByRole("listitem");
    expect(listItems).toHaveLength(3);
  });

  test("1 件のみの場合も <li> が 1 つ生成される", () => {
    render(<Breadcrumb items={[{ label: "ホーム", href: "/" }]} />);
    const listItems = screen.getAllByRole("listitem");
    expect(listItems).toHaveLength(1);
  });

  test("どの項目もリンクで、行き先を持つ", () => {
    render(<Breadcrumb items={items} />);
    const links = screen.getAllByRole("link");
    expect(links.map((link) => link.textContent)).toEqual([
      "ホーム",
      "ツール",
      "文字数カウント",
    ]);
    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      "/",
      "/tools",
      "/tools/char-count",
    ]);
  });

  // §6 の現在地: リンクのままで、キーボードで到達でき、aria-current で現在地と伝わる
  test("最後の項目だけが現在地（aria-current='page'）のリンクになる", () => {
    render(<Breadcrumb items={items} />);
    const current = screen.getByRole("link", { name: "文字数カウント" });
    expect(current).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "ツール" })).not.toHaveAttribute(
      "aria-current",
    );
    expect(screen.getByRole("link", { name: "ホーム" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  test("どの項目も縁の見えないコントロールの字の箱を持つ", () => {
    render(<Breadcrumb items={items} />);
    for (const link of screen.getAllByRole("link")) {
      expect(link).toHaveAttribute("data-text-box", "inline");
    }
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

  // 区切りを前の項目の後ろに置くと、li のあいだで折り返しても項目の中で折り返しても、行の頭が項目の名前になる
  test("区切りは、いまのページより前の各 li の末尾にある", () => {
    const { container } = render(<Breadcrumb items={items} />);
    const listItems = container.querySelectorAll("li");
    expect(listItems[0].lastElementChild).toHaveAttribute(
      "aria-hidden",
      "true",
    );
    expect(listItems[1].lastElementChild).toHaveAttribute(
      "aria-hidden",
      "true",
    );
    expect(listItems[2].querySelector("[aria-hidden='true']")).toBeNull();
  });

  test("separator の textContent が '/' であること", () => {
    const { container } = render(<Breadcrumb items={items} />);
    const separators = container.querySelectorAll("[aria-hidden='true']");
    expect(separators).toHaveLength(2);
    separators.forEach((sep) => {
      expect(sep.textContent?.trim()).toBe("/");
    });
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
    expect(parsed.itemListElement[2].item).toBe(`${BASE_URL}/tools/char-count`);
  });
});
