import { expect, test, describe } from "vitest";
import {
  generateGameJsonLd,
  generateBreadcrumbJsonLd,
  generateWebSiteJsonLd,
  generateBlogPostJsonLd,
  generateColorPageMetadata,
  generateColorJsonLd,
  generateToolMetadata,
  generateToolJsonLd,
  generateBlogPostMetadata,
  generateKanjiPageMetadata,
  generateYojiPageMetadata,
  generateColorCategoryMetadata,
  generateCheatsheetMetadata,
  generateQuizMetadata,
  generateQuizJsonLd,
  safeJsonLdStringify,
} from "../seo";

describe("generateGameJsonLd", () => {
  test("returns VideoGame JSON-LD with correct properties", () => {
    const result = generateGameJsonLd({
      name: "漢字カナール",
      description: "毎日の漢字パズル",
      url: "/play/kanji-kanaru",
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
        name: "yolos.net (AI Experiment)",
      },
    });
  });

  test("includes full URL with BASE_URL", () => {
    const result = generateGameJsonLd({
      name: "Test Game",
      description: "A test game",
      url: "/play/test",
    }) as Record<string, unknown>;

    expect(result.url).toContain("/play/test");
  });

  test("includes genre, inLanguage, numberOfPlayers when provided", () => {
    const result = generateGameJsonLd({
      name: "テストゲーム",
      description: "テスト",
      url: "/play/test",
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
      url: "/play/test",
    }) as Record<string, unknown>;

    expect(result.genre).toBeUndefined();
    expect(result.inLanguage).toBeUndefined();
    expect(result.numberOfPlayers).toBeUndefined();
  });

  test("includes datePublished and dateModified when publishedAt is provided", () => {
    const result = generateGameJsonLd({
      name: "テストゲーム",
      description: "テスト",
      url: "/play/test",
      publishedAt: "2026-02-13T19:11:53+09:00",
    }) as Record<string, unknown>;

    expect(result.datePublished).toBe("2026-02-13T19:11:53+09:00");
    expect(result.dateModified).toBe("2026-02-13T19:11:53+09:00");
  });

  test("dateModified uses updatedAt when provided", () => {
    const result = generateGameJsonLd({
      name: "テストゲーム",
      description: "テスト",
      url: "/play/test",
      publishedAt: "2026-02-13T19:11:53+09:00",
      updatedAt: "2026-03-01T23:14:37+09:00",
    }) as Record<string, unknown>;

    expect(result.datePublished).toBe("2026-02-13T19:11:53+09:00");
    expect(result.dateModified).toBe("2026-03-01T23:14:37+09:00");
  });

  test("omits datePublished and dateModified when publishedAt is not provided", () => {
    const result = generateGameJsonLd({
      name: "テストゲーム",
      description: "テスト",
      url: "/play/test",
    }) as Record<string, unknown>;

    expect(result.datePublished).toBeUndefined();
    expect(result.dateModified).toBeUndefined();
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
      name: "yolos.net (AI Experiment)",
    });
  });
});

