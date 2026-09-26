import { expect, test, describe, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import React from "react";
import OtherTypesNav from "../OtherTypesNav";
import type { QuizResult } from "../../types";

// next/link をモック（テスト環境で <a> として描画する）
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const results: QuizResult[] = [
  {
    id: "type-a",
    title: "タイプA",
    description: "説明A",
    icon: "🅰️",
    color: "#111111",
  },
  { id: "type-b", title: "タイプB", description: "説明B", icon: "🅱️" },
  { id: "type-c", title: "タイプC", description: "説明C" },
];

describe("OtherTypesNav", () => {
  test("見出しがタイプの数を言い、一覧がその見出しの名前を持つこと", () => {
    render(
      <OtherTypesNav
        quizSlug="word-sense-personality"
        currentResultId="type-a"
        results={results}
        placement="solvedScreen"
      />,
    );
    expect(
      screen.getByRole("heading", { name: "すべてのタイプ（3）" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("list", { name: "すべてのタイプ（3）" }),
    ).toBeInTheDocument();
  });

  test("全タイプを渡された順に並べ、各行のリンクの名前がタイプ名だけであること", () => {
    render(
      <OtherTypesNav
        quizSlug="word-sense-personality"
        currentResultId="type-a"
        results={results}
        placement="solvedScreen"
      />,
    );
    const list = screen.getByRole("list", { name: "すべてのタイプ（3）" });
    const names = within(list)
      .getAllByRole("link")
      .map((link) => link.textContent);
    expect(names).toEqual(["タイプA", "タイプB", "タイプC"]);
  });

  test("各行は同じ診断の結果ページへ進むこと", () => {
    render(
      <OtherTypesNav
        quizSlug="word-sense-personality"
        currentResultId="type-a"
        results={results}
        placement="solvedScreen"
      />,
    );
    expect(screen.getByRole("link", { name: "タイプB" })).toHaveAttribute(
      "href",
      "/play/word-sense-personality/result/type-b",
    );
  });

  test("結果のページでは、いまのタイプが現在地（aria-current=page）で、ほかのタイプは現在地でないこと", () => {
    render(
      <OtherTypesNav
        quizSlug="word-sense-personality"
        currentResultId="type-a"
        results={results}
        placement="resultPage"
      />,
    );
    expect(screen.getByRole("link", { name: "タイプA" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "タイプB" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  test("解き終えた画面では、いまのタイプは結果のページへ移る行なので、現在地でなくいまの項目（aria-current=true）であること", () => {
    render(
      <OtherTypesNav
        quizSlug="word-sense-personality"
        currentResultId="type-a"
        results={results}
        placement="solvedScreen"
      />,
    );
    expect(screen.getByRole("link", { name: "タイプA" })).toHaveAttribute(
      "aria-current",
      "true",
    );
    expect(screen.getByRole("link", { name: "タイプB" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  test("解き終えた画面では、いまのタイプの行だけに「あなたのタイプ」とリンクの外で添えること", () => {
    render(
      <OtherTypesNav
        quizSlug="word-sense-personality"
        currentResultId="type-b"
        results={results}
        placement="solvedScreen"
      />,
    );
    const label = screen.getByText("あなたのタイプ");
    expect(label.closest("a")).toBeNull();
    expect(label.closest("li")).toContainElement(
      screen.getByRole("link", { name: "タイプB" }),
    );
    expect(screen.getAllByText("あなたのタイプ")).toHaveLength(1);
  });

  test("解き終えた画面では、いまのタイプのリンクの説明が「あなたのタイプ」で、ほかのタイプのリンクは説明を持たないこと", () => {
    render(
      <OtherTypesNav
        quizSlug="word-sense-personality"
        currentResultId="type-b"
        results={results}
        placement="solvedScreen"
      />,
    );
    expect(
      screen.getByRole("link", { name: "タイプB" }),
    ).toHaveAccessibleDescription("あなたのタイプ");
    expect(screen.getByRole("link", { name: "タイプA" })).not.toHaveAttribute(
      "aria-describedby",
    );
  });

  test("結果のページでは、いまのタイプは現在地で示し、「あなたのタイプ」と添えないこと", () => {
    render(
      <OtherTypesNav
        quizSlug="word-sense-personality"
        currentResultId="type-b"
        results={results}
        placement="resultPage"
      />,
    );
    expect(screen.queryByText("あなたのタイプ")).toBeNull();
  });

  test("名前と読みに分けたタイプは、名前だけをリンクにし、読みをリンクの外に置くこと", () => {
    render(
      <OtherTypesNav
        quizSlug="traditional-color"
        currentResultId="type-b"
        results={[
          {
            id: "ai",
            title: "藍色(あいいろ)",
            nameParts: { name: "藍色", reading: "あいいろ" },
          },
          ...results.slice(1),
        ]}
        placement="solvedScreen"
      />,
    );
    expect(screen.getByRole("link", { name: "藍色" })).toBeInTheDocument();
    expect(screen.getByText("あいいろ").closest("a")).toBeNull();
  });

  test("showSwatch のとき、色を持つタイプの行に色見本を置くこと", () => {
    const { container } = render(
      <OtherTypesNav
        quizSlug="traditional-color"
        currentResultId="type-a"
        results={results}
        placement="solvedScreen"
        showSwatch
      />,
    );
    const swatches = container.querySelectorAll<HTMLElement>(
      'li span[aria-hidden="true"]',
    );
    expect(swatches).toHaveLength(1);
    expect(swatches[0].style.backgroundColor).toBe("rgb(17, 17, 17)");
  });

  test("showSwatch が無いとき、色見本を置かないこと", () => {
    const { container } = render(
      <OtherTypesNav
        quizSlug="word-sense-personality"
        currentResultId="type-a"
        results={results}
        placement="solvedScreen"
      />,
    );
    expect(
      container.querySelectorAll('li > span[aria-hidden="true"]'),
    ).toHaveLength(0);
  });

  test("結果のページでは見出しが h2 になること", () => {
    render(
      <OtherTypesNav
        quizSlug="word-sense-personality"
        currentResultId="type-a"
        results={results}
        placement="resultPage"
      />,
    );
    expect(
      screen.getByRole("heading", { level: 2, name: "すべてのタイプ（3）" }),
    ).toBeInTheDocument();
  });

  test("解き終えた画面では見出しが h3 になること", () => {
    render(
      <OtherTypesNav
        quizSlug="word-sense-personality"
        currentResultId="type-a"
        results={results}
        placement="solvedScreen"
      />,
    );
    expect(
      screen.getByRole("heading", { level: 3, name: "すべてのタイプ（3）" }),
    ).toBeInTheDocument();
  });

  test("1件以下のときは何も描画されないこと", () => {
    const { container } = render(
      <OtherTypesNav
        quizSlug="word-sense-personality"
        currentResultId="type-a"
        results={[results[0]]}
        placement="solvedScreen"
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
