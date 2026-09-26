import type { Metadata } from "next";
// フィーチャーへの依存は型だけ（import type）にとどめる。メタデータの組み方をサイト全体でそろえるため、
// 各フィーチャーのメタデータの型を受け取って組む関数を、この共有層に集める。
import type { ToolMeta } from "@/tools/types";
import { SITE_NAME, BASE_URL } from "@/lib/constants";

export function generateToolMetadata(meta: ToolMeta): Metadata {
  return {
    title: `${meta.name} - 無料オンラインツール | ${SITE_NAME}`,
    description: meta.description,
    keywords: meta.keywords,
    openGraph: {
      title: `${meta.name} - 無料オンラインツール`,
      description: meta.description,
      type: "website",
      url: `${BASE_URL}/tools/${meta.slug}`,
      siteName: SITE_NAME,
    },
    twitter: {
      card: "summary_large_image",
      title: `${meta.name} - 無料オンラインツール`,
      description: meta.description,
    },
    alternates: {
      canonical: `${BASE_URL}/tools/${meta.slug}`,
    },
  };
}

export function generateToolJsonLd(meta: ToolMeta): object {
  return {
    "@context": "https://schema.org",
    "@type": meta.structuredDataType || "WebApplication",
    name: meta.name,
    description: meta.description,
    url: `${BASE_URL}/tools/${meta.slug}`,
    applicationCategory: "UtilityApplication",
    operatingSystem: "All",
    datePublished: meta.publishedAt,
    dateModified: meta.updatedAt || meta.publishedAt,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "JPY",
    },
    creator: {
      "@type": "Organization",
      name: "yolos.net (AI Experiment)",
    },
  };
}

interface BlogPostMetaForSeo {
  title: string;
  slug: string;
  description: string;
  published_at: string;
  updated_at: string;
  tags: string[];
  image?: string;
}

export function generateBlogPostMetadata(post: BlogPostMetaForSeo): Metadata {
  return {
    title: `${post.title} | ${SITE_NAME}`,
    description: post.description,
    keywords: post.tags,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      url: `${BASE_URL}/blog/${post.slug}`,
      siteName: SITE_NAME,
      publishedTime: post.published_at,
      modifiedTime: post.updated_at,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
    alternates: {
      canonical: `${BASE_URL}/blog/${post.slug}`,
    },
  };
}

export function generateBlogPostJsonLd(post: BlogPostMetaForSeo): object {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    url: `${BASE_URL}/blog/${post.slug}`,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    ...(post.image ? { image: post.image } : {}),
    inLanguage: "ja",
    author: {
      "@type": "Organization",
      name: "yolos.net AI Agents",
    },
    publisher: {
      "@type": "Organization",
      name: "yolos.net (AI Experiment)",
    },
  };
}

interface GameMetaForSeo {
  name: string;
  description: string;
  url: string;
  genre?: string;
  inLanguage?: string;
  numberOfPlayers?: string;
  publishedAt?: string;
  updatedAt?: string;
}

export function generateGameJsonLd(game: GameMetaForSeo): object {
  return {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    name: game.name,
    description: game.description,
    url: `${BASE_URL}${game.url}`,
    gamePlatform: "Web Browser",
    applicationCategory: "Game",
    operatingSystem: "All",
    ...(game.genre ? { genre: game.genre } : {}),
    ...(game.inLanguage ? { inLanguage: game.inLanguage } : {}),
    ...(game.numberOfPlayers
      ? {
          numberOfPlayers: {
            "@type": "QuantitativeValue",
            value: game.numberOfPlayers,
          },
        }
      : {}),
    ...(game.publishedAt ? { datePublished: game.publishedAt } : {}),
    ...(game.publishedAt || game.updatedAt
      ? { dateModified: game.updatedAt || game.publishedAt }
      : {}),
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "JPY",
    },
    creator: {
      "@type": "Organization",
      name: "yolos.net (AI Experiment)",
    },
  };
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function generateBreadcrumbJsonLd(items: BreadcrumbItem[]): object {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: `${BASE_URL}${item.href}` } : {}),
    })),
  };
}