describe("generateBlogPostJsonLd", () => {
  const baseBlogPost = {
    title: "テスト記事",
    slug: "test-article",
    description: "テスト記事の説明",
    published_at: "2026-02-15T10:00:00+09:00",
    updated_at: "2026-02-15T10:00:00+09:00",
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
      name: "yolos.net AI Agents",
    });
    expect(result.publisher).toMatchObject({
      "@type": "Organization",
      name: "yolos.net (AI Experiment)",
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

describe("generateColorPageMetadata", () => {
  test("includes canonical URL and expected title", () => {
    const result = generateColorPageMetadata({
      slug: "nadeshiko",
      name: "撫子",
      romaji: "nadeshiko",
      hex: "#dc9fb4",
      category: "red",
    });

    expect(result.title).toContain("撫子");
    expect(result.alternates?.canonical).toContain(
      "/dictionary/colors/nadeshiko",
    );
  });

  test("includes twitter metadata", () => {
    const result = generateColorPageMetadata({
      slug: "nadeshiko",
      name: "撫子",
      romaji: "nadeshiko",
      hex: "#dc9fb4",
      category: "red",
    });

    expect(result.twitter).toBeDefined();
    expect(result.twitter).toMatchObject({
      card: "summary_large_image",
      title: expect.stringContaining("撫子"),
      description: expect.stringContaining("撫子"),
    });
  });

  test("og:urlが存在しcanonicalと一致する", () => {
    const result = generateColorPageMetadata({
      slug: "nadeshiko",
      name: "撫子",
      romaji: "nadeshiko",
      hex: "#dc9fb4",
      category: "red",
    });

    const og = result.openGraph as Record<string, unknown> | undefined;
    expect(og?.url).toBeDefined();
    expect(og?.url).toBe(result.alternates?.canonical);
  });

  test("og:siteNameがyolos.netである", () => {
    const result = generateColorPageMetadata({
      slug: "nadeshiko",
      name: "撫子",
      romaji: "nadeshiko",
      hex: "#dc9fb4",
      category: "red",
    });

    const og = result.openGraph as Record<string, unknown> | undefined;
    expect(og?.siteName).toBe("yolos.net");
  });
});

describe("generateColorJsonLd", () => {
  test("returns DefinedTerm JSON-LD for color", () => {
    const result = generateColorJsonLd({
      slug: "nadeshiko",
      name: "撫子",
      romaji: "nadeshiko",
      hex: "#dc9fb4",
      category: "red",
    }) as Record<string, unknown>;

    expect(result["@type"]).toBe("DefinedTerm");
    expect(result.url).toContain("/dictionary/colors/nadeshiko");
    expect(result.inDefinedTermSet).toMatchObject({
      "@type": "DefinedTermSet",
      name: "日本の伝統色辞典",
    });
  });
});

describe("generateToolMetadata", () => {
  const toolData = {
    slug: "json-formatter",
    name: "JSON整形",
    nameEn: "JSON Formatter",
    description: "JSONを整形・検証するツールです。",
    shortDescription: "JSON整形",
    keywords: ["JSON"],
    category: "developer" as const,
    relatedSlugs: [],
    publishedAt: "2026-01-01T00:00:00+09:00",
    trustLevel: "verified" as const,
  };

  test("titleにツール名とサイト名を含む", () => {
    const result = generateToolMetadata(toolData);
    expect(result.title).toBe("JSON整形 - tools | yolos.net");
  });

  test("canonical URLが絶対URLで正しいパスを含む", () => {
    const result = generateToolMetadata(toolData);
    const canonical = result.alternates?.canonical as string;
    expect(canonical).toContain("/tools/json-formatter");
    expect(canonical).toMatch(/^https:\/\//);
  });

  test("og:urlが存在しcanonicalと一致する", () => {
    const result = generateToolMetadata(toolData);
    const og = result.openGraph as Record<string, unknown> | undefined;
    expect(og?.url).toBeDefined();
    expect(og?.url).toBe(result.alternates?.canonical);
  });

  test("og:titleが存在する", () => {
    const result = generateToolMetadata(toolData);
    const og = result.openGraph as Record<string, unknown> | undefined;
    expect(og?.title).toBeDefined();
  });

  test("og:descriptionが存在する", () => {
    const result = generateToolMetadata(toolData);
    const og = result.openGraph as Record<string, unknown> | undefined;
    expect(og?.description).toBeDefined();
  });

  test("og:siteNameがyolos.netである", () => {
    const result = generateToolMetadata(toolData);
    const og = result.openGraph as Record<string, unknown> | undefined;
    expect(og?.siteName).toBe("yolos.net");
  });
});

describe("generateToolJsonLd", () => {
  const toolData = {
    slug: "json-formatter",
    name: "JSON整形",
    nameEn: "JSON Formatter",
    description: "JSONを整形・検証するツールです。",
    shortDescription: "JSON整形",
    keywords: ["JSON"],
    category: "developer" as const,
    relatedSlugs: [],
    publishedAt: "2026-01-01T00:00:00+09:00",
    trustLevel: "verified" as const,
  };

  test("datePublishedがpublishedAtと一致する", () => {
    const result = generateToolJsonLd(toolData) as Record<string, unknown>;
    expect(result.datePublished).toBe("2026-01-01T00:00:00+09:00");
  });

  test("dateModifiedがpublishedAtにフォールバックする（updatedAtなし）", () => {
    const result = generateToolJsonLd(toolData) as Record<string, unknown>;
    expect(result.dateModified).toBe("2026-01-01T00:00:00+09:00");
  });

  test("dateModifiedがupdatedAtを使用する（updatedAtあり）", () => {
    const toolWithUpdate = {
      ...toolData,
      updatedAt: "2026-02-15T12:00:00+09:00",
    };
    const result = generateToolJsonLd(toolWithUpdate) as Record<
      string,
      unknown
    >;
    expect(result.datePublished).toBe("2026-01-01T00:00:00+09:00");
    expect(result.dateModified).toBe("2026-02-15T12:00:00+09:00");
  });
});

describe("generateBlogPostMetadata", () => {
  const blogData = {
    title: "テスト記事",
    slug: "test-article",
    description: "テスト記事の説明です。",
    published_at: "2026-02-15T10:00:00+09:00",
    updated_at: "2026-02-16T10:00:00+09:00",
    tags: ["テスト"],
  };

  test("titleに記事タイトルとサイト名を含む", () => {
    const result = generateBlogPostMetadata(blogData);
    expect(result.title).toContain("テスト記事");
    expect(result.title).toContain("yolos.net");
  });

  test("canonical URLが絶対URLで正しいパスを含む", () => {
    const result = generateBlogPostMetadata(blogData);
    const canonical = result.alternates?.canonical as string;
    expect(canonical).toContain("/blog/test-article");
    expect(canonical).toMatch(/^https:\/\//);
  });

  test("og:urlが存在しcanonicalと一致する", () => {
    const result = generateBlogPostMetadata(blogData);
    const og = result.openGraph as Record<string, unknown> | undefined;
    expect(og?.url).toBeDefined();
    expect(og?.url).toBe(result.alternates?.canonical);
  });

  test("og:titleが存在する", () => {
    const result = generateBlogPostMetadata(blogData);
    const og = result.openGraph as Record<string, unknown> | undefined;
    expect(og?.title).toBeDefined();
  });

  test("og:descriptionが存在する", () => {
    const result = generateBlogPostMetadata(blogData);
    const og = result.openGraph as Record<string, unknown> | undefined;
    expect(og?.description).toBeDefined();
  });

  test("og:siteNameがyolos.netである", () => {
    const result = generateBlogPostMetadata(blogData);
    const og = result.openGraph as Record<string, unknown> | undefined;
    expect(og?.siteName).toBe("yolos.net");
  });

  test("openGraph.typeがarticleである", () => {
    const result = generateBlogPostMetadata(blogData);
    const og = result.openGraph as Record<string, unknown> | undefined;
    expect(og?.type).toBe("article");
  });

  test("OGP publishedTimeが含まれる", () => {
    const result = generateBlogPostMetadata(blogData);
    const og = result.openGraph as Record<string, unknown> | undefined;
    expect(og?.publishedTime).toBe("2026-02-15T10:00:00+09:00");
  });

  test("OGP modifiedTimeが含まれる", () => {
    const result = generateBlogPostMetadata(blogData);
    const og = result.openGraph as Record<string, unknown> | undefined;
    expect(og?.modifiedTime).toBe("2026-02-16T10:00:00+09:00");
  });
});

describe("generateKanjiPageMetadata", () => {
  const kanjiData = {
    character: "山",
    meanings: ["やま", "mountain"],
    onYomi: ["サン"],
    kunYomi: ["やま"],
  };

  test("titleに漢字とサイト名を含む", () => {
    const result = generateKanjiPageMetadata(kanjiData);
    expect(result.title).toContain("山");
    expect(result.title).toContain("yolos.net");
  });

  test("canonical URLが絶対URLでエンコード済みパスを含む", () => {
    const result = generateKanjiPageMetadata(kanjiData);
    const canonical = result.alternates?.canonical as string;
    expect(canonical).toContain("/dictionary/kanji/");
    expect(canonical).toMatch(/^https:\/\//);
  });

  test("og:urlが存在しcanonicalと一致する", () => {
    const result = generateKanjiPageMetadata(kanjiData);
    const og = result.openGraph as Record<string, unknown> | undefined;
    expect(og?.url).toBeDefined();
    expect(og?.url).toBe(result.alternates?.canonical);
  });

  test("og:titleが存在する", () => {
    const result = generateKanjiPageMetadata(kanjiData);
    const og = result.openGraph as Record<string, unknown> | undefined;
    expect(og?.title).toBeDefined();
  });

  test("og:descriptionが存在する", () => {
    const result = generateKanjiPageMetadata(kanjiData);
    const og = result.openGraph as Record<string, unknown> | undefined;
    expect(og?.description).toBeDefined();
  });

  test("og:siteNameがyolos.netである", () => {
    const result = generateKanjiPageMetadata(kanjiData);
    const og = result.openGraph as Record<string, unknown> | undefined;
    expect(og?.siteName).toBe("yolos.net");
  });
});

describe("generateYojiPageMetadata", () => {
  const yojiData = {
    yoji: "一期一会",
    reading: "いちごいちえ",
    meaning: "一生に一度の出会い",
    category: "life",
  };

  test("titleに四字熟語とサイト名を含む", () => {
    const result = generateYojiPageMetadata(yojiData);
    expect(result.title).toContain("一期一会");
    expect(result.title).toContain("yolos.net");
  });

  test("canonical URLが絶対URLでエンコード済みパスを含む", () => {
    const result = generateYojiPageMetadata(yojiData);
    const canonical = result.alternates?.canonical as string;
    expect(canonical).toContain("/dictionary/yoji/");
    expect(canonical).toMatch(/^https:\/\//);
  });

  test("og:urlが存在しcanonicalと一致する", () => {
    const result = generateYojiPageMetadata(yojiData);
    const og = result.openGraph as Record<string, unknown> | undefined;
    expect(og?.url).toBeDefined();
    expect(og?.url).toBe(result.alternates?.canonical);
  });

  test("og:titleが存在する", () => {
    const result = generateYojiPageMetadata(yojiData);
    const og = result.openGraph as Record<string, unknown> | undefined;
    expect(og?.title).toBeDefined();
  });

  test("og:descriptionが存在する", () => {
    const result = generateYojiPageMetadata(yojiData);
    const og = result.openGraph as Record<string, unknown> | undefined;
    expect(og?.description).toBeDefined();
  });

  test("og:siteNameがyolos.netである", () => {
    const result = generateYojiPageMetadata(yojiData);
    const og = result.openGraph as Record<string, unknown> | undefined;
    expect(og?.siteName).toBe("yolos.net");
  });
});

describe("generateColorCategoryMetadata", () => {
  test("titleにカテゴリ名とサイト名を含む", () => {
    const result = generateColorCategoryMetadata("red", "赤系");
    expect(result.title).toContain("赤系");
    expect(result.title).toContain("yolos.net");
  });

  test("canonical URLが絶対URLで正しいパスを含む", () => {
    const result = generateColorCategoryMetadata("red", "赤系");
    const canonical = result.alternates?.canonical as string;
    expect(canonical).toContain("/dictionary/colors/category/red");
    expect(canonical).toMatch(/^https:\/\//);
  });

  test("og:urlが存在しcanonicalと一致する", () => {
    const result = generateColorCategoryMetadata("red", "赤系");
    const og = result.openGraph as Record<string, unknown> | undefined;
    expect(og?.url).toBeDefined();
    expect(og?.url).toBe(result.alternates?.canonical);
  });

  test("og:titleが存在する", () => {
    const result = generateColorCategoryMetadata("red", "赤系");
    const og = result.openGraph as Record<string, unknown> | undefined;
    expect(og?.title).toBeDefined();
  });

  test("og:descriptionが存在する", () => {
    const result = generateColorCategoryMetadata("red", "赤系");
    const og = result.openGraph as Record<string, unknown> | undefined;
    expect(og?.description).toBeDefined();
  });

  test("og:siteNameがyolos.netである", () => {
    const result = generateColorCategoryMetadata("red", "赤系");
    const og = result.openGraph as Record<string, unknown> | undefined;
    expect(og?.siteName).toBe("yolos.net");
  });
});

describe("generateQuizMetadata", () => {
  const quizData = {
    slug: "kanji-quiz",
    title: "漢字力診断",
    description: "漢字力を診断します。",
    shortDescription: "漢字力テスト",
    type: "knowledge" as const,
    questionCount: 10,
    icon: "漢",
    accentColor: "#ff0000",
    keywords: ["漢字", "クイズ"],
    publishedAt: "2026-02-01T00:00:00+09:00",
    trustLevel: "curated" as const,
  };

  test("titleにクイズタイトルとサイト名を含む", () => {
    const result = generateQuizMetadata(quizData);
    expect(result.title).toContain("漢字力診断");
    expect(result.title).toContain("yolos.net");
  });

  test("canonical URLが絶対URLで正しいパスを含む", () => {
    const result = generateQuizMetadata(quizData);
    const canonical = result.alternates?.canonical as string;
    expect(canonical).toContain("/quiz/kanji-quiz");
    expect(canonical).toMatch(/^https:\/\//);
  });

  test("og:urlが存在しcanonicalと一致する", () => {
    const result = generateQuizMetadata(quizData);
    const og = result.openGraph as Record<string, unknown> | undefined;
    expect(og?.url).toBeDefined();
    expect(og?.url).toBe(result.alternates?.canonical);
  });

  test("og:titleが存在する", () => {
    const result = generateQuizMetadata(quizData);
    const og = result.openGraph as Record<string, unknown> | undefined;
    expect(og?.title).toBeDefined();
  });

  test("og:descriptionが存在する", () => {
    const result = generateQuizMetadata(quizData);
    const og = result.openGraph as Record<string, unknown> | undefined;
    expect(og?.description).toBeDefined();
  });

  test("og:siteNameがyolos.netである", () => {
    const result = generateQuizMetadata(quizData);
    const og = result.openGraph as Record<string, unknown> | undefined;
    expect(og?.siteName).toBe("yolos.net");
  });
});

describe("generateQuizJsonLd", () => {
  const quizData = {
    slug: "kanji-quiz",
    title: "漢字力診断",
    description: "漢字力を診断します。",
    shortDescription: "漢字力テスト",
    type: "knowledge" as const,
    questionCount: 10,
    icon: "漢",
    accentColor: "#ff0000",
    keywords: ["漢字", "クイズ"],
    publishedAt: "2026-02-01T00:00:00+09:00",
    trustLevel: "curated" as const,
  };

  test("datePublishedがpublishedAtと一致する", () => {
    const result = generateQuizJsonLd(quizData) as Record<string, unknown>;
    expect(result.datePublished).toBe("2026-02-01T00:00:00+09:00");
  });

  test("dateModifiedがpublishedAtにフォールバックする（updatedAtなし）", () => {
    const result = generateQuizJsonLd(quizData) as Record<string, unknown>;
    expect(result.dateModified).toBe("2026-02-01T00:00:00+09:00");
  });

  test("dateModifiedがupdatedAtを使用する（updatedAtあり）", () => {
    const quizWithUpdate = {
      ...quizData,
      updatedAt: "2026-02-20T15:00:00+09:00",
    };
    const result = generateQuizJsonLd(quizWithUpdate) as Record<
      string,
      unknown
    >;
    expect(result.datePublished).toBe("2026-02-01T00:00:00+09:00");
    expect(result.dateModified).toBe("2026-02-20T15:00:00+09:00");
  });
});

describe("factory functions include twitter metadata", () => {
  test("generateToolMetadata includes twitter", () => {
    const result = generateToolMetadata({
      slug: "test-tool",
      name: "テストツール",
      nameEn: "Test Tool",
      description: "テストの説明",
      shortDescription: "短い説明",
      keywords: ["テスト"],
      category: "text",
      relatedSlugs: [],
      publishedAt: "2026-02-15T10:00:00+09:00",
      trustLevel: "generated",
    });

    expect(result.twitter).toMatchObject({
      card: "summary_large_image",
      title: "テストツール - tools",
      description: "テストの説明",
    });
  });

  test("generateBlogPostMetadata includes twitter", () => {
    const result = generateBlogPostMetadata({
      title: "テスト記事",
      slug: "test-article",
      description: "テスト記事の説明",
      published_at: "2026-02-15T10:00:00+09:00",
      updated_at: "2026-02-15T10:00:00+09:00",
      tags: ["テスト"],
    });

    expect(result.twitter).toMatchObject({
      card: "summary_large_image",
      title: "テスト記事",
      description: "テスト記事の説明",
    });
  });

  test("generateKanjiPageMetadata includes twitter", () => {
    const result = generateKanjiPageMetadata({
      character: "山",
      meanings: ["山"],
      onYomi: ["サン"],
      kunYomi: ["やま"],
    });

    expect(result.twitter).toMatchObject({
      card: "summary_large_image",
      title: expect.stringContaining("山"),
      description: expect.stringContaining("山"),
    });
  });

  test("generateYojiPageMetadata includes twitter", () => {
    const result = generateYojiPageMetadata({
      yoji: "一期一会",
      reading: "いちごいちえ",
      meaning: "一生に一度の出会い",
      category: "life",
    });

    expect(result.twitter).toMatchObject({
      card: "summary_large_image",
      title: expect.stringContaining("一期一会"),
      description: expect.stringContaining("一期一会"),
    });
  });

  test("generateColorCategoryMetadata includes twitter", () => {
    const result = generateColorCategoryMetadata("red", "赤系");

    expect(result.twitter).toMatchObject({
      card: "summary_large_image",
      title: expect.stringContaining("赤系"),
      description: expect.stringContaining("赤系"),
    });
  });

  test("generateCheatsheetMetadata includes twitter", () => {
    const result = generateCheatsheetMetadata({
      slug: "test-cheatsheet",
      name: "テストチートシート",
      nameEn: "Test Cheatsheet",
      description: "テストの説明",
      shortDescription: "テスト用チートシート",
      keywords: ["テスト"],
      category: "developer",
      relatedToolSlugs: [],
      relatedCheatsheetSlugs: [],
      sections: [],
      publishedAt: "2026-02-15T10:00:00+09:00",
      trustLevel: "generated",
    });

    expect(result.twitter).toMatchObject({
      card: "summary_large_image",
      title: "テストチートシート - チートシート",
      description: "テストの説明",
    });
  });

  test("generateQuizMetadata includes twitter", () => {
    const result = generateQuizMetadata({
      slug: "test-quiz",
      title: "テストクイズ",
      description: "テストの説明",
      shortDescription: "短い説明",
      keywords: ["テスト"],
      questionCount: 10,
      type: "knowledge",
      publishedAt: "2026-02-15T10:00:00+09:00",
      icon: "Q",
      accentColor: "#000",
      trustLevel: "generated",
    });

    expect(result.twitter).toMatchObject({
      card: "summary_large_image",
      title: "テストクイズ - クイズ",
      description: "テストの説明",
    });
  });
});

describe("safeJsonLdStringify", () => {
  test("通常のオブジェクトを正しくJSON文字列に変換する", () => {
    const data = { name: "テスト", value: 42 };
    expect(safeJsonLdStringify(data)).toBe('{"name":"テスト","value":42}');
  });

  test("</script>を含む文字列をエスケープする", () => {
    const data = { content: "</script><script>alert('xss')</script>" };
    const result = safeJsonLdStringify(data);
    expect(result).not.toContain("</script>");
    expect(result).toContain("\\u003c/script>");
  });

  test("ネストされたオブジェクトでも<をエスケープする", () => {
    const data = { outer: { inner: "<b>bold</b>" } };
    const result = safeJsonLdStringify(data);
    expect(result).not.toContain("<b>");
    expect(result).toContain("\\u003cb>");
  });

  test("<を含まないオブジェクトはそのままJSON文字列に変換する", () => {
    const data = { name: "hello", count: 5 };
    expect(safeJsonLdStringify(data)).toBe(JSON.stringify(data));
  });

  test("空オブジェクトを正しく処理する", () => {
    expect(safeJsonLdStringify({})).toBe("{}");
  });
});
