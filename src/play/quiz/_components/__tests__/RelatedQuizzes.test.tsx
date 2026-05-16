import { expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import RelatedQuizzes from "../RelatedQuizzes";

// getPlayContentsByCategory をモックしてテストを安定させる
vi.mock("@/play/registry", () => ({
  getPlayContentsByCategory: (category: string) => {
    if (category === "knowledge") {
      return [
        {
          slug: "kanji-level",
          title: "漢字レベル診断",
          shortDescription: "あなたの漢字力を測定",
          icon: "📝",
          category: "knowledge",
          contentType: "quiz",
          description: "漢字力を測る",
          accentColor: "#ff5733",
          keywords: ["漢字"],
          publishedAt: "2026-01-01T00:00:00+09:00",
        },
        {
          slug: "kotowaza-level",
          title: "ことわざレベル診断",
          // shortTitle が存在する場合は title より優先して表示されることをテストするためのデータ
          shortTitle: "ことわざ診断",
          shortDescription: "ことわざの知識を確認",
          icon: "📖",
          category: "knowledge",
          contentType: "quiz",
          description: "ことわざ力を測る",
          accentColor: "#33a1ff",
          keywords: ["ことわざ"],
          publishedAt: "2026-01-02T00:00:00+09:00",
        },
        {
          slug: "yoji-level",
          title: "四字熟語レベル診断",
          shortDescription: "四字熟語の知識を確認",
          icon: "🈵",
          category: "knowledge",
          contentType: "quiz",
          description: "四字熟語力を測る",
          accentColor: "#5733ff",
          keywords: ["四字熟語"],
          publishedAt: "2026-01-03T00:00:00+09:00",
        },
        {
          slug: "traditional-color",
          title: "伝統色クイズ",
          shortDescription: "日本の伝統色を学ぼう",
          icon: "🎨",
          category: "knowledge",
          contentType: "quiz",
          description: "伝統色の知識を測る",
          accentColor: "#33ff57",
          keywords: ["伝統色"],
          publishedAt: "2026-01-04T00:00:00+09:00",
        },
      ];
    }
    return [];
  },
}));

test("RelatedQuizzes renders related quizzes excluding current", () => {
  render(<RelatedQuizzes currentSlug="kanji-level" category="knowledge" />);

  // 見出しが表示される
  expect(
    screen.getByRole("navigation", { name: "関連コンテンツ" }),
  ).toBeInTheDocument();
  expect(
    screen.getByText("他のクイズ・診断も試してみよう"),
  ).toBeInTheDocument();

  // 現在のスラグは除外される
  expect(screen.queryByText("漢字レベル診断")).not.toBeInTheDocument();

  // 他のクイズは表示される（最大3件）
  // shortTitle が設定されている kotowaza-level は shortTitle で表示される
  expect(screen.getByText("ことわざ診断")).toBeInTheDocument();
  expect(screen.getByText("四字熟語レベル診断")).toBeInTheDocument();
  expect(screen.getByText("伝統色クイズ")).toBeInTheDocument();
});

test("RelatedQuizzes renders maximum 3 items", () => {
  render(<RelatedQuizzes currentSlug="kanji-level" category="knowledge" />);

  // kanji-level を除いた3件が表示され、それ以上は表示されない
  const links = screen.getAllByRole("link");
  expect(links.length).toBe(3);
});

test("RelatedQuizzes returns null when no related content exists", () => {
  const { container } = render(
    <RelatedQuizzes currentSlug="kanji-level" category="personality" />,
  );

  expect(container.firstChild).toBeNull();
});

test("RelatedQuizzes excludes only the current slug", () => {
  render(<RelatedQuizzes currentSlug="kotowaza-level" category="knowledge" />);

  // kotowaza-level を除く3件が表示される
  expect(screen.getByText("漢字レベル診断")).toBeInTheDocument();
  expect(screen.queryByText("ことわざ診断")).not.toBeInTheDocument();
  expect(screen.getByText("四字熟語レベル診断")).toBeInTheDocument();
  expect(screen.getByText("伝統色クイズ")).toBeInTheDocument();
});

test("RelatedQuizzes renders shortDescription for each item", () => {
  render(<RelatedQuizzes currentSlug="kanji-level" category="knowledge" />);

  expect(screen.getByText("ことわざの知識を確認")).toBeInTheDocument();
  expect(screen.getByText("四字熟語の知識を確認")).toBeInTheDocument();
});

test("RelatedQuizzes renders icon for each item", () => {
  render(<RelatedQuizzes currentSlug="kanji-level" category="knowledge" />);

  expect(screen.getByText("📖")).toBeInTheDocument();
  expect(screen.getByText("🈵")).toBeInTheDocument();
});

test("RelatedQuizzes prefers shortTitle over title when shortTitle is set", () => {
  render(<RelatedQuizzes currentSlug="kanji-level" category="knowledge" />);

  // kotowaza-level には shortTitle: "ことわざ診断" が設定されているので
  // title: "ことわざレベル診断" ではなく shortTitle が表示される
  expect(screen.getByText("ことわざ診断")).toBeInTheDocument();
  expect(screen.queryByText("ことわざレベル診断")).not.toBeInTheDocument();
});
