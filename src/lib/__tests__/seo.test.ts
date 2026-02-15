import { expect, test, describe } from "vitest";
import {
  generateGameJsonLd,
  generateBreadcrumbJsonLd,
  generateWebSiteJsonLd,
  generateBlogPostJsonLd,
} from "../seo";

describe("generateGameJsonLd", () => {
  test("returns VideoGame JSON-LD with correct properties", () => {
    const result = generateGameJsonLd({
      name: "漢字カナール",
      description: "毎日の漢字パズル",
      url: "/games/kanji-kanaru",
    });

    expect(result).toMatchObject({
      "@context": "https://schema.org",
      "@type": "VideoGame",
      name: "漢字カナール",
      description: "毎日の漢字パズル",
      gamePlatform: "Web Browser",
      applicationCategory: "Game",
      operatingSystem: "All",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "JPY",
      },
      creator: {
        "@type": "Organization",
        name: "Yolo-Web (AI Experiment)",
      },
    });
  });

  test("includes full URL with BASE_URL", () => {
    const result = generateGameJsonLd({
      name: "Test Game",
      description: "A test game",
      url: "/games/test",
    }) as Record<string, unknown>;

    expect(result.url).toContain("/games/test");
  });

  test("includes genre, inLanguage, numberOfPlayers when provided", () => {
    const result = generateGameJsonLd({
      name: "テストゲーム",
      description: "テスト",
      url: "/games/test",
      genre: "Puzzle",
      inLanguage: "ja",
      numberOfPlayers: "1",
    }) as Record<string, unknown>;

    expect(result.genre).toBe("Puzzle");
    expect(result.inLanguage).toBe("ja");
    expect(result.numberOfPlayers).toEqual({
      "@type": "QuantitativeValue",
      value: "1",
    });
  });

  test("omits genre, inLanguage, numberOfPlayers when not provided", () => {
    const result = generateGameJsonLd({
      name: "テストゲーム",
      description: "テスト",
      url: "/games/test",
    }) as Record<string, unknown>;

    expect(result.genre).toBeUndefined();
    expect(result.inLanguage).toBeUndefined();
    expect(result.numberOfPlayers).toBeUndefined();
  });
});

describe("generateWebSiteJsonLd", () => {
  test("returns WebSite JSON-LD with correct properties", () => {
    const result = generateWebSiteJsonLd() as Record<string, unknown>;

    expect(result).toMatchObject({
      "@context": "https://schema.org",
      "@type": "WebSite",
      inLanguage: "ja",
    });
    expect(result.name).toBeDefined();
    expect(result.url).toBeDefined();
    expect(result.description).toBeDefined();
    expect(result.creator).toMatchObject({
      "@type": "Organization",
      name: "Yolo-Web (AI Experiment)",
    });
  });
});

describe("generateBlogPostJsonLd", () => {
  const baseBlogPost = {
    title: "テスト記事",
    slug: "test-article",
    description: "テスト記事の説明",
    published_at: "2026-02-15",
    updated_at: "2026-02-15",
    tags: ["テスト"],
  };

  test("returns BlogPosting type instead of Article", () => {
    const result = generateBlogPostJsonLd(baseBlogPost) as Record<
      string,
      unknown
    >;

    expect(result["@type"]).toBe("BlogPosting");
    expect(result.inLanguage).toBe("ja");
  });

  test("includes image when provided", () => {
    const result = generateBlogPostJsonLd({
      ...baseBlogPost,
      image: "https://example.com/image.png",
    }) as Record<string, unknown>;

    expect(result.image).toBe("https://example.com/image.png");
  });

  test("omits image when not provided", () => {
    const result = generateBlogPostJsonLd(baseBlogPost) as Record<
      string,
      unknown
    >;

    expect(result.image).toBeUndefined();
  });

  test("includes correct author and publisher", () => {
    const result = generateBlogPostJsonLd(baseBlogPost) as Record<
      string,
      unknown
    >;

    expect(result.author).toMatchObject({
      "@type": "Organization",
      name: "Yolo-Web AI Agents",
    });
    expect(result.publisher).toMatchObject({
      "@type": "Organization",
      name: "Yolo-Web (AI Experiment)",
    });
  });
});

describe("generateBreadcrumbJsonLd", () => {
  test("returns BreadcrumbList with correct structure", () => {
    const result = generateBreadcrumbJsonLd([
      { label: "ホーム", href: "/" },
      { label: "ツール", href: "/tools" },
      { label: "テスト" },
    ]);

    expect(result).toMatchObject({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
    });

    const items = (result as Record<string, unknown>).itemListElement as Array<
      Record<string, unknown>
    >;
    expect(items).toHaveLength(3);
    expect(items[0].position).toBe(1);
    expect(items[0].name).toBe("ホーム");
    expect(items[2].position).toBe(3);
    expect(items[2].name).toBe("テスト");
    // Last item has no href, so no "item" property
    expect(items[2].item).toBeUndefined();
  });
});
