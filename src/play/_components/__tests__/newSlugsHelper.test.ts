import { expect, test, describe } from "vitest";
import type { PlayContentMeta } from "@/play/types";
import { calculateNewSlugs } from "../newSlugsHelper";

/** テスト用 PlayContentMeta を最小フィールドで生成するヘルパー */
function makeContent(slug: string, publishedAt: string): PlayContentMeta {
  return {
    slug,
    title: slug,
    description: "",
    shortDescription: "",
    icon: "🎮",
    accentColor: "#000000",
    keywords: [],
    publishedAt,
    trustLevel: "verified",
    contentType: "game",
    category: "game",
  };
}

const DAY_MS = 24 * 60 * 60 * 1000;

describe("calculateNewSlugs", () => {
  test("30日以内かつ上位5件に含まれるコンテンツが newSlugs に含まれる", () => {
    const now = new Date("2026-05-06T00:00:00Z").getTime();
    const contents = [
      makeContent("content-1", new Date(now - 1 * DAY_MS).toISOString()),
      makeContent("content-2", new Date(now - 5 * DAY_MS).toISOString()),
      makeContent("content-3", new Date(now - 10 * DAY_MS).toISOString()),
      makeContent("content-4", new Date(now - 15 * DAY_MS).toISOString()),
      makeContent("content-5", new Date(now - 20 * DAY_MS).toISOString()),
      makeContent("content-6", new Date(now - 25 * DAY_MS).toISOString()), // 上位6件目
    ];
    const result = calculateNewSlugs(contents, now);
    // content-1 〜 content-5 は上位5件かつ30日以内
    expect(result.has("content-1")).toBe(true);
    expect(result.has("content-5")).toBe(true);
    // content-6 は30日以内だが6位なので除外
    expect(result.has("content-6")).toBe(false);
  });

  test("30日を超えるコンテンツは上位5件でも newSlugs に含まれない", () => {
    const now = new Date("2026-05-06T00:00:00Z").getTime();
    const contents = [
      makeContent("content-old-1", new Date(now - 31 * DAY_MS).toISOString()),
      makeContent("content-old-2", new Date(now - 60 * DAY_MS).toISOString()),
    ];
    const result = calculateNewSlugs(contents, now);
    expect(result.size).toBe(0);
  });

  test("コンテンツが5件以下の場合は30日以内のものすべてが newSlugs に含まれる", () => {
    const now = new Date("2026-05-06T00:00:00Z").getTime();
    const contents = [
      makeContent("content-a", new Date(now - 5 * DAY_MS).toISOString()),
      makeContent("content-b", new Date(now - 25 * DAY_MS).toISOString()),
      makeContent("content-c", new Date(now - 35 * DAY_MS).toISOString()), // 30日超え
    ];
    const result = calculateNewSlugs(contents, now);
    expect(result.has("content-a")).toBe(true);
    expect(result.has("content-b")).toBe(true);
    expect(result.has("content-c")).toBe(false);
  });

  test("上位5件の判定は publishedAt 降順（新しい順）で行われる", () => {
    const now = new Date("2026-05-06T00:00:00Z").getTime();
    // 6件すべて30日以内。最も新しい5件だけが含まれるべき
    const contents = [
      makeContent("content-newest", new Date(now - 1 * DAY_MS).toISOString()),
      makeContent("content-second", new Date(now - 5 * DAY_MS).toISOString()),
      makeContent("content-third", new Date(now - 10 * DAY_MS).toISOString()),
      makeContent("content-fourth", new Date(now - 15 * DAY_MS).toISOString()),
      makeContent("content-fifth", new Date(now - 20 * DAY_MS).toISOString()),
      makeContent("content-sixth", new Date(now - 25 * DAY_MS).toISOString()), // 6位
    ];
    const result = calculateNewSlugs(contents, now);
    expect(result.has("content-newest")).toBe(true);
    expect(result.has("content-fifth")).toBe(true);
    expect(result.has("content-sixth")).toBe(false);
    expect(result.size).toBe(5);
  });

  test("30日ジャストのコンテンツは含まれない（境界条件：30日未満が条件）", () => {
    const now = new Date("2026-05-06T00:00:00Z").getTime();
    // ちょうど30日前（境界値）
    const exactly30DaysAgo = now - 30 * DAY_MS;
    const contents = [
      makeContent("content-exact", new Date(exactly30DaysAgo).toISOString()),
    ];
    const result = calculateNewSlugs(contents, now);
    // 30日ジャストは THRESHOLD_MS に達するため除外される（< の条件）
    expect(result.has("content-exact")).toBe(false);
  });

  test("コンテンツが0件の場合は空の Set を返す", () => {
    const now = new Date("2026-05-06T00:00:00Z").getTime();
    const result = calculateNewSlugs([], now);
    expect(result.size).toBe(0);
  });

  test("返り値は ReadonlySet（Set インターフェースを満たす）", () => {
    const now = new Date("2026-05-06T00:00:00Z").getTime();
    const contents = [
      makeContent("content-x", new Date(now - 1 * DAY_MS).toISOString()),
    ];
    const result = calculateNewSlugs(contents, now);
    expect(result).toBeInstanceOf(Set);
    expect(result.has("content-x")).toBe(true);
  });
});
