import type { Metadata } from "next";
import Link from "next/link";
import ItemList, { type ItemListItem } from "@/components/ItemList";
import Tsutsumi from "@/components/Tsutsumi";
import { SITE_NAME, BASE_URL } from "@/lib/constants";
import { playContentBySlug } from "@/play/registry";
import type { PlayContentMeta } from "@/play/types";
import { getContentPath } from "@/play/paths";
import styles from "./page.module.css";

/**
 * トップページ
 *
 * 同じ形の行を並べただけの索引にせず、焦点（目玉）のあるページにする。器は紙・墨・罫・組版のみ。
 * その器の中で「階層と焦点」を作る（site-concept「その場でためして持ち帰れる」）:
 *
 * 1. 名乗り（compact）: サイト名（見出しの書体・大）＋一言。開幕の見せ場として余白を効かせ、
 *    説明の羅列はしない（具体は目玉と行の一覧が担う）。AI 明示は Footer が常時持つため、
 *    ここは短い一言に留める（§9「AI 運営を正直に、簡潔に示す」）。
 * 2. 目玉（今日のためしどころ・above the fold）: 成長エンジンの「あなたに似たキャラ診断」を
 *    単一の独立した区画（罫で囲う・地は --paper・影/色地/角丸/グラデ/ピルなし・§5）として立てる。
 *    中は「誘い＋結果見本」の非対称な一対——左に誘い（診断名・具体の一言・結果のタイプ数・
 *    入口ボタン「やってみる →」44px・ピルなし）、右に結果の見本を Tsutsumi（包み）で 1 枚
 *    実際に見せる。「持ち帰れる札」を言うだけでなく成果物として見せ、来訪者自身
 *    の結果と誤認させないよう「見本」であることを正直に添える。デスクトップは左右・モバイルは縦積み。
 * 3. 分野ごとのセクション: 目玉の後ろに、残りの体験・辞典・道具・読みものを、見出しと行の一覧
 *    （ItemList）で並べる。ここはサイトにあるものの幅を示す部分。器は静かに。
 *    目玉に立てた診断は一覧から外す（同じページで同一診断を二度立てない）。
 *
 * インライン style は使わない（色・角丸はすべてトークン経由で module.css に置く）。
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
 * 目玉（今日のためしどころ）に立てる診断。成長エンジン＝実測集客首位の
 * character-personality をページの焦点にする。名前・遷移先はレジストリ（単一情報源）から
 * 引き、コピーの具体（問数「12」・タイプ数「24」）は診断データの正典値と一致する
 * （page.test.tsx が questionCount / result 数の一致を機械ガードし、乖離を防ぐ）。
 */
const HERO_SLUG = "character-personality";
const heroContent: PlayContentMeta | undefined =
  playContentBySlug.get(HERO_SLUG);

/**
 * 「診断・占い・あそび」のセクションに並べる体験の入口。
 * 名前（title）と遷移先（href）はレジストリ（単一情報源）から描画時に引き、ここでは
 * slug と、トップページのために書いた「ひとこと」・補助情報だけを持つ（コピーの重複と乖離を防ぐ）。
 *
 * character-personality は目玉に立てたため、ここからは外す（同一診断を同じページで
 * 二度立てない）。性格・キャラ診断で発見の幅を、contrarian-fortune で占い枠を、
 * nakamawake であそび（毎日更新のパズル）を添え、見出しの言う分野を実体で満たす。全リストは /play。
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

/**
 * FEATURED_PLAY の slug をレジストリ（単一情報源）で解決し、行の一覧の行に変換する。
 * レジストリに存在しない slug は描画時に静かに脱落させず、ここで除外する（型で保証）。
 */
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

/** 「辞典」のセクション（参照ではなく引いて使う支え層）。リンク先は実在ルートのみ。 */
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

/** 「道具」のセクション。代表的な道具の入口。全一覧は /tools。 */
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

