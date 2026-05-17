import { describe, expect, test } from "vitest";
import { calculateNewSlugs } from "../newSlugsHelper";
import type { BlogPostMeta } from "@/blog/_lib/blog";

/** テスト用 BlogPostMeta を最小フィールドで生成するヘルパー */
function makePost(slug: string, published_at: string): BlogPostMeta {
  return {
    slug,
    title: slug,
    description: "",
    published_at,
    updated_at: published_at,
    tags: [],
    category: "dev-notes",
    related_tool_slugs: [],
    draft: false,
    readingTime: 3,
    trustLevel: "generated",
  };
}

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * テスト用基準時刻（JST 2026-05-06 09:00:00）。
 * ブログの published_at はハイフン区切り（YYYY-MM-DD）で、
 * テストデータはその形式で渡す。
 */
const BASE_NOW = new Date("2026-05-06T09:00:00+09:00").getTime();

describe("calculateNewSlugs", () => {
  // (i) 30 日以内 × 上位 5 件の積集合が正しく計算される
  test("30日以内かつ上位5件に含まれる記事が newSlugs に含まれる", () => {
    const now = BASE_NOW;
    const posts = [
      makePost("post-1", new Date(now - 1 * DAY_MS).toISOString().slice(0, 10)),
      makePost("post-2", new Date(now - 5 * DAY_MS).toISOString().slice(0, 10)),
      makePost(
        "post-3",
        new Date(now - 10 * DAY_MS).toISOString().slice(0, 10),
      ),
      makePost(
        "post-4",
        new Date(now - 15 * DAY_MS).toISOString().slice(0, 10),
      ),
      makePost(
        "post-5",
        new Date(now - 20 * DAY_MS).toISOString().slice(0, 10),
      ),
      makePost(
        "post-6",
        new Date(now - 25 * DAY_MS).toISOString().slice(0, 10),
      ), // 6位（上位5件外）
    ];
    const result = calculateNewSlugs(posts, now);
    // post-1 〜 post-5 は上位5件かつ30日以内
    expect(result.has("post-1")).toBe(true);
    expect(result.has("post-5")).toBe(true);
    // post-6 は30日以内だが6位なので除外
    expect(result.has("post-6")).toBe(false);
  });

  // (ii) 30 日超過のものは除外（境界 = 30 日ジャストの境界条件）
  test("30日超過の記事は上位5件でも newSlugs に含まれない", () => {
    const now = BASE_NOW;
    const posts = [
      makePost(
        "post-old-1",
        new Date(now - 31 * DAY_MS).toISOString().slice(0, 10),
      ),
      makePost(
        "post-old-2",
        new Date(now - 60 * DAY_MS).toISOString().slice(0, 10),
      ),
    ];
    const result = calculateNewSlugs(posts, now);
    expect(result.size).toBe(0);
  });

  test("30日ジャストの記事は newSlugs に含まれない（境界条件：30日未満が条件）", () => {
    const now = BASE_NOW;
    const exactly30DaysAgo = now - 30 * DAY_MS;
    const posts = [
      makePost(
        "post-exact",
        new Date(exactly30DaysAgo).toISOString().slice(0, 10),
      ),
    ];
    const result = calculateNewSlugs(posts, now);
    // ハイフン区切り（YYYY-MM-DD）の場合、日付が同じなら midnight 扱いになる
    // 境界条件として 30 日を超えていることを確認
    // YYYY-MM-DD は midnight JST と解釈されるため、実際の差異が 30 日以上になる
    // → 含まれないか含まれるかは実装依存、ここでは「30日超過は含まれない」を確認
    expect(result.has("post-exact")).toBe(false);
  });

  // (iii) 公開記事が 5 件以下のとき全件返る
  test("記事が5件以下の場合は30日以内のものすべてが newSlugs に含まれる", () => {
    const now = BASE_NOW;
    const posts = [
      makePost("post-a", new Date(now - 5 * DAY_MS).toISOString().slice(0, 10)),
      makePost(
        "post-b",
        new Date(now - 25 * DAY_MS).toISOString().slice(0, 10),
      ),
      makePost(
        "post-c",
        new Date(now - 35 * DAY_MS).toISOString().slice(0, 10),
      ), // 30日超え
    ];
    const result = calculateNewSlugs(posts, now);
    expect(result.has("post-a")).toBe(true);
    expect(result.has("post-b")).toBe(true);
    expect(result.has("post-c")).toBe(false);
  });

  // (iv) 上位 5 件の選定が published_at 降順
  test("上位5件の判定は published_at 降順（新しい順）で行われる", () => {
    const now = BASE_NOW;
    // 6件すべて30日以内。最も新しい5件だけが含まれるべき
    const posts = [
      makePost(
        "post-newest",
        new Date(now - 1 * DAY_MS).toISOString().slice(0, 10),
      ),
      makePost(
        "post-second",
        new Date(now - 5 * DAY_MS).toISOString().slice(0, 10),
      ),
      makePost(
        "post-third",
        new Date(now - 10 * DAY_MS).toISOString().slice(0, 10),
      ),
      makePost(
        "post-fourth",
        new Date(now - 15 * DAY_MS).toISOString().slice(0, 10),
      ),
      makePost(
        "post-fifth",
        new Date(now - 20 * DAY_MS).toISOString().slice(0, 10),
      ),
      makePost(
        "post-sixth",
        new Date(now - 25 * DAY_MS).toISOString().slice(0, 10),
      ), // 6位
    ];
    const result = calculateNewSlugs(posts, now);
    expect(result.has("post-newest")).toBe(true);
    expect(result.has("post-fifth")).toBe(true);
    expect(result.has("post-sixth")).toBe(false);
    expect(result.size).toBe(5);
  });

  // (v) published_at がハイフン区切り文字列でも正しくパースされる
  test("published_at がハイフン区切り（YYYY-MM-DD）でも正しくパースされる", () => {
    const now = BASE_NOW;
    // ハイフン区切り形式（ブログ記事の実際のフォーマット）
    const posts = [
      makePost("post-hyphen-recent", "2026-04-20"), // 16日前（30日以内）
      makePost("post-hyphen-old", "2026-03-01"), // 66日前（30日超過）
    ];
    const result = calculateNewSlugs(posts, now);
    expect(result.has("post-hyphen-recent")).toBe(true);
    expect(result.has("post-hyphen-old")).toBe(false);
  });
});
