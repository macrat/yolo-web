import { expect, test } from "vitest";
import type { ToolMeta } from "@/tools/types";

/** テスト用 ToolMeta を最小フィールドで生成するヘルパー */
function makeTool(slug: string, publishedAt: string): ToolMeta {
  return {
    slug,
    name: slug,
    nameEn: slug,
    description: "",
    shortDescription: "",
    keywords: [],
    category: "text",
    relatedSlugs: [],
    publishedAt,
    trustLevel: "verified",
    howItWorks: "",
  };
}

// テスト対象のロジックをインポート（実装後に追加）
import { calculateNewSlugs } from "../newSlugsHelper";

const DAY_MS = 24 * 60 * 60 * 1000;

test("30日以内かつ上位5件に含まれるツールが newSlugs に含まれる", () => {
  const now = new Date("2026-05-06T00:00:00Z").getTime();
  const tools = [
    makeTool("tool-1", new Date(now - 1 * DAY_MS).toISOString()),
    makeTool("tool-2", new Date(now - 5 * DAY_MS).toISOString()),
    makeTool("tool-3", new Date(now - 10 * DAY_MS).toISOString()),
    makeTool("tool-4", new Date(now - 15 * DAY_MS).toISOString()),
    makeTool("tool-5", new Date(now - 20 * DAY_MS).toISOString()),
    makeTool("tool-6", new Date(now - 25 * DAY_MS).toISOString()), // 上位6件目
  ];
  const result = calculateNewSlugs(tools, now);
  // tool-1 〜 tool-5 は上位5件かつ30日以内
  expect(result.has("tool-1")).toBe(true);
  expect(result.has("tool-5")).toBe(true);
  // tool-6 は30日以内だが6位なので除外
  expect(result.has("tool-6")).toBe(false);
});

test("30日を超えるツールは上位5件でも newSlugs に含まれない", () => {
  const now = new Date("2026-05-06T00:00:00Z").getTime();
  const tools = [
    makeTool("tool-old-1", new Date(now - 31 * DAY_MS).toISOString()),
    makeTool("tool-old-2", new Date(now - 60 * DAY_MS).toISOString()),
  ];
  const result = calculateNewSlugs(tools, now);
  expect(result.size).toBe(0);
});

test("ツールが5件以下の場合は30日以内のものすべてが newSlugs に含まれる", () => {
  const now = new Date("2026-05-06T00:00:00Z").getTime();
  const tools = [
    makeTool("tool-a", new Date(now - 5 * DAY_MS).toISOString()),
    makeTool("tool-b", new Date(now - 25 * DAY_MS).toISOString()),
    makeTool("tool-c", new Date(now - 35 * DAY_MS).toISOString()), // 30日超え
  ];
  const result = calculateNewSlugs(tools, now);
  expect(result.has("tool-a")).toBe(true);
  expect(result.has("tool-b")).toBe(true);
  expect(result.has("tool-c")).toBe(false);
});

test("上位5件の判定は publishedAt 降順（新しい順）で行われる", () => {
  const now = new Date("2026-05-06T00:00:00Z").getTime();
  // 6件すべて30日以内。最も新しい5件だけが含まれるべき
  const tools = [
    makeTool("tool-newest", new Date(now - 1 * DAY_MS).toISOString()),
    makeTool("tool-second", new Date(now - 5 * DAY_MS).toISOString()),
    makeTool("tool-third", new Date(now - 10 * DAY_MS).toISOString()),
    makeTool("tool-fourth", new Date(now - 15 * DAY_MS).toISOString()),
    makeTool("tool-fifth", new Date(now - 20 * DAY_MS).toISOString()),
    makeTool("tool-sixth", new Date(now - 25 * DAY_MS).toISOString()), // 6位
  ];
  const result = calculateNewSlugs(tools, now);
  expect(result.has("tool-newest")).toBe(true);
  expect(result.has("tool-fifth")).toBe(true);
  expect(result.has("tool-sixth")).toBe(false);
  expect(result.size).toBe(5);
});