export function generateWebSiteJsonLd(): object {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: BASE_URL,
    // サイトの自己紹介。中心は自分を知り、楽しむ体験（性格・キャラ診断／占い／ちょっとしたゲーム）で、辞典と
    // 実用的なオンライン道具は支えとして簡潔に触れる（docs/site-concept.md）。診断は娯楽なので、科学的な根拠を
    // 言わない。AI が運営する実験サイトであることは、constitution の rule 3 により必ず言う。
    description:
      "性格診断やキャラクター診断、占い、ちょっとしたゲームを通じて「自分を知り、楽しむ」ためのサイト。漢字・四字熟語・伝統色といった日本語や文化を楽しむ辞典や、文字数カウントなどの実用的なオンライン道具も添えています。AIが運営する実験サイトです。",
    inLanguage: "ja",
    creator: {
      "@type": "Organization",
      name: "yolos.net (AI Experiment)",
    },
  };
}

// -- Dictionary SEO helpers --

interface KanjiMetaForSeo {
  character: string;
  /** 部首文字（例: 衣）。「<漢字> 部首」検索の直接の答えとして title/description に前置する。 */
  radical: string;
  /** 画数。「<漢字> 画数」検索意図に答えるため description に含める。 */
  strokeCount: number;
  meanings: string[];
  onYomi: string[];
  kunYomi: string[];
  /** 熟語などの使用例。meanings が全件英語のため、日本語の語義は使用例で補う。 */
  examples: string[];
}

// 検索意図「<漢字> 部首/画数/読み方」に答える語を title の先頭に置く共通文字列。
// og:title は yoji と同様にサイト名を落とす。
function buildKanjiTitleBody(character: string): string {
  return `「${character}」の部首・画数・読み方 - 漢字辞典`;
}

// src/data/kanji-data.json の kunYomi には、同じ読みが重なる字がある（119字。例「生」に「うまれる」「なま」が
// 各2回）。スニペット・JSON-LD・keywords に重なった読みを出すと冗長になるので、出す側で重なりを除く（出現順は保つ）。
function uniqueReadings(readings: string[]): string[] {
  return [...new Set(readings)];
}

// スニペットの冒頭で部首・画数に直接答え、続けて読み方・使用例を示す。
// meanings は2,136字すべてが英語の語なので、日本語で検索する人に見せる description には英語を並べず、
// 訓読みと使用例で語義を担わせる。
function buildKanjiDescription(kanji: KanjiMetaForSeo): string {
  const head = `漢字「${kanji.character}」の部首は「${kanji.radical}」、画数は${kanji.strokeCount}画です。`;
  const onYomi = uniqueReadings(kanji.onYomi);
  const kunYomi = uniqueReadings(kanji.kunYomi);
  const readingParts: string[] = [];
  if (onYomi.length > 0) readingParts.push(`音読み「${onYomi.join("・")}」`);
  if (kunYomi.length > 0) readingParts.push(`訓読み「${kunYomi.join("・")}」`);
  const reading =
    readingParts.length > 0 ? `読み方は${readingParts.join("、")}。` : "";
  const examples =
    kanji.examples.length > 0 ? `使用例: ${kanji.examples.join("・")}。` : "";
  return `${head}${reading}${examples}`;
}

export function generateKanjiPageMetadata(kanji: KanjiMetaForSeo): Metadata {
  const titleBody = buildKanjiTitleBody(kanji.character);
  const description = buildKanjiDescription(kanji);
  return {
    title: `${titleBody} | ${SITE_NAME}`,
    description,
    keywords: [
      ...new Set([
        kanji.character,
        "部首",
        kanji.radical,
        "画数",
        "漢字",
        "読み方",
        ...kanji.onYomi,
        ...kanji.kunYomi,
      ]),
    ],
    openGraph: {
      title: titleBody,
      description,
      type: "website",
      url: `${BASE_URL}/dictionary/kanji/${encodeURIComponent(kanji.character)}`,
      siteName: SITE_NAME,
    },
    twitter: {
      card: "summary_large_image",
      title: titleBody,
      description,
    },
    alternates: {
      canonical: `${BASE_URL}/dictionary/kanji/${encodeURIComponent(kanji.character)}`,
    },
  };
}

