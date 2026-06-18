import { expect, test, describe, vi } from "vitest";
import { render, screen } from "@testing-library/react";
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
  test("2件以上のとき見出しと全タイプが描画されること", () => {
    render(
      <OtherTypesNav
        quizSlug="word-sense-personality"
        currentResultId="type-a"
        results={results}
      />,
    );
    expect(screen.getByText("他のタイプも見てみよう")).toBeInTheDocument();
    expect(screen.getByText("タイプA")).toBeInTheDocument();
    expect(screen.getByText("タイプB")).toBeInTheDocument();
    expect(screen.getByText("タイプC")).toBeInTheDocument();
  });

  test("自タイプ以外は同一診断の結果ページへのリンクになること", () => {
    render(
      <OtherTypesNav
        quizSlug="word-sense-personality"
        currentResultId="type-a"
        results={results}
      />,
    );
    expect(screen.getByText("タイプB").closest("a")).toHaveAttribute(
      "href",
      "/play/word-sense-personality/result/type-b",
    );
    expect(screen.getByText("タイプC").closest("a")).toHaveAttribute(
      "href",
      "/play/word-sense-personality/result/type-c",
    );
  });

  test("現在の自タイプはリンクにせず aria-current=page の span で示すこと", () => {
    const { container } = render(
      <OtherTypesNav
        quizSlug="word-sense-personality"
        currentResultId="type-a"
        results={results}
      />,
    );
    const current = container.querySelector('[aria-current="page"]');
    expect(current).not.toBeNull();
    expect(current?.tagName).toBe("SPAN");
    expect(current?.textContent).toContain("タイプA");
    // 自タイプの結果ページへのリンクは存在しない
    expect(
      container.querySelector(
        'a[href="/play/word-sense-personality/result/type-a"]',
      ),
    ).toBeNull();
  });

  test("現在タイプに color があれば --type-color が CSS 変数として設定されること", () => {
    const { container } = render(
      <OtherTypesNav
        quizSlug="word-sense-personality"
        currentResultId="type-a"
        results={results}
      />,
    );
    const current = container.querySelector(
      '[aria-current="page"]',
    ) as HTMLElement | null;
    expect(current).not.toBeNull();
    expect(current?.style.getPropertyValue("--type-color")).toBe("#111111");
  });

  test("ランドマーク nav（aria-label 付き）であること", () => {
    render(
      <OtherTypesNav
        quizSlug="word-sense-personality"
        currentResultId="type-a"
        results={results}
      />,
    );
    expect(
      screen.getByRole("navigation", { name: "同じ診断の他のタイプ" }),
    ).toBeInTheDocument();
  });

  test("headingLevel=2 のとき見出しが h2 になること（静的結果ページ用）", () => {
    const { container } = render(
      <OtherTypesNav
        quizSlug="word-sense-personality"
        currentResultId="type-a"
        results={results}
        headingLevel={2}
      />,
    );
    const h2 = container.querySelector("h2");
    expect(h2?.textContent).toBe("他のタイプも見てみよう");
  });

  test("デフォルト（headingLevel 未指定）は h3 になること（ResultCard 用）", () => {
    const { container } = render(
      <OtherTypesNav
        quizSlug="word-sense-personality"
        currentResultId="type-a"
        results={results}
      />,
    );
    expect(container.querySelector("h3")?.textContent).toBe(
      "他のタイプも見てみよう",
    );
    expect(container.querySelector("h2")).toBeNull();
  });

  test("1件以下のときは何も描画されないこと", () => {
    const { container } = render(
      <OtherTypesNav
        quizSlug="word-sense-personality"
        currentResultId="type-a"
        results={[results[0]]}
      />,
    );
    expect(container.firstChild).toBeNull();
    expect(
      screen.queryByText("他のタイプも見てみよう"),
    ).not.toBeInTheDocument();
  });
});
