import { describe, test, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CrossCategoryBanner } from "@/play/games/shared/_components/CrossCategoryBanner";
import type { CrossCategoryItem } from "@/play/games/shared/_components/CrossCategoryBanner";

// テスト用サンプルデータ
const fortuneItem: CrossCategoryItem = {
  slug: "daily",
  title: "今日のユーモア運勢",
  icon: "🔮",
  contentPath: "/play/daily",
  categoryLabel: "運勢",
  category: "fortune",
};

const knowledgeItem: CrossCategoryItem = {
  slug: "kanji-level",
  title: "漢字レベル診断",
  icon: "📝",
  contentPath: "/play/kanji-level",
  categoryLabel: "知識テスト",
  category: "knowledge",
};

const personalityItem: CrossCategoryItem = {
  slug: "animal-personality",
  title: "動物診断",
  icon: "🐻",
  contentPath: "/play/animal-personality",
  categoryLabel: "診断",
  category: "personality",
};

describe("CrossCategoryBanner", () => {
  test("shows correct number of items", () => {
    render(<CrossCategoryBanner items={[fortuneItem, knowledgeItem]} />);

    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(2);
  });

  test("shows fortune content", () => {
    render(<CrossCategoryBanner items={[fortuneItem, knowledgeItem]} />);

    expect(screen.getByText("今日のユーモア運勢")).toBeInTheDocument();
  });

  test("shows label text", () => {
    render(<CrossCategoryBanner items={[fortuneItem, knowledgeItem]} />);

    expect(
      screen.getByText("他のコンテンツも試してみよう"),
    ).toBeInTheDocument();
  });

  test("shows correct link paths", () => {
    render(<CrossCategoryBanner items={[fortuneItem, knowledgeItem]} />);

    const links = screen.getAllByRole("link");
    const fortuneLink = links.find(
      (link) => link.getAttribute("href") === "/play/daily",
    );
    expect(fortuneLink).toBeDefined();
  });

  test("shows badges for each content", () => {
    render(<CrossCategoryBanner items={[fortuneItem, knowledgeItem]} />);

    expect(screen.getByText("運勢")).toBeInTheDocument();
    expect(screen.getByText("知識テスト")).toBeInTheDocument();
  });

  test("sets data-category attribute on badges", () => {
    render(<CrossCategoryBanner items={[fortuneItem, personalityItem]} />);

    const fortuneBadge = screen.getByText("運勢");
    expect(fortuneBadge).toHaveAttribute("data-category", "fortune");

    const personalityBadge = screen.getByText("診断");
    expect(personalityBadge).toHaveAttribute("data-category", "personality");
  });

  test("shows icons", () => {
    render(<CrossCategoryBanner items={[fortuneItem, knowledgeItem]} />);

    expect(screen.getByText("🔮")).toBeInTheDocument();
    expect(screen.getByText("📝")).toBeInTheDocument();
  });

  test("returns null when items is empty", () => {
    const { container } = render(<CrossCategoryBanner items={[]} />);
    expect(container.firstChild).toBeNull();
  });

  test("shows single item correctly", () => {
    render(<CrossCategoryBanner items={[fortuneItem]} />);

    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(1);
    expect(screen.getByText("今日のユーモア運勢")).toBeInTheDocument();
  });

  test("icons have aria-hidden attribute", () => {
    render(<CrossCategoryBanner items={[fortuneItem]} />);

    const icon = screen.getByText("🔮");
    expect(icon).toHaveAttribute("aria-hidden", "true");
  });
});