export function generateKanjiJsonLd(kanji: KanjiMetaForSeo): object {
  return {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: kanji.character,
    description: `部首: ${kanji.radical}／画数: ${kanji.strokeCount}画／読み: ${uniqueReadings([...kanji.onYomi, ...kanji.kunYomi]).join("・")}／意味: ${kanji.meanings.join("、")}`,
    url: `${BASE_URL}/dictionary/kanji/${encodeURIComponent(kanji.character)}`,
    inDefinedTermSet: {
      "@type": "DefinedTermSet",
      name: "漢字辞典",
      url: `${BASE_URL}/dictionary/kanji`,
    },
    inLanguage: "ja",
  };
}

interface YojiMetaForSeo {
  yoji: string;
  reading: string;
  meaning: string;
  category: string;
  structure: "対句" | "組合せ" | "因果";
  origin: "中国" | "日本" | "不明";
  sourceUrl: string;
}

/** description に任意追記する残余要素（origin/structure）の上限。
 * 現行ラベル群はすべて 12 字以下のため事実上の上限はハードリミット
 * （{@link YOJI_DESCRIPTION_HARD_LIMIT}）のみが効く。25 という値は将来
 * ラベルを追加・差し替えた際に description が肥大化しないようにする予防的ガード。 */
const YOJI_DESCRIPTION_OPTIONAL_MAX = 25;

/** description の絶対上限。これを超える場合は任意要素を採用しない。 */
const YOJI_DESCRIPTION_HARD_LIMIT = 130;

/**
 * 当サイトの独自性（全件にある AI の視点の例文）を description で伝える固定文言。ほかの辞典サイトに無い
 * 付加価値で（docs/research/2026-03-22-yoji-example-marketing-research.md）、YojiDetail の
 * 「AIが見た人間のひとコマ」セクションと同じ語を使う。
 *
 * 表現の意図:
 * - 「AIが見た」は、AI が人間を観察している視点を、観察する主体としての AI の動詞で平易に言う。
 * - 「人間のひとコマ」は例文の実体（観察された人間の小編）と一致し、スニペットで予告したものがページにある。
 * - 「使用例」「掲載」のような実用と誤読されうる語を使わず、「ひとコマ」で場面のスケッチであることを示す。
 *   実用の例文を期待して開いた人がすぐ離れないようにするためである。
 */
const YOJI_AI_EXAMPLE_LABEL = "AIが見た人間のひとコマも。";

/** YojiDetail と整合する成立地ラベル。`不明` は description で言及しない。 */
const YOJI_ORIGIN_DESCRIPTION_LABEL: Record<
  YojiMetaForSeo["origin"],
  string | null
> = {
  中国: "中国伝来の四字熟語。",
  日本: "日本由来の四字熟語。",
  不明: null,
};

/** YojiDetail と整合する構成ラベル。 */
const YOJI_STRUCTURE_DESCRIPTION_LABEL: Record<
  YojiMetaForSeo["structure"],
  string
> = {
  対句: "対句構造の四字熟語。",
  組合せ: "組合せ構造の四字熟語。",
  因果: "因果関係を表す四字熟語。",
};

/**
 * description の origin/structure suffix を決定する。
 *
 * 優先順位:
 * 1. origin が判明している場合（中国/日本）→ origin を採用
 * 2. それ以外 → structure を採用
 *
 * 採用しても上限 {@link YOJI_DESCRIPTION_HARD_LIMIT} を超える場合は採用しない。
 * `不明` の origin は誠実性のため description には載せない（本文表示に任せる）。
 */
function buildYojiOriginOrStructureSuffix(
  currentLength: number,
  structure: YojiMetaForSeo["structure"],
  origin: YojiMetaForSeo["origin"],
): string {
  const candidate =
    YOJI_ORIGIN_DESCRIPTION_LABEL[origin] ??
    YOJI_STRUCTURE_DESCRIPTION_LABEL[structure];
  if (candidate.length > YOJI_DESCRIPTION_OPTIONAL_MAX) return "";
  if (currentLength + candidate.length > YOJI_DESCRIPTION_HARD_LIMIT) return "";
  return candidate;
}

