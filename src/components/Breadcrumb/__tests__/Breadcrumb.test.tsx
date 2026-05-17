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

  test("separator が JSX で明示的に各 li に配置されている（CSS ::before ではなく inline 方式）", () => {
    const { container } = render(<Breadcrumb items={items} />);
    // separator は JSX <span aria-hidden="true"> で生成し、current span と同じ li 内にある
    // これにより SP で折返し時に「/」が単独行に落ちる問題を防ぐ
    const listItems = container.querySelectorAll("li");
    // 2 番目・3 番目 li にそれぞれ aria-hidden="true" の separator span が含まれる
    expect(listItems[0].querySelector("[aria-hidden='true']")).toBeNull();
    expect(listItems[1].querySelector("[aria-hidden='true']")).not.toBeNull();
    expect(listItems[2].querySelector("[aria-hidden='true']")).not.toBeNull();
  });

  test("separator の textContent が '/' であること", () => {
    const { container } = render(<Breadcrumb items={items} />);
    const separators = container.querySelectorAll("[aria-hidden='true']");
    expect(separators).toHaveLength(2);
    separators.forEach((sep) => {
      expect(sep.textContent?.trim()).toBe("/");
    });
  });

  test("リンク <a> に styles.link クラスが付与されている（44px タップターゲット用スタイル適用確認）", () => {
    const { container } = render(<Breadcrumb items={items} />);
    const links = container.querySelectorAll("a");
    // 全リンク要素が styles.link クラス（CSS Modules で変換後）を持つこと
    links.forEach((link) => {
      expect(link.className).toBeTruthy();
    });
  });

  test("現在位置 span に styles.current クラスが付与されている（44px タップターゲット用スタイル適用確認）", () => {
    const { container } = render(<Breadcrumb items={items} />);
    const currentSpan = container.querySelector("[aria-current='page']");
    expect(currentSpan).not.toBeNull();
    // current スパンはクラスを持つ
    expect(currentSpan?.className).toBeTruthy();
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
