import { expect, test, describe, vi, beforeEach } from "vitest";

// Track calls to ImageResponse for assertions
let imageResponseCalls: Array<{ element: unknown; options: unknown }> = [];

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

// Mock ogp-image library to control font data behavior
const mockFontData = new ArrayBuffer(8);
vi.mock("@/lib/ogp-image", () => ({
  getFontData: vi.fn().mockResolvedValue(mockFontData),
}));

describe("HumorDictOpenGraphImage", () => {
  beforeEach(() => {
    imageResponseCalls = [];
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

  test("renders ImageResponse for a valid slug", async () => {
    const mod = await getModule();
    await mod.default({ params: Promise.resolve({ slug: "morning" }) });
    expect(imageResponseCalls).toHaveLength(1);
  });

  test("passes correct size to ImageResponse", async () => {
    const mod = await getModule();
    await mod.default({ params: Promise.resolve({ slug: "morning" }) });
    const { options } = imageResponseCalls[0];
    expect(options).toMatchObject({ width: 1200, height: 630 });
  });

  test("includes word text in rendered output", async () => {
    const mod = await getModule();
    await mod.default({ params: Promise.resolve({ slug: "morning" }) });
    const { element } = imageResponseCalls[0];
    const html = JSON.stringify(element);
    expect(html).toContain("朝");
  });

  test("includes definition text in rendered output", async () => {
    const mod = await getModule();
    await mod.default({ params: Promise.resolve({ slug: "morning" }) });
    const { element } = imageResponseCalls[0];
    const html = JSON.stringify(element);
    expect(html).toContain("根拠のない清々しさ");
  });

  test("includes site name yolos.net in rendered output", async () => {
    const mod = await getModule();
    await mod.default({ params: Promise.resolve({ slug: "morning" }) });
    const { element } = imageResponseCalls[0];
    const html = JSON.stringify(element);
    expect(html).toContain("yolos.net");
  });

  test("renders fallback for unknown slug", async () => {
    const mod = await getModule();
    // Should not throw; renders a fallback image
    await expect(
      mod.default({ params: Promise.resolve({ slug: "unknown-slug" }) }),
    ).resolves.toBeDefined();
  });

  test("passes fonts option to ImageResponse when font data is available", async () => {
    const mod = await getModule();
    await mod.default({ params: Promise.resolve({ slug: "morning" }) });
    const { options } = imageResponseCalls[0];
    const opts = options as { fonts?: unknown[] };
    expect(opts.fonts).toBeDefined();
    expect(Array.isArray(opts.fonts)).toBe(true);
    expect((opts.fonts as unknown[]).length).toBeGreaterThan(0);
  });

  test("fonts option contains NotoSansJP font entry", async () => {
    const mod = await getModule();
    await mod.default({ params: Promise.resolve({ slug: "morning" }) });
    const { options } = imageResponseCalls[0];
    const opts = options as {
      fonts?: Array<{ name: string; style: string; weight: number }>;
    };
    expect(opts.fonts).toBeDefined();
    const fontEntry = opts.fonts![0];
    expect(fontEntry.name).toBe("NotoSansJP");
    expect(fontEntry.style).toBe("normal");
    expect(fontEntry.weight).toBe(400);
  });

  test("root div includes fontFamily style for Japanese text rendering", async () => {
    const mod = await getModule();
    await mod.default({ params: Promise.resolve({ slug: "morning" }) });
    const { element } = imageResponseCalls[0];
    const html = JSON.stringify(element);
    expect(html).toContain("NotoSansJP");
  });
});