/**
 * 四字熟語ページの meta description を組み立てる。
 *
 * 組み方:
 * - 読み方で検索する人に答えるため、`「○○○○」(よみがな)` を先頭に置く
 * - meaning は必須
 * - 全件にある AI の視点の例文を、独自性としてスニペットの段階から伝える
 * - 余裕があれば origin/structure を 1 つだけ末尾に足す（両方は入れない）
 * - difficulty は意味を調べる人に関係しないので含めない
 * - 「使用例」「掲載」のような実用の辞典を思わせる語を避け、「AIが見た人間のひとコマ」という観察の視点の
 *   表現にそろえる。期待と違うページだと感じてすぐ離れることを防ぐためである。
 */
function buildYojiDescription(yoji: YojiMetaForSeo): string {
  const base = `「${yoji.yoji}」(${yoji.reading})の意味は、${yoji.meaning}。`;
  // AI 文言は独自性訴求の固定要素として常に付与する。
  // 全 400 件で実測（src/data/yoji-data.json をループして算出）:
  //   base+AI で最大 90 字、suffix まで含めて description 最大 100 字
  //   （上限 {@link YOJI_DESCRIPTION_HARD_LIMIT}=130 字に対し 30 字の余裕）。
  const withAi = `${base}${YOJI_AI_EXAMPLE_LABEL}`;
  const originOrStructure = buildYojiOriginOrStructureSuffix(
    withAi.length,
    yoji.structure,
    yoji.origin,
  );
  return originOrStructure ? `${withAi}${originOrStructure}` : withAi;
}

export function generateYojiPageMetadata(yoji: YojiMetaForSeo): Metadata {
  // 読み方で検索する人に答えるため、title にも (よみがな) を前置する。
  const title = `「${yoji.yoji}」(${yoji.reading})の意味・読み方 - 四字熟語辞典 | ${SITE_NAME}`;
  const ogTitle = `「${yoji.yoji}」(${yoji.reading})の意味・読み方 - 四字熟語辞典`;
  // OG/Twitter description は meta description と同じ文字列にする。
  const description = buildYojiDescription(yoji);
  return {
    title,
    description,
    keywords: [yoji.yoji, yoji.reading, "四字熟語", "意味", "読み方"],
    openGraph: {
      title: ogTitle,
      description,
      type: "website",
      url: `${BASE_URL}/dictionary/yoji/${encodeURIComponent(yoji.yoji)}`,
      siteName: SITE_NAME,
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
    },
    alternates: {
      canonical: `${BASE_URL}/dictionary/yoji/${encodeURIComponent(yoji.yoji)}`,
    },
  };
}

export function generateYojiJsonLd(yoji: YojiMetaForSeo): object {
  // 出典の外部辞書（コトバンクなど）を sameAs に置かない。
  //   schema.org の sameAs は「the URL of a reference Web page that unambiguously indicates
  //   the item's identity」、つまり同じ実体・同じコンテンツの別の URL だと機械に宣言するプロパティである。
  //   個別の四字熟語のページは全件に AI の視点の例文を持ち、外部辞書と同じコンテンツではない。外部辞書を
  //   sameAs に置くと、Google の spam-policies が禁じるコピー（独自の付加価値の無い再公開）だと自分から
  //   宣言する形になる。
  //   Wikipedia・Wikidata・公式サイトのように、その語の真の同一実体を指す sameAs は schema.org の想定する
  //   正しい使い方で、Google も Knowledge Graph に使う。そうした sameAs は置いてよい。
  // 出典 URL は YojiDetail の本文の外部リンクで来訪者に届く。
  return {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: yoji.yoji,
    // alternateName: 読み方を代替表記として明示（schema.org/DefinedTerm 仕様適合）。
    alternateName: yoji.reading,
    // JSON-LD 側は構造化情報として meaning のみ簡潔に格納（meta との差別化）。
    description: yoji.meaning,
    url: `${BASE_URL}/dictionary/yoji/${encodeURIComponent(yoji.yoji)}`,
    inDefinedTermSet: {
      "@type": "DefinedTermSet",
      name: "四字熟語辞典",
      url: `${BASE_URL}/dictionary/yoji`,
    },
    inLanguage: "ja",
  };
}

// -- Color Dictionary SEO helpers --

interface ColorMetaForSeo {
  slug: string;
  name: string;
  romaji: string;
  hex: string;
  category: string;
}

