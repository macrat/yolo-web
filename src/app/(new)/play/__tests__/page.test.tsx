/**
 * あそび一覧（/play）のテスト — DESIGN.md フェーズ R・新デザイン変換版
 *
 * 旧実装（PlayFilterableList によるキーワード検索/カテゴリ絞り込みUI + PlayGrid の
 * カードグリッド）を、カテゴリ別の品書き（Shinagaki）一覧へ置き換えた。
 * このテストは新しい構成（棚+品書き）を検証し、旧UI（検索ボックス・絞り込みナビ）が
 * 存在しないことも確認する。
 *
 * レジストリ（allPlayContents 等）はモックせず実データを使う。トップページの
 * page.test.tsx と同じ方針——データが変わればテストが追従して検証する。
 */
import { expect, test, describe } from "vitest";
import { render, screen, within } from "@testing-library/react";
import PlayPage, { metadata } from "../page";
import {
  allPlayContents,
  quizQuestionCountBySlug,
  DAILY_UPDATE_SLUGS,
} from "@/play/registry";
import { getContentPath } from "@/play/paths";
import { PLAY_CATEGORIES } from "@/play/_components/categoryLabels";

describe("(new)/play/page.tsx", () => {
  test("h1 はページに1つで、「遊ぶ」を表示する", () => {
    render(<PlayPage />);
    const h1s = screen.getAllByRole("heading", { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent("遊ぶ");
  });

  test("名乗りにコンテンツ総数（実データ由来）が含まれる", () => {
    render(<PlayPage />);
    expect(
      screen.getByText(new RegExp(`全${allPlayContents.length}種`)),
    ).toBeInTheDocument();
  });

  test("カテゴリごとの棚見出しが、コンテンツが実在するカテゴリぶんだけ表示される", () => {
    render(<PlayPage />);
    const nonEmptyLabels = PLAY_CATEGORIES.filter(({ value }) =>
      allPlayContents.some((c) => c.category === value),
    ).map(({ label }) => label);
    const headings = screen.getAllByRole("heading", { level: 2 });
    expect(headings.map((h) => h.textContent)).toEqual(nonEmptyLabels);
  });

  test("全コンテンツが実在パスへのリンクとして一覧に表示される", () => {
    render(<PlayPage />);
    for (const content of allPlayContents) {
      const displayName = content.shortTitle ?? content.title;
      const link = screen.getByRole("link", { name: displayName });
      expect(link).toHaveAttribute("href", getContentPath(content));
    }
  });

  test("毎日更新コンテンツにだけ「毎日更新」の値札が付く（DAILY_UPDATE_SLUGSが単一情報源）", () => {
    render(<PlayPage />);
    const dailyBadges = screen.getAllByText("毎日更新");
    expect(dailyBadges).toHaveLength(DAILY_UPDATE_SLUGS.size);
  });

  test("クイズには問題数の値札が付く（quizQuestionCountBySlugが単一情報源）", () => {
    render(<PlayPage />);
    const [slug, count] = [...quizQuestionCountBySlug.entries()][0];
    const content = allPlayContents.find((c) => c.slug === slug);
    expect(content).toBeDefined();
    const displayName = content!.shortTitle ?? content!.title;
    const link = screen.getByRole("link", { name: displayName });
    const row = link.closest("li");
    expect(row).not.toBeNull();
    expect(
      within(row as HTMLElement).getByText(`全${count}問`),
    ).toBeInTheDocument();
  });

  test("ゲーム棚にはクイズの問題数の値札が付かない（中身の無いラベルを貼らない・§4）", () => {
    render(<PlayPage />);
    const gameContent = allPlayContents.find((c) => c.category === "game");
    expect(gameContent).toBeDefined();
    const displayName = gameContent!.shortTitle ?? gameContent!.title;
    const link = screen.getByRole("link", { name: displayName });
    const row = link.closest("li");
    expect(row).not.toBeNull();
    expect(within(row as HTMLElement).queryByText(/^全\d+問$/)).toBeNull();
  });

  test("旧デザインのキーワード検索ボックスは存在しない", () => {
    render(<PlayPage />);
    expect(screen.queryByRole("searchbox")).toBeNull();
  });

  test("旧デザインのカテゴリ絞り込みナビゲーションは存在しない", () => {
    render(<PlayPage />);
    expect(
      screen.queryByRole("navigation", { name: "カテゴリで絞り込む" }),
    ).toBeNull();
  });

  test("metadata の description にコンテンツ総数が含まれる", () => {
    expect(metadata.description).toContain(`全${allPlayContents.length}種`);
  });
});
