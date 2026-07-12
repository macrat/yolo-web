import type { Metadata } from "next";
import Link from "next/link";
import Shinagaki, { type ShinagakiItem } from "@/components/Shinagaki";
import Nefuda from "@/components/Nefuda";
import Tsutsumi from "@/components/Tsutsumi";
import { SITE_NAME, BASE_URL } from "@/lib/constants";
import { playContentBySlug } from "@/play/registry";
import type { PlayContentMeta } from "@/play/types";
import { getContentPath } from "@/play/paths";
import styles from "./page.module.css";

/**
 * トップページ = よろず屋の店先（DESIGN.md フェーズ R・作り直し版）
 *
 * 旧トップ（4つのほぼ同型な品書きの羅列＝「色を替えただけの索引」）を作り直し、
 * 焦点（目玉）のある店先にした。器は紙墨朱・罫・組版のみ（§1）。その器の中で
 * 「階層と焦点」を作る（DESIGN.md §1/§4/§7・site-concept「その場でためして持ち帰れる」）:
 *
 * 1. 名乗り（compact）: 店号（明朝・大）＋一言。開幕の見せ場として余白を効かせ、
 *    説明の羅列はしない（具体は目玉と品書きが担う）。AI 明示は Footer が常時持つため、
 *    ここは短い一言に留める（§6「AI 明示は正直に・簡潔に」）。
 * 2. 目玉（今日のためしどころ・above the fold）: 成長エンジンの「あなたに似たキャラ診断」を
 *    単一の独立した区画（罫で囲う・--rule-strong の枠・地は --paper・影/色地/角丸/グラデ/ピル
 *    なし・§8）として立てる。中は「誘い＋結果見本」の一対（§8-4 の同型カード3枚組ヒーローに
 *    しない）——左に誘い（診断名を品書きより一段大きい明朝＝scale contrast・具体の一言・値札・
 *    朱の入口ボタン「やってみる →」44px・ピルなし）、右に結果の見本を Tsutsumi（包み）で 1 枚
 *    実際に見せる。「持ち帰れる札」を言うだけでなく成果物として見せ（§7 の増幅器）、来訪者自身
 *    の結果と誤認させないよう「見本」であることを正直に添える。デスクトップは左右・モバイルは縦積み。
 * 3. 品書き（よろず＝広さの棚）: 目玉の後ろに、残りの体験・辞典・道具・読みものを
 *    Shinagaki の棚で並べる。ここは「品揃えの広さ＝よろず」を示す部分。器は静かに。
 *    目玉に立てた診断は品書きから外す（同じページで同一診断を二度立てない）。
 *
 * §8 機械ゲート対象（src/test/design-gate.test.ts）。インライン style は使わない
 * （色・角丸はすべてトークン経由・module.css）。
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
 * character-personality を店先の焦点にする。品名・遷移先はレジストリ（単一情報源）から
 * 引き、コピーの具体（問数「12」・タイプ数「24」）は診断データの正典値と一致する
 * （page.test.tsx が questionCount / result 数の一致を機械ガードし、乖離を防ぐ）。
 */
const HERO_SLUG = "character-personality";
const heroContent: PlayContentMeta | undefined =
  playContentBySlug.get(HERO_SLUG);

/**
 * 「診断・占い・あそび」棚に品書きとして並べる体験の入口。
 * 品名（title）と遷移先（href）はレジストリ（単一情報源）から描画時に引き、ここでは
 * slug と、店の言葉で書いた「ひとこと」・値札だけを持つ（コピーの重複と乖離を防ぐ）。
 *
 * character-personality は目玉に立てたため、品書きからは外す（同一診断を同じページで
 * 二度立てない）。棚は性格・キャラ診断で発見の幅を、contrarian-fortune で占い枠を、
 * nakamawake であそび（毎日更新のパズル）を添え、棚見出しを実体で満たす。全リストは /play。
 */
const FEATURED_PLAY: { slug: string; note: string; tags?: string[] }[] = [
  {
    slug: "word-sense-personality",
    note: "言葉の選び方から、四字熟語の8タイプであなたを言い当てます。",
  },
  {
    slug: "animal-personality",
    note: "トキやニホンカモシカなど、固有種12タイプで自分を知る。",
  },
  {
    slug: "traditional-color",
    note: "質問に答えると、あなたを表す伝統色がひとつ選ばれます。",
  },
  {
    slug: "unexpected-compatibility",
    note: "人でも物でもない、意外な何かとの相性を出します。",
  },
  {
    slug: "contrarian-fortune",
    note: "よくある「今日の運勢」の、ちょっとひねくれた裏バージョン。",
  },
  {
    slug: "nakamawake",
    note: "16個の言葉を、共通点で4つのグループに分けるパズル。",
    tags: ["毎日更新"],
  },
];

/**
 * FEATURED_PLAY の slug をレジストリ（単一情報源）で解決し、品書きの行に変換する。
 * レジストリに存在しない slug は描画時に静かに脱落させず、ここで除外する（型で保証）。
 */
const featuredPlayItems: ShinagakiItem[] = FEATURED_PLAY.flatMap((entry) => {
  const content: PlayContentMeta | undefined = playContentBySlug.get(
    entry.slug,
  );
  if (content === undefined) return [];
  return [
    {
      name: content.title,
      href: getContentPath(content),
      note: entry.note,
      tags: entry.tags,
    },
  ];
});

