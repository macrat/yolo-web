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
      />,
    );
    expect(
      screen.getByRole("heading", { name: "他のタイプ（3）" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("list", { name: "他のタイプ（3）" }),
    ).toBeInTheDocument();
  });

  test("全タイプを渡された順に並べ、各行のリンクの名前がタイプ名だけであること", () => {
    render(
      <OtherTypesNav
        quizSlug="word-sense-personality"
        currentResultId="type-a"
        results={results}
      />,
    );
    const list = screen.getByRole("list", { name: "他のタイプ（3）" });
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
      />,
    );
    expect(screen.getByRole("link", { name: "タイプB" })).toHaveAttribute(
      "href",
      "/play/word-sense-personality/result/type-b",
    );
  });

  test("いまのタイプは現在地（aria-current=page のリンク）で、ほかのタイプは現在地でないこと", () => {
    render(
      <OtherTypesNav
        quizSlug="word-sense-personality"
        currentResultId="type-a"
        results={results}
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

  test("showSwatch のとき、色を持つタイプの行に色見本を置くこと", () => {
    const { container } = render(
      <OtherTypesNav
        quizSlug="traditional-color"
        currentResultId="type-a"
        results={results}
        showSwatch
      />,
    );
    const swatches = container.querySelectorAll<HTMLElement>(
      'li > span[aria-hidden="true"]',
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
      />,
    );
    expect(
      container.querySelectorAll('li > span[aria-hidden="true"]'),
    ).toHaveLength(0);
  });

  test("headingLevel=2 のとき見出しが h2 になること（結果のページ用）", () => {
    render(
      <OtherTypesNav
        quizSlug="word-sense-personality"
        currentResultId="type-a"
        results={results}
        headingLevel={2}
      />,
    );
    expect(
      screen.getByRole("heading", { level: 2, name: "他のタイプ（3）" }),
    ).toBeInTheDocument();
  });

  test("headingLevel を渡さないとき見出しが h3 になること（解き終えた画面用）", () => {
    render(
      <OtherTypesNav
        quizSlug="word-sense-personality"
        currentResultId="type-a"
        results={results}
      />,
    );
    expect(
      screen.getByRole("heading", { level: 3, name: "他のタイプ（3）" }),
    ).toBeInTheDocument();
  });

  test("1件以下のときは何も描画されないこと", () => {
    const { container } = render(
      <OtherTypesNav
        quizSlug="word-sense-personality"
        currentResultId="type-a"
        results={[results[0]]}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
