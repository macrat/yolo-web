import type { Metadata } from "next";
import Link from "next/link";
import ItemList, { type ItemListItem } from "@/components/ItemList";
import PhrasedText from "@/components/PhrasedText";
import Section from "@/components/Section";
import { SITE_NAME, BASE_URL } from "@/lib/constants";
import { splitIntoPhrases } from "@/lib/phrase-breaks";
import { headingFontAttr } from "@/lib/zen-antique-charset";
import { playContentBySlug } from "@/play/registry";
import type { PlayContentMeta } from "@/play/types";
import { getContentPath } from "@/play/paths";
import styles from "./page.module.css";

/**
 * トップページ。同じ形の行を並べただけの索引にせず、焦点（目玉）のあるページにする
 * （site-concept「その場でためして持ち帰れる」）。ページはセクションを上から並べる（DESIGN.md §5 ページの割り方）。
 *
 * 1. 名乗り: 主見出しのサイト名と一言、AI が運営していることの明示（§9）。説明を並べず、具体は目玉と一覧が担う。
 * 2. 目玉（今日のためしどころ）: いちばん多くの来訪者が遊ぶ診断を、セクションの見出しと入口で立てる。
 * 3. 分野ごとのセクション: 残りの遊び・辞典・道具・読みものを、見出しと行の一覧（ItemList）で並べる。
 *    サイトにあるものの幅を示す部分なので、静かに組む。目玉に立てた診断は一覧に入れない。
 */

const TOP_DESCRIPTION =
  "AIが営むよろず屋、yolos.net。性格診断や占い、漢字・四字熟語・伝統色の辞典、文字数カウントや単位換算などの道具まで。読むだけでなく、その場でためして持ち帰れます。";

export const metadata: Metadata = {
  title: SITE_NAME,
  description: TOP_DESCRIPTION,
  openGraph: {
    title: SITE_NAME,
    description: TOP_DESCRIPTION,
    type: "website",
    url: BASE_URL,
    siteName: SITE_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: TOP_DESCRIPTION,
  },
  alternates: {
    canonical: BASE_URL,
  },
};

/**
 * 目玉（今日のためしどころ）に立てる診断。名前と遷移先はレジストリから引く。目玉の文に書いた問数「12」と
 * タイプ数「24」は、診断データの値と一致することを page.test.tsx が確かめる。
 */
const HERO_SLUG = "character-personality";
const heroContent: PlayContentMeta | undefined =
  playContentBySlug.get(HERO_SLUG);

/**
 * 「診断・占い・あそび」のセクションに並べる体験の入口。名前と遷移先はレジストリから描画時に引き、ここでは
 * slug と、トップページのために書いた一言と補助情報だけを持つ。
 *
 * 性格・キャラの診断で発見の幅を、contrarian-fortune で占いを、nakamawake で毎日更新のパズルを見せ、
 * 見出しの言う分野を実際の入口で満たす。すべての入口は /play にある。
 */
const FEATURED_PLAY: { slug: string; description: string; fact?: string }[] = [
  {
    slug: "word-sense-personality",
    description: "言葉の選び方から、四字熟語の8タイプであなたを言い当てます。",
  },
  {
    slug: "animal-personality",
    description: "トキやニホンカモシカなど、固有種12タイプで自分を知る。",
  },
  {
    slug: "traditional-color",
    description: "質問に答えると、あなたを表す伝統色がひとつ選ばれます。",
  },
  {
    slug: "unexpected-compatibility",
    description: "人でも物でもない、意外な何かとの相性を出します。",
  },
  {
    slug: "contrarian-fortune",
    description: "よくある「今日の運勢」の、ちょっとひねくれた裏バージョン。",
  },
  {
    slug: "nakamawake",
    description: "16個の言葉を、共通点で4つのグループに分けるパズル。",
    fact: "毎日更新",
  },
];

/** FEATURED_PLAY の slug をレジストリで解決し、行の一覧の行にする。レジストリに無い slug は並べない。 */
const featuredPlayItems: ItemListItem[] = FEATURED_PLAY.flatMap((entry) => {
  const content: PlayContentMeta | undefined = playContentBySlug.get(
    entry.slug,
  );
  if (content === undefined) return [];
  return [
    {
      name: content.title,
      href: getContentPath(content),
      description: entry.description,
      facts: entry.fact ? [{ text: entry.fact }] : undefined,
    },
  ];
});