export function generateColorPageMetadata(color: ColorMetaForSeo): Metadata {
  return {
    title: `${color.name}（${color.romaji}）${color.hex} - 日本の伝統色 | ${SITE_NAME}`,
    description: `日本の伝統色「${color.name}」（${color.romaji}）。カラーコード: ${color.hex}。RGB・HSL値、関連する伝統色を紹介。`,
    keywords: [color.name, color.romaji, "伝統色", "日本の色", color.hex],
    openGraph: {
      title: `${color.name}（${color.romaji}）${color.hex} - 日本の伝統色`,
      description: `日本の伝統色「${color.name}」（${color.romaji}）。カラーコード: ${color.hex}。`,
      type: "website",
      url: `${BASE_URL}/dictionary/colors/${color.slug}`,
      siteName: SITE_NAME,
    },
    twitter: {
      card: "summary_large_image",
      title: `${color.name}（${color.romaji}）${color.hex} - 日本の伝統色`,
      description: `日本の伝統色「${color.name}」（${color.romaji}）。カラーコード: ${color.hex}。`,
    },
    alternates: {
      canonical: `${BASE_URL}/dictionary/colors/${color.slug}`,
    },
  };
}

export function generateColorJsonLd(color: ColorMetaForSeo): object {
  return {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: color.name,
    description: `${color.romaji}: ${color.hex}`,
    url: `${BASE_URL}/dictionary/colors/${color.slug}`,
    inDefinedTermSet: {
      "@type": "DefinedTermSet",
      name: "日本の伝統色辞典",
      url: `${BASE_URL}/dictionary/colors`,
    },
    inLanguage: "ja",
  };
}

// -- Humor Dictionary SEO helpers --

interface HumorDictEntryForSeo {
  slug: string;
  word: string;
  reading: string;
  definition: string;
}

/**
 * ユーモア辞典の個別エントリページ用メタデータを生成する。
 */
export function generateHumorDictEntryMetadata(
  entry: HumorDictEntryForSeo,
): Metadata {
  return {
    title: `「${entry.word}」のユーモア定義 - ユーモア辞典 | ${SITE_NAME}`,
    description: `${entry.reading}: ${entry.definition}`,
    keywords: [entry.word, entry.reading, "ユーモア辞典", "ユーモア定義"],
    openGraph: {
      title: `「${entry.word}」のユーモア定義 - ユーモア辞典`,
      description: `${entry.reading}: ${entry.definition}`,
      type: "website",
      url: `${BASE_URL}/dictionary/humor/${entry.slug}`,
      siteName: SITE_NAME,
    },
    twitter: {
      card: "summary_large_image",
      title: `「${entry.word}」のユーモア定義 - ユーモア辞典`,
      description: `${entry.reading}: ${entry.definition}`,
    },
    alternates: {
      canonical: `${BASE_URL}/dictionary/humor/${entry.slug}`,
    },
  };
}

/**
 * ユーモア辞典の個別エントリページ用JSON-LDを生成する。
 */
export function generateHumorDictJsonLd(entry: HumorDictEntryForSeo): object {
  return {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: entry.word,
    description: `${entry.reading}: ${entry.definition}`,
    url: `${BASE_URL}/dictionary/humor/${entry.slug}`,
    inDefinedTermSet: {
      "@type": "DefinedTermSet",
      name: "ユーモア辞典",
      url: `${BASE_URL}/dictionary/humor`,
    },
    inLanguage: "ja",
  };
}

/**
 * JSON-LDオブジェクトをscript-breakout対策付きでJSON文字列に変換する。
 *
 * HTML内の <script type="application/ld+json"> に埋め込む際に、
 * `</script>` による script-breakout 攻撃を防ぐため、
 * `<` を Unicode エスケープ `\u003c` に置換する。
 *
 * @see https://nextjs.org/docs/app/guides/json-ld
 */
export function safeJsonLdStringify(data: object): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

// -- FAQ SEO helpers --

export interface FaqEntry {
  question: string;
  answer: string;
}

/**
 * FAQPage JSON-LDオブジェクトを生成する。
 *
 * FaqSection コンポーネントを通して、FAQ を持つすべてのページに付く。
 * Schema.org FAQPage型に準拠し、各エントリをQuestion/Answer型にマッピングする。
 */
export function generateFaqPageJsonLd(faq: FaqEntry[]): object {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((entry) => ({
      "@type": "Question",
      name: entry.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: entry.answer,
      },
    })),
  };
}
