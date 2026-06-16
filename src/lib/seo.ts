import type { Metadata } from "next";
// AP-5: 以下2つのフィーチャー型への依存は型のみ（import type）であり意図的。
// seo.ts はサイト全体のSEO一貫性を維持するため、各フィーチャーのメタデータ型を
// 参照してメタデータ生成関数を提供している。各フィーチャーにSEO関数を分散させると
// サイト全体のSEO一貫性が損なわれるリスクがあるため、共有層に集約している。
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
    // サイト自己定義（cycle-232 T-2 決定で新コンセプトへ刷新。docs/site-concept.md 参照）
    description:
      "日常のちょっとした作業の傍で使える道具を集めたサイト。文字数カウント・JSON整形・単位換算などの無料オンラインツールを、気に入ったものだけ道具箱に並べて使えます。AIが運営する実験サイトです。",
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
  meanings: string[];
  onYomi: string[];
  kunYomi: string[];
}

export function generateKanjiPageMetadata(kanji: KanjiMetaForSeo): Metadata {
  const meaningText = kanji.meanings.join("、");
  const readingText = [...kanji.onYomi, ...kanji.kunYomi].join("・");
  return {
    title: `「${kanji.character}」の漢字情報 - 漢字辞典 | ${SITE_NAME}`,
    description: `漢字「${kanji.character}」の読み方・意味・使い方。読み: ${readingText}。意味: ${meaningText}。`,
    keywords: [
      kanji.character,
      "漢字",
      "読み方",
      ...kanji.onYomi,
      ...kanji.kunYomi,
      ...kanji.meanings,
    ],
    openGraph: {
      title: `「${kanji.character}」の漢字情報 - 漢字辞典`,
      description: `漢字「${kanji.character}」の読み方・意味・使い方。読み: ${readingText}。`,
      type: "website",
      url: `${BASE_URL}/dictionary/kanji/${encodeURIComponent(kanji.character)}`,
      siteName: SITE_NAME,
    },
    twitter: {
      card: "summary_large_image",
      title: `「${kanji.character}」の漢字情報 - 漢字辞典`,
      description: `漢字「${kanji.character}」の読み方・意味・使い方。読み: ${readingText}。`,
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
    description: `読み: ${[...kanji.onYomi, ...kanji.kunYomi].join("・")}。意味: ${kanji.meanings.join("、")}`,
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
 * 当サイトの独自性（AI 視点の例文を全件掲載）を description で伝える固定文言。
 *
 * 背景: cycle-117/118 で AI 視点 example を全件追加し、他辞典サイトに対する
 * 独自付加価値（Google スパムポリシー対策）として確立している（docs/cycles/cycle-117.md,
 * docs/research/2026-03-22-yoji-example-marketing-research.md 参照）。本文言は
 * YojiDetail の「AIが見た人間のひとコマ」セクション（cycle-246 M-1 是正で h2 を
 * 「AIによる使用例」から変更し description と語彙統一）に表示済みの事実と整合する。
 *
 * 表現の意図（cycle-246 PM 最終判断）:
 * - 「AIが見た」は研究資料が抽出した核心「AI が人間を観察している視点」と直接整合する
 *   平易な表現。「視点」のような抽象語ではなく、観察主体としての AI を動詞で示す。
 * - 「人間のひとコマ」は例文の実体（観察された人間の小編）と一致し、スニペット予告と
 *   ページ着地の期待整合を保つ（AP-I04 回避）。
 * - 「使用例」「掲載」のような実用と誤読されうる語彙は意図的に排し、「ひとコマ」で
 *   場面のスケッチであることを示唆する（実用例文を期待した直帰の予防）。
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
 * 設計（cycle-246 PM 最終判断版）:
 * - 読み方クエリ救済を最優先 → `「○○○○」(よみがな)` を前置
 * - meaning は必須
 * - AI 視点の独自 example を全件掲載している事実を独自性訴求として明示
 *   （cycle-117/118 で確立した独自性戦略をスニペット段階でも活かす）
 * - 余裕があれば origin/structure を 1 つだけ末尾に追加（両方は入れない）
 * - difficulty は意味検索者に無関係のため含めない
 * - 「使用例」「掲載」のような実用辞典を匂わせる語彙は避け、「AIが見た人間のひとコマ」
 *   という観察視点の表現に統一する（AP-I04 期待外れ直帰の予防）。
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
  // 読み方クエリ救済のため title にも (よみがな) を前置（cycle-246 計画）。
  const title = `「${yoji.yoji}」(${yoji.reading})の意味・読み方 - 四字熟語辞典 | ${SITE_NAME}`;
  const ogTitle = `「${yoji.yoji}」(${yoji.reading})の意味・読み方 - 四字熟語辞典`;
  // OG/Twitter description は meta description と同一文字列とする（cycle-246 計画で確定）。
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
  // sameAs は意図的に含めない（cycle-246 是正）。
  // 理由:
  //   schema.org の sameAs は「the URL of a reference Web page that unambiguously indicates
  //   the item's identity」、すなわち「同じ実体・同じコンテンツの別 URL である」と機械可読に
  //   宣言するプロパティ。Google spam-policies は「他サイトのコンテンツを独自付加価値なく再公開
  //   する＝コピー」を明確に禁じている。当サイトの個別 yoji ページは過去サイクル (cycle-117/118)
  //   で AI 視点 example を全件追加して独自付加価値を確立しており、コトバンク等の外部辞書とは
  //   「同じコンテンツ」ではない。にもかかわらず外部辞書 URL を sameAs に置く行為は、機械可読の
  //   層で「うちは外部辞書と同じコンテンツです」と宣言する構造で、spam-policies の禁止対象
  //   （コピー）に該当しうる自己申告となる構造で、撤去すべきと判断した（Google 公式が「sameAs=
  //   スパム認定」と明示しているわけではなく、sameAs の含意 × spam-policies × 当サイトの
  //   独自付加価値の三点からの論理的導出である）。
  // 撤去の射程（重要）:
  //   本撤去は「独自付加価値を確立しているコンテンツに、別の独自付加価値を持つ他サイトを sameAs
  //   で指す」誤運用の是正に限定される。Wikipedia / Wikidata / 公式サイトのように当該アイテムの
  //   真の同一実体を指す sameAs は schema.org が想定する正しい用法で、Google も Knowledge Graph
  //   構築に活用する。次任 PM が本撤去を一般化して真の同一実体への sameAs まで一律撤去しないこと。
  // 出典 URL は YojiDetail 本文の外部リンクで来訪者には届くため、JSON-LD からは外す。
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

export function generateColorCategoryMetadata(
  category: string,
  label: string,
): Metadata {
  return {
    title: `${label}の伝統色一覧 - 日本の伝統色 | ${SITE_NAME}`,
    description: `日本の伝統色「${label}」カテゴリの色一覧。カラーコード・RGB・HSL値を確認できます。`,
    keywords: [label, "伝統色", "日本の色", "カラーコード"],
    openGraph: {
      title: `${label}の伝統色一覧 - 日本の伝統色`,
      description: `日本の伝統色「${label}」カテゴリの色一覧。`,
      type: "website",
      url: `${BASE_URL}/dictionary/colors/category/${category}`,
      siteName: SITE_NAME,
    },
    twitter: {
      card: "summary_large_image",
      title: `${label}の伝統色一覧 - 日本の伝統色`,
      description: `日本の伝統色「${label}」カテゴリの色一覧。`,
    },
    alternates: {
      canonical: `${BASE_URL}/dictionary/colors/category/${category}`,
    },
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
 * ユーモア辞典の一覧ページ用メタデータを生成する。
 */
export function generateHumorDictMetadata(): Metadata {
  return {
    title: `ユーモア辞典 | ${SITE_NAME}`,
    description:
      "日常のあらゆる言葉をユーモラスに再定義した辞典。クスッと笑える新解釈で、言葉の別の側面を楽しもう。",
    keywords: ["ユーモア辞典", "ユーモア", "定義", "言葉", "面白い"],
    openGraph: {
      title: "ユーモア辞典",
      description:
        "日常のあらゆる言葉をユーモラスに再定義した辞典。クスッと笑える新解釈で、言葉の別の側面を楽しもう。",
      type: "website",
      url: `${BASE_URL}/dictionary/humor`,
      siteName: SITE_NAME,
    },
    twitter: {
      card: "summary_large_image",
      title: "ユーモア辞典",
      description:
        "日常のあらゆる言葉をユーモラスに再定義した辞典。クスッと笑える新解釈で、言葉の別の側面を楽しもう。",
    },
    alternates: {
      canonical: `${BASE_URL}/dictionary/humor`,
    },
  };
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
 * B-024で実装。FaqSectionコンポーネント経由で全FAQページに自動付与される。
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
