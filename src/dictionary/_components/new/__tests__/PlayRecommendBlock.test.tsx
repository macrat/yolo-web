import { describe, expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import { playContentBySlug, quizQuestionCountBySlug } from "@/play/registry";
import PlayRecommendBlock from "../PlayRecommendBlock";

const irodori = playContentBySlug.get("irodori")!;
const traditionalColor = playContentBySlug.get("traditional-color")!;

describe("PlayRecommendBlock", () => {
  test("おすすめが無いときは何も描かない", () => {
    const { container } = render(<PlayRecommendBlock recommendations={[]} />);
    expect(container.firstChild).toBeNull();
  });

  test("見出しを名前に持つ一覧で、行のリンクの読み上げの名前は名前だけである", () => {
    render(
      <PlayRecommendBlock recommendations={[irodori, traditionalColor]} />,
    );
    const list = screen.getByRole("list", { name: "こちらもおすすめ" });
    const links = Array.from(list.querySelectorAll("a"));
    expect(links.map((link) => link.textContent)).toEqual([
      irodori.shortTitle ?? irodori.title,
      traditionalColor.shortTitle ?? traditionalColor.title,
    ]);
    for (const link of links) {
      expect(link).toHaveAccessibleName(link.textContent ?? "");
    }
  });

  test("行は説明・種別・補助情報を持ち、誘いの文を持たない", () => {
    render(
      <PlayRecommendBlock recommendations={[irodori, traditionalColor]} />,
    );
    expect(screen.getByText(irodori.shortDescription)).toBeInTheDocument();
    expect(screen.getByText("パズル")).toBeInTheDocument();
    expect(screen.getByText("毎日更新")).toBeInTheDocument();
    expect(screen.getByText("診断")).toBeInTheDocument();
    expect(
      screen.getByText(
        `全${quizQuestionCountBySlug.get("traditional-color")}問`,
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText(/してみる/)).toBeNull();
  });
});