/** 「辞典」のセクション。 */
const DICTIONARY_ITEMS: ItemListItem[] = [
  {
    name: "漢字辞典",
    href: "/dictionary/kanji",
    description: "常用漢字を、読み・画数・部首から引けます。",
  },
  {
    name: "四字熟語辞典",
    href: "/dictionary/yoji",
    description: "意味と使い方、由来までまとめた四字熟語の一覧。",
  },
  {
    name: "伝統色辞典",
    href: "/dictionary/colors",
    description: "和の色名とその色みを、由来つきで並べています。",
  },
  {
    name: "ユーモア辞典",
    href: "/dictionary/humor",
    description: "AIが作った、少しおかしな言葉の辞典。",
  },
];

/** 「道具」のセクション。代表的な道具の入口で、すべての道具は /tools にある。 */
const TOOL_ITEMS: ItemListItem[] = [
  {
    name: "文字数カウント",
    href: "/tools/char-count",
    description: "文章の文字数と行数を、その場で数えます。",
  },
  {
    name: "単位換算",
    href: "/tools/unit-converter",
    description: "長さ・重さ・温度などをまとめて換算。",
  },
  {
    name: "JSON整形",
    href: "/tools/json-formatter",
    description: "読みづらいJSONを、見やすい形に整えます。",
  },
  {
    name: "QRコード作成",
    href: "/tools/qr-code",
    description: "URLや文章から、QRコードをその場で作ります。",
  },
];

/** 「読みもの」のセクション（ブログ）。 */
const READING_ITEMS: ItemListItem[] = [
  {
    name: "ブログ",
    href: "/blog",
    description:
      "サイトを作りながら気づいたことや、道具の使い方を書いています。",
  },
];

/**
 * サイト名はドメイン名なので、ラベルを区切る「.」の後ろで折る（「yolos.／net」）。1行に入らない狭い画面でも、
 * 語の途中で割れない。
 */
const SITE_NAME_PHRASES = SITE_NAME.split(/(?<=\.)/);

const HERO_HEADING_ID = "hero-heading";

export default function Home() {
  return (
    <>
      <Section>
        <div className={styles.intro}>
          <PhrasedText as="h1" phrases={SITE_NAME_PHRASES} />
          <p>
            <span className={styles.phrase}>読むだけのサイトではなく、</span>
            <span className={styles.phrase}>やってみるサイト。</span>
            <span className={styles.phrase}>AIが営む、よろず屋です。</span>
          </p>
          <p className={styles.aiNotice}>
            運営しているのは人ではなくAIです。実験なので、内容に誤りがあるかもしれません。
          </p>
        </div>
      </Section>

      {heroContent ? (
        <Section aria-labelledby={HERO_HEADING_ID}>
          <p className={styles.heroKicker}>今日のためしどころ</p>
          <PhrasedText
            as="h2"
            id={HERO_HEADING_ID}
            className={styles.heroTitle}
            phrases={splitIntoPhrases(heroContent.title)}
            {...headingFontAttr(heroContent.title)}
          />
          <p className={styles.heroLede}>
            12の問いに答えると、あなたに近いキャラクター像がひとつ。結果は札にして持ち帰れます。
          </p>
          <p className={styles.heroFacts}>24タイプ</p>
          <Link
            href={getContentPath(heroContent)}
            className={styles.heroLink}
            data-inverted
          >
            やってみる →
          </Link>
        </Section>
      ) : null}

      <Section>
        <PhrasedText
          as="h2"
          id="section-play"
          className={styles.sectionHeading}
          phrases={["診断・", "占い・", "あそび"]}
        />
        <ItemList labelledBy="section-play" items={featuredPlayItems} />
        <p className={styles.seeAll}>
          <Link
            href="/play"
            className={styles.seeAllLink}
            data-text-box="inline"
          >
            すべての診断・占い・ゲームを見る
          </Link>
        </p>
      </Section>

      <Section>
        <PhrasedText
          as="h2"
          id="section-dictionary"
          className={styles.sectionHeading}
          phrases={["辞典"]}
        />
        <ItemList labelledBy="section-dictionary" items={DICTIONARY_ITEMS} />
      </Section>

      <Section>
        <PhrasedText
          as="h2"
          id="section-tools"
          className={styles.sectionHeading}
          phrases={["道具"]}
        />
        <ItemList labelledBy="section-tools" items={TOOL_ITEMS} />
        <p className={styles.seeAll}>
          <Link
            href="/tools"
            className={styles.seeAllLink}
            data-text-box="inline"
          >
            すべての道具を見る
          </Link>
        </p>
      </Section>

      <Section>
        <PhrasedText
          as="h2"
          id="section-reading"
          className={styles.sectionHeading}
          phrases={["読みもの"]}
        />
        <ItemList labelledBy="section-reading" items={READING_ITEMS} />
      </Section>
    </>
  );
}
