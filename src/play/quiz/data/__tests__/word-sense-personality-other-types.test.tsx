/**
 * 言葉センス診断の「すべてのタイプ」の一覧で、リンクの名前が「〇〇タイプ」になり、読みがリンクの外に出ることを確かめる。
 */
import { describe, test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import OtherTypesNav from "../../_components/OtherTypesNav";
import wordSensePersonalityQuiz from "../word-sense-personality";

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

describe("word-sense-personality — すべてのタイプの一覧", () => {
  test("リンクの名前は読みを含まない「〇〇タイプ」で、読みはリンクの外に置かれること", () => {
    render(
      <OtherTypesNav
        quizSlug={wordSensePersonalityQuiz.meta.slug}
        currentResultId="elegant-precise"
        results={wordSensePersonalityQuiz.results}
        placement="resultPage"
      />,
    );

    const links = screen.getAllByRole("link");
    expect(links.map((link) => link.textContent)).toEqual([
      "一字千金タイプ",
      "和顔愛語タイプ",
      "奇想天外タイプ",
      "理路整然タイプ",
      "花鳥風月タイプ",
      "疾風迅雷タイプ",
      "抱腹絶倒タイプ",
      "柔和温順タイプ",
    ]);

    const reading = screen.getByText("いちじせんきん");
    expect(reading.closest("a")).toBeNull();
    expect(reading.closest("li")).toBe(
      screen.getByRole("link", { name: "一字千金タイプ" }).closest("li"),
    );
  });
});
