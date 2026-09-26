/**
 * DailyFortuneCard のテスト。サーバーの描画と最初の描画では占っていることを字で言い、読み込んだあとに
 * 端末の種で選んだ運勢を結果のボックスに出す。
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderToString } from "react-dom/server";
import { render, screen, act, within } from "@testing-library/react";
import DailyFortuneCard from "../DailyFortuneCard";

const mockGetTodayJst = vi.fn(() => "2026-03-28");

vi.mock("@/play/fortune/logic", () => ({
  getUserSeed: () => 12345,
  selectFortune: (today: string) => ({
    id: "test-fortune",
    title: "テスト運勢タイトル",
    description: `${today}の運勢説明文`,
    luckyItem: "テストアイテム",
    luckyAction: "テストアクション",
    rating: 4,
  }),
}));

vi.mock("@/play/games/shared/_lib/crossGameProgress", () => ({
  getTodayJst: () => mockGetTodayJst(),
}));

vi.mock("@/components/ShareButtons", () => ({
  default: ({ text }: { text: string }) => (
    <div data-testid="share-buttons">{text}</div>
  ),
}));

import { resetFortuneCache } from "@/play/fortune/fortuneStore";

const HEADINGS = {
  "test-fortune": { phrases: ["テスト運勢", "タイトル"] },
};
const PENDING_HEADING = { phrases: ["占っています……"] };

async function renderLoaded() {
  await act(async () => {
    render(
      <DailyFortuneCard headings={HEADINGS} pendingHeading={PENDING_HEADING} />,
    );
  });
}

describe("DailyFortuneCard", () => {
  beforeEach(() => {
    resetFortuneCache();
    mockGetTodayJst.mockReturnValue("2026-03-28");
  });

  it("renders only the loading message on the server, not a fortune", () => {
    const html = renderToString(
      <DailyFortuneCard headings={HEADINGS} pendingHeading={PENDING_HEADING} />,
    );
    const text = html.replace(/<[^>]*>/g, "");
    expect(text).toContain("占っています……");
    expect(text).not.toContain("テスト運勢タイトル");
    expect(text).not.toContain("運勢説明文");
  });

  it("renders the fortune name as the heading of the result box", async () => {
    await renderLoaded();
    const heading = screen.getByRole("heading", {
      level: 2,
      name: "テスト運勢タイトル",
    });
    expect(heading.querySelectorAll("wbr")).toHaveLength(1);
    expect(
      screen.getByRole("region", { name: "テスト運勢タイトル" }),
    ).toContainElement(heading);
  });

  it("renders the date, stars, description, lucky item and action inside the result box", async () => {
    await renderLoaded();
    const region = screen.getByRole("region", { name: "テスト運勢タイトル" });
    expect(
      within(region).getByText("2026年3月28日のユーモア運勢"),
    ).toBeInTheDocument();
    expect(
      within(region).getByRole("img", { name: "5つ星のうち4.0" }),
    ).toBeInTheDocument();
    expect(
      within(region).getByText("2026-03-28の運勢説明文"),
    ).toBeInTheDocument();
    expect(within(region).getByText("テストアイテム")).toBeInTheDocument();
    expect(within(region).getByText("テストアクション")).toBeInTheDocument();
  });

  it("puts the share buttons right after the result box under a heading, with the rating in the same form", async () => {
    await renderLoaded();
    const region = screen.getByRole("region", { name: "テスト運勢タイトル" });
    const share = screen.getByRole("region", { name: "この結果を共有" });
    expect(region.nextElementSibling).toBe(share);
    expect(within(share).getByTestId("share-buttons").textContent).toBe(
      "今日のユーモア運勢は「テスト運勢タイトル」(4.0/5) でした！　#ユーモア運勢 #yolosnet",
    );
  });

  it("does not animate the result box, since it appears on opening the page", async () => {
    await renderLoaded();
    const region = screen.getByRole("region", { name: "テスト運勢タイトル" });
    expect(region.className).not.toMatch(/appears/);
  });

  it("renders the comeback message", async () => {
    await renderLoaded();
    const share = screen.getByRole("region", { name: "この結果を共有" });
    expect(share.nextElementSibling?.textContent).toBe(
      "明日も来てね！　毎日運勢が変わります",
    );
  });

  it("shows the new day's fortune when the date in Japan changes while the page is open", async () => {
    await renderLoaded();
    mockGetTodayJst.mockReturnValue("2026-03-29");
    await act(async () => {
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(screen.getByText("2026年3月29日のユーモア運勢")).toBeInTheDocument();
    expect(screen.getByText("2026-03-29の運勢説明文")).toBeInTheDocument();
  });
});
