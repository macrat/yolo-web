import { expect, test, describe } from "vitest";
import { generateGameJsonLd, generateBreadcrumbJsonLd } from "../seo";

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