/** 「辞典」棚（参照ではなく引いて使う支え層）。リンク先は実在ルートのみ。 */
const DICTIONARY_ITEMS: ShinagakiItem[] = [
  {
    name: "漢字辞典",
    href: "/dictionary/kanji",
    note: "常用漢字を、読み・画数・部首から引けます。",
  },
  {
    name: "四字熟語辞典",
    href: "/dictionary/yoji",
    note: "意味と使い方、由来までまとめた四字熟語の一覧。",
  },
  {
    name: "日本の伝統色",
    href: "/dictionary/colors",
    note: "和の色名とその色みを、由来つきで並べています。",
  },
  {
    name: "ユーモア辞典",
    href: "/dictionary/humor",
    note: "AIが作った、少しおかしな言葉の辞典。",
  },
];

/** 「道具」棚（§7「実務の結果」= 正確さが価値）。代表的な道具の入口。全一覧は /tools。 */
const TOOL_ITEMS: ShinagakiItem[] = [
  {
    name: "文字数カウント",
    href: "/tools/char-count",
    note: "文章の文字数と行数を、その場で数えます。",
  },
  {
    name: "単位換算",
    href: "/tools/unit-converter",
    note: "長さ・重さ・温度などをまとめて換算。",
  },
  {
    name: "JSON整形",
    href: "/tools/json-formatter",
    note: "読みづらいJSONを、見やすい形に整えます。",
  },
  {
    name: "QRコード作成",
    href: "/tools/qr-code",
    note: "URLや文章から、QRコードをその場で作ります。",
  },
];

/** 「読みもの」棚（ブログ）。 */
const READING_ITEMS: ShinagakiItem[] = [
  {
    name: "ブログ",
    href: "/blog",
    note: "サイトを作りながら気づいたことや、道具の使い方を書いています。",
  },
];

export default function Home() {
  return (
    <div className={styles.page}>
      {/* 名乗り（compact）: 店号（明朝・大）＋一言。開幕の見せ場として余白を効かせる。 */}
      <div className={styles.intro}>
        <h1 className={styles.title}>{SITE_NAME}</h1>
        {/* 一言は文節の塊（span=inline-block）で組み、折り返しを文節境界だけで起こす。
            「やってみるサイト」「よろず屋です」等が途中で割れると日本語の組版が乱れ信頼を壊す（§3/§6）。 */}
        <p className={styles.lead}>
          <span className={styles.phrase}>読むだけのサイトではなく、</span>
          <span className={styles.phrase}>やってみるサイト。</span>
          <span className={styles.phrase}>AIが営む、よろず屋です。</span>
        </p>
        {/* AI 運営の明示（constitution rule 3）。詳細な注記は Footer が常時表示するため一言に。 */}
        <p className={styles.aiNotice}>
          店主は人ではなくAIです。実験として営んでいるので、内容に誤りがあるかもしれません。
        </p>
      </div>

      {/*
       * 目玉（今日のためしどころ）: 成長エンジンの診断を単一区画で大きく見せる焦点。
       * 罫で囲った一区画（--rule-strong の枠・地は --paper）——影・色地・角丸・ピルなし（§8）。
       * 見出しは品書きの品名より明確に大きく、視線がまず目玉に落ちる（scale contrast・§4）。
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
            <p className={styles.heroTags}>
              <Nefuda label="24タイプ" />
            </p>
            <p className={styles.heroAction}>
              <Link
                href={getContentPath(heroContent)}
                className={styles.heroLink}
              >
                やってみる →
              </Link>
            </p>
          </div>

          {/*
           * 見本側（右）: 結果の成果物（包み）を 1 枚実際に見せる。「持ち帰れる」を言葉でなく
           * 現物で伝える（§7 の増幅器）。和色は Tsutsumi の中身にだけ出る（器へ漏らさない・§2）。
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

      {/* 品書き（よろず＝広さの棚）。ここは器を静かに、品揃えの広さを示す。 */}
      {/* 棚1: 診断・占い・あそび（見せたくなる結果への入口・目玉の診断は除く） */}
      <div className={styles.shelf}>
        <Shinagaki
          heading="診断・占い・あそび"
          items={featuredPlayItems}
          ariaLabel="診断・占い・あそびの品書き"
        />
        <p className={styles.seeAll}>
          <Link href="/play" className={styles.seeAllLink}>
            すべての診断・占い・ゲームを見る
          </Link>
        </p>
      </div>

      {/* 棚2: 辞典（引いて使う支え層） */}
      <div className={styles.shelf}>
        <Shinagaki
          heading="辞典"
          items={DICTIONARY_ITEMS}
          ariaLabel="辞典の品書き"
        />
      </div>

      {/* 棚3: 道具（実務の結果） */}
      <div className={styles.shelf}>
        <Shinagaki heading="道具" items={TOOL_ITEMS} ariaLabel="道具の品書き" />
        <p className={styles.seeAll}>
          <Link href="/tools" className={styles.seeAllLink}>
            すべての道具を見る
          </Link>
        </p>
      </div>

      {/* 棚4: 読みもの（ブログ） */}
      <div className={styles.shelf}>
        <Shinagaki
          heading="読みもの"
          items={READING_ITEMS}
          ariaLabel="読みものの品書き"
        />
      </div>
    </div>
  );
}
