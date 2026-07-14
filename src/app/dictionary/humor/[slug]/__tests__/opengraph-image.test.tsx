import { expect, test, describe, vi, beforeEach } from "vitest";

// createOgpImageResponse の呼び出しを捕捉して「共通レンダラへの委譲」を検証する。
let createOgpImageResponseCalls: Array<{ title: string; subtitle?: string }> =
  [];

// 共通の店構えレンダラ @/lib/ogp-image をモックする。cycle-282 でユーモア辞典 OGP は
// 独自 ImageResponse（旧デザイン）を廃し createOgpImageResponse へ統一したため、
// この call-site は「正しい title/subtitle を共通レンダラへ渡すか」で検証する。
vi.mock("@/lib/ogp-image", () => ({
  ogpSize: { width: 1200, height: 630 },
  ogpContentType: "image/png",
  createOgpImageResponse: vi.fn(
    (config: { title: string; subtitle?: string }) => {
      createOgpImageResponseCalls.push(config);
      return Promise.resolve({ mock: true });
    },
  ),
}));

// Mock humor-dict data
vi.mock("@/humor-dict/data", () => ({
  getAllSlugs: () => ["morning", "monday", "motivation"],
  getEntryBySlug: (slug: string) => {
    const entries: Record<
      string,
      {
        slug: string;
        word: string;
        reading: string;
        definition: string;
        explanation: string;
        example: string;
        relatedSlugs: string[];
      }
    > = {
      morning: {
        slug: "morning",
        word: "朝",
        reading: "あさ",
        definition:
          "1日の中で唯一、根拠のない清々しさと根拠のある眠気が同時に存在する時間帯。",
        explanation: "テスト解説",
        example: "テスト用例",
        relatedSlugs: [],
      },
      monday: {
        slug: "monday",
        word: "月曜日",
        reading: "げつようび",
        definition:
          "週7日の中で、存在するだけで周囲の気温を2度下げると言われている唯一の曜日。",
        explanation: "テスト解説",
        example: "テスト用例",
        relatedSlugs: [],
      },
    };
    return entries[slug];
  },
}));

describe("HumorDictOpenGraphImage", () => {
  beforeEach(() => {
    createOgpImageResponseCalls = [];
  });

  async function getModule() {
    vi.resetModules();
    return await import("../opengraph-image");
  }

  test("exports correct size (1200x630)", async () => {
    const mod = await getModule();
    expect(mod.size).toEqual({ width: 1200, height: 630 });
  });

  test("exports correct contentType as image/png", async () => {
    const mod = await getModule();
    expect(mod.contentType).toBe("image/png");
  });

  test("exports alt text", async () => {
    const mod = await getModule();
    expect(typeof mod.alt).toBe("string");
    expect(mod.alt.length).toBeGreaterThan(0);
  });

  test("generateStaticParams returns all slugs", async () => {
    const mod = await getModule();
    const params = mod.generateStaticParams();
    expect(params).toEqual([
      { slug: "morning" },
      { slug: "monday" },
      { slug: "motivation" },
    ]);
  });

  test("default export is a function (the image component)", async () => {
    const mod = await getModule();
    expect(typeof mod.default).toBe("function");
  });

  test("uses createOgpImageResponse (not raw ImageResponse)", async () => {
    const { createOgpImageResponse } = await import("@/lib/ogp-image");
    const mod = await getModule();
    await mod.default({ params: Promise.resolve({ slug: "morning" }) });
    expect(createOgpImageResponse).toHaveBeenCalled();
  });

  test("passes word with reading as title to createOgpImageResponse", async () => {
    const mod = await getModule();
    await mod.default({ params: Promise.resolve({ slug: "morning" }) });
    expect(createOgpImageResponseCalls[0].title).toBe("朝（あさ）");
  });

  test("passes definition as subtitle to createOgpImageResponse", async () => {
    const mod = await getModule();
    await mod.default({ params: Promise.resolve({ slug: "morning" }) });
    expect(createOgpImageResponseCalls[0].subtitle).toContain(
      "根拠のない清々しさ",
    );
  });

  test("renders fallback for unknown slug", async () => {
    const mod = await getModule();
    // Should not throw; renders a fallback image
    await expect(
      mod.default({ params: Promise.resolve({ slug: "unknown-slug" }) }),
    ).resolves.toBeDefined();
    // フォールバックでも共通レンダラに既定の title/subtitle を渡す。
    expect(createOgpImageResponseCalls[0].title).toBe("ユーモア辞典");
    expect(createOgpImageResponseCalls[0].subtitle).toBeTruthy();
  });
});
