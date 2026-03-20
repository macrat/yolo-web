import { expect, test, describe, vi, beforeEach } from "vitest";

// Track calls to ImageResponse for assertions
let imageResponseCalls: Array<{ element: unknown; options: unknown }> = [];

// Track calls to createOgpImageResponse
let createOgpImageResponseCalls: Array<{
  title: string;
  subtitle?: string;
  icon?: string;
  accentColor?: string;
}> = [];

// Mock next/og ImageResponse as a class since it's invoked with `new`
vi.mock("next/og", () => ({
  ImageResponse: class MockImageResponse {
    _element: unknown;
    _options: unknown;
    constructor(element: unknown, options: unknown) {
      this._element = element;
      this._options = options;
      imageResponseCalls.push({ element, options });
    }
  },
}));

// Mock @/lib/ogp-image to verify createOgpImageResponse is used
vi.mock("@/lib/ogp-image", () => ({
  ogpSize: { width: 1200, height: 630 },
  ogpContentType: "image/png",
  createOgpImageResponse: vi.fn(
    (config: {
      title: string;
      subtitle?: string;
      icon?: string;
      accentColor?: string;
    }) => {
      createOgpImageResponseCalls.push(config);
      imageResponseCalls.push({
        element: { props: config },
        options: { width: 1200, height: 630 },
      });
      return Promise.resolve({ mock: true });
    },
  ),
}));

// Mock quiz registry with minimal test data
vi.mock("@/play/quiz/registry", () => ({
  quizBySlug: new Map([
    [
      "test-quiz",
      {
        meta: {
          slug: "test-quiz",
          title: "テストクイズ",
          accentColor: "#e74c3c",
          icon: "🧪",
        },
        results: [
          { id: "result-a", title: "タイプA", icon: "🌟" },
          { id: "result-b", title: "タイプB", icon: "💫" },
        ],
      },
    ],
  ]),
  getAllQuizSlugs: () => ["test-quiz"],
  getResultIdsForQuiz: (slug: string) => {
    if (slug === "test-quiz") return ["result-a", "result-b"];
    return [];
  },
}));

describe("QuizResultOpenGraphImage", () => {
  beforeEach(() => {
    imageResponseCalls = [];
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

  test("generateStaticParams returns all slug+resultId combinations", async () => {
    const mod = await getModule();
    const params = mod.generateStaticParams();
    expect(params).toEqual([
      { slug: "test-quiz", resultId: "result-a" },
      { slug: "test-quiz", resultId: "result-b" },
    ]);
  });

  test("default export is a function (the image component)", async () => {
    const mod = await getModule();
    expect(typeof mod.default).toBe("function");
  });

  test("uses createOgpImageResponse (not raw ImageResponse)", async () => {
    const { createOgpImageResponse } = await import("@/lib/ogp-image");
    const mod = await getModule();
    await mod.default({
      params: Promise.resolve({ slug: "test-quiz", resultId: "result-a" }),
    });
    expect(createOgpImageResponse).toHaveBeenCalled();
  });

  test("passes result title as title to createOgpImageResponse", async () => {
    const mod = await getModule();
    await mod.default({
      params: Promise.resolve({ slug: "test-quiz", resultId: "result-a" }),
    });
    expect(createOgpImageResponseCalls[0].title).toBe("タイプA");
  });

  test("passes quiz title as subtitle to createOgpImageResponse", async () => {
    const mod = await getModule();
    await mod.default({
      params: Promise.resolve({ slug: "test-quiz", resultId: "result-a" }),
    });
    expect(createOgpImageResponseCalls[0].subtitle).toBe("テストクイズ");
  });

  test("passes result icon as icon to createOgpImageResponse", async () => {
    const mod = await getModule();
    await mod.default({
      params: Promise.resolve({ slug: "test-quiz", resultId: "result-a" }),
    });
    expect(createOgpImageResponseCalls[0].icon).toBe("🌟");
  });

  test("passes quiz accentColor to createOgpImageResponse", async () => {
    const mod = await getModule();
    await mod.default({
      params: Promise.resolve({ slug: "test-quiz", resultId: "result-a" }),
    });
    expect(createOgpImageResponseCalls[0].accentColor).toBe("#e74c3c");
  });

  test("renders fallback for unknown slug", async () => {
    const mod = await getModule();
    await expect(
      mod.default({
        params: Promise.resolve({ slug: "unknown-quiz", resultId: "result-a" }),
      }),
    ).resolves.toBeDefined();
  });

  test("renders fallback for unknown resultId", async () => {
    const mod = await getModule();
    await expect(
      mod.default({
        params: Promise.resolve({
          slug: "test-quiz",
          resultId: "unknown-result",
        }),
      }),
    ).resolves.toBeDefined();
  });
});
