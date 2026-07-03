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
  generateKanjiJsonLd,
  generateYojiPageMetadata,
  generateYojiJsonLd,
  generateColorCategoryMetadata,
  generateFaqPageJsonLd,
  generateHumorDictJsonLd,
  safeJsonLdStringify,
} from "../seo";
import { BASE_URL } from "@/lib/constants";
import yojiData from "@/data/yoji-data.json";
import type { YojiEntry } from "@/dictionary/_lib/types";

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

  test("description reflects 新コンセプト「日常の傍にある道具」(占い・診断パーク文言の根絶)", () => {
    // cycle-232 T-2 決定: WebSite JSON-LD は全ページに注入されるサイト自己定義
    // であり、トップの道具箱化（Phase 10.3）と同時に新コンセプトへ刷新した
    const result = generateWebSiteJsonLd() as Record<string, unknown>;
    const description = result.description as string;
    // 旧コンセプト（占い・診断パーク）の記述が含まれていないこと
    expect(description).not.toMatch(/占い|診断/);
    // 新コンセプト（道具・オンラインツール）の記述が含まれていること
    expect(description).toContain("オンラインツール");
    expect(description).toMatch(/道具/);
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
    howItWorks:
      "JSONテキストを入力すると、構文を検証し、インデント付きで整形します。",
  };

  test("titleにツール名とサイト名を含む", () => {
    const result = generateToolMetadata(toolData);
    expect(result.title).toBe("JSON整形 - 無料オンラインツール | yolos.net");
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
    howItWorks:
      "JSONテキストを入力すると、構文を検証し、インデント付きで整形します。",
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
    character: "袋",
    radical: "衣",
    strokeCount: 11,
    meanings: ["sack", "bag", "pouch"],
    onYomi: ["タイ", "ダイ"],
    kunYomi: ["ふくろ"],
    examples: ["胃袋", "紙袋", "手袋"],
  };

  test("titleに漢字とサイト名を含む", () => {
    const result = generateKanjiPageMetadata(kanjiData);
    expect(result.title).toContain("袋");
    expect(result.title).toContain("yolos.net");
  });

  // cycle-251: 「<漢字> 部首」検索のスニペット改善。title に「部首」、description が部首・画数で
  // 直接答えていることを保証する（検索意図への回答が回帰しないように固定する）。
  test("titleに部首・画数の検索意図キーワードを前置する", () => {
    const result = generateKanjiPageMetadata(kanjiData);
    expect(result.title).toContain("部首");
    expect(result.title).toContain("画数");
  });

  test("descriptionが部首と画数に冒頭で直接答える", () => {
    const result = generateKanjiPageMetadata(kanjiData);
    expect(result.description).toContain("部首は「衣」");
    expect(result.description).toContain("11画");
  });

  test("descriptionに読み方（音読み・訓読み）と使用例を含む", () => {
    const result = generateKanjiPageMetadata(kanjiData);
    expect(result.description).toContain("タイ");
    expect(result.description).toContain("ふくろ");
    expect(result.description).toContain("胃袋");
  });

  // meanings は全2136字が英語のみ（src/data/kanji-data.json 実測）。日本語の検索者に
  // 英語の意味を羅列しない方針（cycle-251）が回帰しないことを保証する。
  test("可視descriptionに英語meaningsを羅列しない", () => {
    const result = generateKanjiPageMetadata(kanjiData);
    expect(result.description).not.toContain("sack");
    expect(result.description).not.toContain("bag");
  });

  test("keywordsに部首・部首文字・画数を含む", () => {
    const result = generateKanjiPageMetadata(kanjiData);
    const keywords = result.keywords as string[];
    expect(keywords).toContain("部首");
    expect(keywords).toContain("衣");
    expect(keywords).toContain("画数");
  });

  // cycle-251: 元データの kunYomi には重複が混入する字がある（実測119字。例「生」）。
  // 表示層で重複を除去し、スニペット・keywords に同じ読みを繰り返さないことを保証する。
  test("重複した読みを description / keywords で除去する", () => {
    const withDupReadings = {
      character: "生",
      radical: "生",
      strokeCount: 5,
      meanings: ["life", "birth"],
      onYomi: ["セイ", "ショウ"],
      kunYomi: ["うまれる", "うまれる", "なま", "なま", "いきる"],
      examples: ["生活", "誕生"],
    };
    const result = generateKanjiPageMetadata(withDupReadings);
    // description の訓読み節に「うまれる」が一度だけ現れる
    const kunMatches = (result.description ?? "").match(/うまれる/g) ?? [];
    expect(kunMatches).toHaveLength(1);
    const keywords = result.keywords as string[];
    expect(keywords.filter((k) => k === "なま")).toHaveLength(1);
    // 文字＝部首の字で character と radical の重複も除去される
    expect(keywords.filter((k) => k === "生")).toHaveLength(1);
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
    structure: "因果" as const,
    origin: "中国" as const,
    sourceUrl: "https://kotobank.jp/word/test",
  };

  // origin が「不明」のケース。description で origin を出さず structure にフォールバックすることを確認する。
  const yojiDataUnknownOrigin = {
    yoji: "曖昧模糊",
    reading: "あいまいもこ",
    meaning: "物事がぼんやりしてはっきりしないさま",
    category: "life",
    structure: "対句" as const,
    origin: "不明" as const,
    sourceUrl: "https://kotobank.jp/word/test2",
  };

  test("titleに四字熟語とサイト名を含む", () => {
    const result = generateYojiPageMetadata(yojiData);
    expect(result.title).toContain("一期一会");
    expect(result.title).toContain("yolos.net");
  });

  test("titleに読み方（よみがな）が含まれる（読み方クエリ救済）", () => {
    const result = generateYojiPageMetadata(yojiData);
    expect(result.title).toContain("いちごいちえ");
  });

  test("descriptionが読み方を前置する（「○○○○」直後に reading が現れる）", () => {
    const result = generateYojiPageMetadata(yojiData);
    const description = result.description as string;
    expect(description).toMatch(/^「一期一会」\(いちごいちえ\)/);
  });

  test("descriptionが130字以下である", () => {
    const result = generateYojiPageMetadata(yojiData);
    const description = result.description as string;
    expect(description.length).toBeLessThanOrEqual(130);
  });

  // cycle-246 PM 最終判断で独自性訴求文言を「AIが見た人間のひとコマも。」（14字、句点含む）に変更。
  // 「実用例文」を匂わせる文言（「用例:」「例文:」「例えば」「たとえば」「使用例」「掲載」
  // など実用と誤読されうる表現）は禁止（AP-I04 期待外れ直帰の予防）。
  // また difficulty は意味検索者に無関係のため含めない。
  test("descriptionに実用例文を匂わせる文言とdifficultyを含まない", () => {
    const result = generateYojiPageMetadata(yojiData);
    const description = result.description as string;
    expect(description).not.toMatch(/用例[:：]/);
    expect(description).not.toMatch(/例文[:：]/);
    expect(description).not.toMatch(/例えば|たとえば/);
    expect(description).not.toContain("使用例");
    expect(description).not.toContain("掲載");
    expect(description).not.toContain("難易度");
  });

  test("descriptionに独自性訴求の「AIが見た人間のひとコマ」が含まれる（cycle-246 PM 最終判断）", () => {
    // cycle-117/118 で確立した AI 視点 example 全件掲載の独自性戦略を
    // スニペット段階でも活かす。研究資料が抽出した核心「AI が人間を観察している」
    // を平易な表現「AIが見た人間のひとコマ」で反映する。YojiDetail の
    // 「AIが見た人間のひとコマ」セクション（cycle-246 M-1 是正で h2 を統一）が
    // ページに表示済みの事実と整合する。
    const result = generateYojiPageMetadata(yojiData);
    const description = result.description as string;
    expect(description).toContain("AIが見た人間のひとコマ");
  });

  test("AI 文言は meaning 句点の直後に連接し、末尾に句点を伴う完全一致である", () => {
    // 「。AIが見た人間のひとコマも。」の完全一致で次の 3 点を一括検証する:
    // (1) meaning 句点と AI 文言の連接（間に他要素が挟まらない）
    // (2) AI 文言の語形（途中で切れていない・「人間のひとコマ」が崩れていない）
    // (3) AI 文言末尾の句点（後続要素との読点 / 句点境界の保護）
    const result = generateYojiPageMetadata(yojiData);
    const description = result.description as string;
    expect(description).toContain("。AIが見た人間のひとコマも。");
  });

  test("AI 文言の直後は origin/structure suffix または description 終端である（位置検証）", () => {
    // base → AI → (任意の origin/structure suffix) → 終端、の順序を正規表現で固定する。
    // AI 文言と suffix の間に他要素が混入する変更（例: 「使用例も。」のような実用語彙の
    // 不用意な復活）を構造的に検出する。
    const result = generateYojiPageMetadata(yojiData);
    const description = result.description as string;
    expect(description).toMatch(
      /。AIが見た人間のひとコマも。(?:中国伝来|日本由来|対句構造|組合せ構造|因果関係|$)/,
    );
  });

  test("origin が判明している場合は description に origin の説明が含まれる", () => {
    const result = generateYojiPageMetadata(yojiData);
    const description = result.description as string;
    expect(description).toContain("中国伝来");
  });

  test("origin が不明の場合は description に '不明' を含めず structure を採用する", () => {
    const result = generateYojiPageMetadata(yojiDataUnknownOrigin);
    const description = result.description as string;
    expect(description).not.toContain("不明");
    // structure: 対句 → 対句構造の四字熟語。
    expect(description).toContain("対句構造");
  });

  test("OG description が meta description と同一文字列である", () => {
    const result = generateYojiPageMetadata(yojiData);
    const og = result.openGraph as Record<string, unknown> | undefined;
    expect(og?.description).toBe(result.description);
  });

  test("Twitter description が meta description と同一文字列である", () => {
    const result = generateYojiPageMetadata(yojiData);
    const twitter = result.twitter as Record<string, unknown> | undefined;
    expect(twitter?.description).toBe(result.description);
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

describe("generateYojiPageMetadata - all yoji-data entries (integration)", () => {
  // yoji-data.json の本物の 400 件全件で description ≤ 130 字を構造的に保証する。
  // YOJI_AI_EXAMPLE_LABEL / origin・structure ラベル / meaning の長さが変動しても、
  // 来訪者が SERP で description が切れて意味の主要部を失うリスクを CI で予防する。
  // 個別の代表ケース（短い・長い・origin=不明）は上の describe で網羅済み。この
  // ブロックは「全件が上限を破らない」という構造的保証に特化する。
  const entries = yojiData as YojiEntry[];

  test("yoji-data.json は 400 件以上含む（前提の固定）", () => {
    // 件数が前提を満たすことを明示することで、以下のループテストが
    // 意図せず空配列で pass してしまう退化を防ぐ。
    expect(entries.length).toBeGreaterThanOrEqual(400);
  });

  test("全 400 件の description が 130 字以内である", () => {
    // 参考: 現時点の実測上限は base+AI で最大 90 字 / description 最大 100 字
    //   （上限 130 字に対し 30 字の余裕）— src/lib/seo.ts L348-350 のコメントと整合。
    //   本テストは上限 130 を直接アサートし、将来のラベル変更で余裕が削られた
    //   場合でも来訪者影響（SERP 末尾切れ）の最後の砦として機能する。
    let maxLength = 0;
    let maxYoji = "";
    for (const entry of entries) {
      const metadata = generateYojiPageMetadata(entry);
      const descriptionLength = (metadata.description as string).length;
      expect(descriptionLength).toBeLessThanOrEqual(130);
      if (descriptionLength > maxLength) {
        maxLength = descriptionLength;
        maxYoji = entry.yoji;
      }
    }
    // 実測上限を expect で表面化する（assertion 失敗時に最長エントリの特定を容易にする）。
    // 上限 130 字に対する余裕は seo.ts コメント（30 字）を超えない想定。
    expect(maxLength).toBeLessThanOrEqual(130);
    // maxYoji は失敗時のデバッグ補助。常に文字列であることのみ最小確認。
    expect(typeof maxYoji).toBe("string");
  });
});

describe("generateYojiJsonLd", () => {
  const yojiData = {
    yoji: "一期一会",
    reading: "いちごいちえ",
    meaning: "一生に一度の出会い",
    category: "life",
    structure: "因果" as const,
    origin: "中国" as const,
    sourceUrl: "https://kotobank.jp/word/test",
  };

  test("DefinedTerm 型で基本プロパティが揃っている", () => {
    const result = generateYojiJsonLd(yojiData) as Record<string, unknown>;
    expect(result["@context"]).toBe("https://schema.org");
    expect(result["@type"]).toBe("DefinedTerm");
    expect(result.name).toBe("一期一会");
    expect(result.inLanguage).toBe("ja");
  });

  test("alternateName に reading が設定される", () => {
    const result = generateYojiJsonLd(yojiData) as Record<string, unknown>;
    expect(result.alternateName).toBe("いちごいちえ");
  });

  test("sameAs は含まれない（cycle-246 是正: 独自性主張保護）", () => {
    // schema.org の sameAs は「同一性を曖昧さなく示す参照ページ」を意味するため、
    // コトバンク等の外部辞書ページを sameAs に置くと「うちのページとコトバンクは
    // 同じものを指す」と機械可読に宣言する構造になる。cycle-117/118 で確立した
    // AI 視点 example による独自性戦略を打ち消す方向のため、sameAs は撤去した。
    const result = generateYojiJsonLd(yojiData) as Record<string, unknown>;
    expect(result.sameAs).toBeUndefined();
  });

  test("JSON-LD のキーが想定セットに限定される（sameAs を含まない網羅確認）", () => {
    const result = generateYojiJsonLd(yojiData) as Record<string, unknown>;
    const keys = Object.keys(result).sort();
    expect(keys).toEqual(
      [
        "@context",
        "@type",
        "alternateName",
        "description",
        "inDefinedTermSet",
        "inLanguage",
        "name",
        "url",
      ].sort(),
    );
  });

  test("inDefinedTermSet が四字熟語辞典を指す", () => {
    const result = generateYojiJsonLd(yojiData) as Record<string, unknown>;
    expect(result.inDefinedTermSet).toMatchObject({
      "@type": "DefinedTermSet",
      name: "四字熟語辞典",
    });
  });

  test("url が canonical 形式（encodeURIComponent 済み）である", () => {
    const result = generateYojiJsonLd(yojiData) as Record<string, unknown>;
    const url = result.url as string;
    expect(url).toMatch(/^https:\/\//);
    expect(url).toContain("/dictionary/yoji/");
    expect(url).toContain(encodeURIComponent("一期一会"));
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
      howItWorks: "テスト用の処理内容説明です。",
    });

    expect(result.twitter).toMatchObject({
      card: "summary_large_image",
      title: "テストツール - 無料オンラインツール",
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
      radical: "山",
      strokeCount: 3,
      meanings: ["mountain"],
      onYomi: ["サン"],
      kunYomi: ["やま"],
      examples: ["火山"],
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
      structure: "因果",
      origin: "中国",
      sourceUrl: "https://kotobank.jp/word/test",
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

describe("generateFaqPageJsonLd", () => {
  const sampleFaq = [
    {
      question: "ひらがな1文字は何バイト？",
      answer: "UTF-8では3バイトです。ASCII文字は1バイト、絵文字は4バイトです。",
    },
    {
      question: "改行コードは文字数に含まれる？",
      answer:
        "はい。改行コードも1文字としてカウントされます。行数は改行の数に基づいて計算しています。",
    },
  ];

  test("@typeがFAQPageである", () => {
    const result = generateFaqPageJsonLd(sampleFaq) as Record<string, unknown>;
    expect(result["@context"]).toBe("https://schema.org");
    expect(result["@type"]).toBe("FAQPage");
  });

  test("mainEntityがQuestion配列である", () => {
    const result = generateFaqPageJsonLd(sampleFaq) as Record<string, unknown>;
    const entities = result.mainEntity as Array<Record<string, unknown>>;
    expect(entities).toHaveLength(2);
    expect(entities[0]["@type"]).toBe("Question");
    expect(entities[1]["@type"]).toBe("Question");
  });

  test("各QuestionにnameとacceptedAnswerが含まれる", () => {
    const result = generateFaqPageJsonLd(sampleFaq) as Record<string, unknown>;
    const entities = result.mainEntity as Array<Record<string, unknown>>;

    expect(entities[0].name).toBe("ひらがな1文字は何バイト？");
    const answer0 = entities[0].acceptedAnswer as Record<string, unknown>;
    expect(answer0["@type"]).toBe("Answer");
    expect(answer0.text).toBe(
      "UTF-8では3バイトです。ASCII文字は1バイト、絵文字は4バイトです。",
    );

    expect(entities[1].name).toBe("改行コードは文字数に含まれる？");
    const answer1 = entities[1].acceptedAnswer as Record<string, unknown>;
    expect(answer1["@type"]).toBe("Answer");
    expect(answer1.text).toBe(
      "はい。改行コードも1文字としてカウントされます。行数は改行の数に基づいて計算しています。",
    );
  });

  test("FAQ項目が1件でも正しくJSON-LDを生成する", () => {
    const singleFaq = [{ question: "質問1", answer: "回答1" }];
    const result = generateFaqPageJsonLd(singleFaq) as Record<string, unknown>;
    const entities = result.mainEntity as Array<Record<string, unknown>>;
    expect(entities).toHaveLength(1);
    expect(entities[0].name).toBe("質問1");
  });

  test("空配列でも正しくJSON-LDを生成する", () => {
    const result = generateFaqPageJsonLd([]) as Record<string, unknown>;
    const entities = result.mainEntity as Array<Record<string, unknown>>;
    expect(entities).toHaveLength(0);
  });
});

describe("JSON-LD external sameAs/isBasedOn/citation guard (cycle-246 再発防止)", () => {
  // cycle-246 で `generateYojiJsonLd` に外部辞書 URL (コトバンク) を sameAs で一旦採用した
  // 失敗の構造的再発防止。schema.org の sameAs / isBasedOn / citation は
  // 「うちのページと当該 URL が同一実体・派生関係・参照関係にある」と機械可読に主張する
  // プロパティで、外部 URL（自サイト以外）を入れることは「外部の独自付加価値を持つページに
  // 自サイトを紐付ける＝サイトの目的（PV 獲得＝来訪者に最高の価値）と矛盾する」構造になる。
  // 教訓を振り返りに書くだけでは「絶対にありえない選択肢」の再発を防げないため、
  // テストで CI に強制させる。

  /**
   * 規制対象プロパティ。意味論的に「同一性宣言・派生関係宣言・参照宣言」をまとめて扱う。
   * - sameAs: 同一実体の別 URL を宣言する
   * - isBasedOn: 派生元の URL を宣言する
   * - citation: 参照先の URL を宣言する
   * 規制対象を勝手に拡大しないこと（cycle-246 仕様）。
   */
  const RESTRICTED_PROPS = ["sameAs", "isBasedOn", "citation"] as const;

  /**
   * オブジェクトを再帰的に走査し、規制対象プロパティに自サイト以外の絶対 URL が入っていれば違反として返す。
   * 自サイト URL（BASE_URL で始まる絶対 URL）は将来 Wikipedia/Wikidata のような真の同一実体を
   * 扱うときの土台として許容する（schema.org が想定する正しい用法）。
   */
  function findExternalRefViolations(obj: unknown, path = ""): string[] {
    const violations: string[] = [];
    if (obj === null || typeof obj !== "object") return violations;
    if (Array.isArray(obj)) {
      obj.forEach((item, idx) => {
        violations.push(...findExternalRefViolations(item, `${path}[${idx}]`));
      });
      return violations;
    }
    for (const [key, val] of Object.entries(obj as Record<string, unknown>)) {
      const here = path ? `${path}.${key}` : key;
      if ((RESTRICTED_PROPS as readonly string[]).includes(key)) {
        const urls = Array.isArray(val) ? val : [val];
        for (const url of urls) {
          if (typeof url === "string" && /^https?:\/\//.test(url)) {
            if (!url.startsWith(BASE_URL)) {
              violations.push(`${here}: 外部URL "${url}" は禁止`);
            }
          }
        }
      } else if (val !== null && typeof val === "object") {
        violations.push(...findExternalRefViolations(val, here));
      }
    }
    return violations;
  }

  // ヘルパー自体の機能テスト（境界: 違反系）。実装が壊れて常に空配列を返すような退化を防ぐ。
  test("ヘルパー: 規制対象プロパティに外部 URL があれば違反として検出する", () => {
    const violations = findExternalRefViolations({
      "@type": "DefinedTerm",
      sameAs: "https://kotobank.jp/word/test",
    });
    expect(violations.length).toBeGreaterThan(0);
    expect(violations[0]).toContain("sameAs");
    expect(violations[0]).toContain("kotobank.jp");
  });

  // ヘルパー自体の機能テスト（境界: 正常系）。自サイト URL は許容することを確認。
  // 将来 Wikipedia/Wikidata のような真の同一実体を扱うときに self-URL を許容するための土台。
  test("ヘルパー: 規制対象プロパティに自サイト URL のみが入っていれば違反としない", () => {
    const violations = findExternalRefViolations({
      "@type": "DefinedTerm",
      sameAs: `${BASE_URL}/dictionary/yoji/test`,
    });
    expect(violations).toEqual([]);
  });

  // ヘルパー自体の機能テスト（境界: 配列形式）。
  test("ヘルパー: 配列形式の sameAs でも各要素を検査する", () => {
    const violations = findExternalRefViolations({
      sameAs: [
        `${BASE_URL}/ok`,
        "https://kotobank.jp/word/test",
        "https://ja.wikipedia.org/wiki/test",
      ],
    });
    // 外部 2 件が検出されること
    expect(violations).toHaveLength(2);
  });

  // ヘルパー自体の機能テスト（境界: isBasedOn / citation も対象）。
  test("ヘルパー: isBasedOn / citation も規制対象として扱う", () => {
    const violationsIsBasedOn = findExternalRefViolations({
      isBasedOn: "https://kotobank.jp/word/test",
    });
    expect(violationsIsBasedOn.length).toBeGreaterThan(0);
    const violationsCitation = findExternalRefViolations({
      citation: "https://kotobank.jp/word/test",
    });
    expect(violationsCitation.length).toBeGreaterThan(0);
  });

  // ヘルパー自体の機能テスト（境界: 規制対象外プロパティに外部 URL があっても無視）。
  // 例: blog 記事の `image` に外部 URL を入れるのは別の話で、規制対象外。
  test("ヘルパー: 規制対象外プロパティの外部 URL は無視する", () => {
    const violations = findExternalRefViolations({
      "@type": "BlogPosting",
      image: "https://example.com/image.png",
      url: "https://example.com/external-page",
    });
    expect(violations).toEqual([]);
  });

  // -- 全 JSON-LD 関数の代表サンプルで違反ゼロ --

  test("generateToolJsonLd: 代表サンプルで違反ゼロ", () => {
    const result = generateToolJsonLd({
      slug: "json-formatter",
      name: "JSON整形",
      nameEn: "JSON Formatter",
      description: "JSONを整形・検証するツールです。",
      shortDescription: "JSON整形",
      keywords: ["JSON"],
      category: "developer",
      relatedSlugs: [],
      publishedAt: "2026-01-01T00:00:00+09:00",
      trustLevel: "verified",
      howItWorks: "テスト用の処理内容説明です。",
    });
    expect(findExternalRefViolations(result)).toEqual([]);
  });

  test("generateBlogPostJsonLd: 代表サンプルで違反ゼロ", () => {
    const result = generateBlogPostJsonLd({
      title: "テスト記事",
      slug: "test-article",
      description: "テスト記事の説明",
      published_at: "2026-02-15T10:00:00+09:00",
      updated_at: "2026-02-15T10:00:00+09:00",
      tags: ["テスト"],
    });
    expect(findExternalRefViolations(result)).toEqual([]);
  });

  test("generateGameJsonLd: 代表サンプルで違反ゼロ", () => {
    const result = generateGameJsonLd({
      name: "漢字カナール",
      description: "毎日の漢字パズル",
      url: "/play/kanji-kanaru",
      genre: "Puzzle",
      inLanguage: "ja",
      numberOfPlayers: "1",
      publishedAt: "2026-02-13T19:11:53+09:00",
    });
    expect(findExternalRefViolations(result)).toEqual([]);
  });

  test("generateBreadcrumbJsonLd: 代表サンプルで違反ゼロ", () => {
    const result = generateBreadcrumbJsonLd([
      { label: "ホーム", href: "/" },
      { label: "ツール", href: "/tools" },
      { label: "テスト" },
    ]);
    expect(findExternalRefViolations(result)).toEqual([]);
  });

  test("generateWebSiteJsonLd: 違反ゼロ", () => {
    const result = generateWebSiteJsonLd();
    expect(findExternalRefViolations(result)).toEqual([]);
  });

  test("generateKanjiJsonLd: 代表サンプルで違反ゼロ", () => {
    const result = generateKanjiJsonLd({
      character: "山",
      radical: "山",
      strokeCount: 3,
      meanings: ["mountain"],
      onYomi: ["サン"],
      kunYomi: ["やま"],
      examples: ["火山"],
    });
    expect(findExternalRefViolations(result)).toEqual([]);
  });

  test("generateYojiJsonLd: 代表サンプルで違反ゼロ", () => {
    const result = generateYojiJsonLd({
      yoji: "一期一会",
      reading: "いちごいちえ",
      meaning: "一生に一度の出会い",
      category: "life",
      structure: "因果",
      origin: "中国",
      sourceUrl: "https://kotobank.jp/word/test",
    });
    expect(findExternalRefViolations(result)).toEqual([]);
  });

  test("generateColorJsonLd: 代表サンプルで違反ゼロ", () => {
    const result = generateColorJsonLd({
      slug: "nadeshiko",
      name: "撫子",
      romaji: "nadeshiko",
      hex: "#dc9fb4",
      category: "red",
    });
    expect(findExternalRefViolations(result)).toEqual([]);
  });

  test("generateHumorDictJsonLd: 代表サンプルで違反ゼロ", () => {
    const result = generateHumorDictJsonLd({
      slug: "test-word",
      word: "テスト",
      reading: "てすと",
      definition: "試験的な何か。",
    });
    expect(findExternalRefViolations(result)).toEqual([]);
  });

  test("generateFaqPageJsonLd: 代表サンプルで違反ゼロ", () => {
    const result = generateFaqPageJsonLd([
      { question: "Q1?", answer: "A1." },
      { question: "Q2?", answer: "A2." },
    ]);
    expect(findExternalRefViolations(result)).toEqual([]);
  });

  // -- 真の再発防止: yoji-data 全 400 件で違反ゼロ --
  // cycle-246 の失敗は `generateYojiJsonLd` に sourceUrl (コトバンク) を sameAs として
  // 注入したこと。実データ全件で sourceUrl が JSON-LD に漏れていないことを構造的に保証する。
  test("generateYojiJsonLd: yoji-data.json 全 400 件で違反ゼロ", () => {
    const entries = yojiData as YojiEntry[];
    expect(entries.length).toBeGreaterThanOrEqual(400);
    for (const entry of entries) {
      const result = generateYojiJsonLd(entry);
      const violations = findExternalRefViolations(result);
      // 失敗時にどの yoji の何が違反したかを特定しやすくする。
      expect(violations, `${entry.yoji}: ${violations.join(", ")}`).toEqual([]);
    }
  });
});