export default function Home() {
  return (
    <div className={styles.page}>
      {/* 名乗り（compact）: サイト名（見出しの書体・大）＋一言。開幕の見せ場として余白を効かせる。 */}
      <div className={styles.intro}>
        <h1 className={styles.title}>{SITE_NAME}</h1>
        {/* 一言は文節の塊（span=inline-block）で組み、折り返しを文節境界だけで起こす。
            「やってみるサイト」「よろず屋です」等が途中で割れると日本語の組版が乱れ信頼を壊す（§4）。 */}
        <p className={styles.lead}>
          <span className={styles.phrase}>読むだけのサイトではなく、</span>
          <span className={styles.phrase}>やってみるサイト。</span>
          <span className={styles.phrase}>AIが営む、よろず屋です。</span>
        </p>
        {/* AI 運営の明示（constitution rule 3・正直の開示であって「実験」を価値として売り込まない）。
            詳細な注記は Footer が常時表示するため一言に。来訪者に解読を強いない平明な言い方にする。 */}
        <p className={styles.aiNotice}>
          運営しているのは人ではなくAIです。実験なので、内容に誤りがあるかもしれません。
        </p>
      </div>

      {/*
       * 目玉（今日のためしどころ）: 成長エンジンの診断を単一区画で大きく見せる焦点。
       * 罫で囲った一区画（地は --paper）——影・色地・角丸・ピルなし（§5）。
       * レジストリ解決に失敗した場合は目玉を出さない（型の安全側・実在は page.test.tsx が保証）。
       */}
      {heroContent ? (
        <section className={styles.hero} aria-labelledby="hero-heading">
          {/* 誘い側（左）: 何を・何が得られるか・入口。視線はまずここに落ちる。 */}
          <div className={styles.heroInvite}>
            <p className={styles.heroKicker}>今日のためしどころ</p>
            <h2 id="hero-heading" className={styles.heroTitle}>
              {heroContent.title}
            </h2>
            <p className={styles.heroLede}>
              12の問いに答えると、あなたに近いキャラクター像がひとつ。結果は札にして持ち帰れます。
            </p>
            <p className={styles.heroFacts}>24タイプ</p>
            <p className={styles.heroAction}>
              <Link
                href={getContentPath(heroContent)}
                className={styles.heroLink}
                data-inverted
              >
                やってみる →
              </Link>
            </p>
          </div>

          {/*
           * 見本側（右）: 結果の成果物（包み）を 1 枚実際に見せる。「持ち帰れる」を言葉でなく
           * 現物で伝える。和色は Tsutsumi の中身にだけ出る（器へ漏らさない・§2）。
           * これは来訪者自身の結果ではなく「見本」——誤認を避けるため、その旨を正直に添える。
           */}
          <div className={styles.heroSample}>
            <Tsutsumi
              productName="キャラ診断"
              typeName="静かな観察者"
              word="よく見て、少しだけ動く。"
              symbol="観"
              color="ai"
              seal="診"
            />
            <p className={styles.heroSampleNote}>
              結果はこんな札になります（これは見本です）。
            </p>
          </div>
        </section>
      ) : null}

      {/* 分野ごとのセクション。ここは器を静かに、サイトにあるものの幅を示す。 */}
      {/* 診断・占い・あそび（見せたくなる結果への入口・目玉の診断は除く） */}
      <section className={styles.section}>
        <h2 id="section-play" className={styles.sectionHeading}>
          診断・占い・あそび
        </h2>
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
      </section>

      {/* 辞典（引いて使う支え層） */}
      <section className={styles.section}>
        <h2 id="section-dictionary" className={styles.sectionHeading}>
          辞典
        </h2>
        <ItemList labelledBy="section-dictionary" items={DICTIONARY_ITEMS} />
      </section>

      {/* 道具（実務の結果） */}
      <section className={styles.section}>
        <h2 id="section-tools" className={styles.sectionHeading}>
          道具
        </h2>
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
      </section>

      {/* 読みもの（ブログ） */}
      <section className={styles.section}>
        <h2 id="section-reading" className={styles.sectionHeading}>
          読みもの
        </h2>
        <ItemList labelledBy="section-reading" items={READING_ITEMS} />
      </section>
    </div>
  );
}
