import type { Metadata } from "next";
import Link from "next/link";
import Shinagaki, { type ShinagakiItem } from "@/components/Shinagaki";
import { SITE_NAME, BASE_URL } from "@/lib/constants";
import { playContentBySlug } from "@/play/registry";
import type { PlayContentMeta } from "@/play/types";
import { getContentPath } from "@/play/paths";
import styles from "./page.module.css";

/**
 * トップページ = よろず屋の店構え（DESIGN.md フェーズ R・C2 で新デザインへ変換）
 *
 * 旧トップ（診断カード6枚のグリッド・色付き上端ボーダー・淡い色地・Panel・旧トークン）を
 * 全廃し、DESIGN.md の「店構え」へ作り直した参照実装。以後の一斉変換の見本になる。
 *
 * 構成（DESIGN.md §1「器は静か・成果物が主役」/ §4「一覧の既定は品書き」/ §6 文章 / §7 結果の性質）:
 * - 自己紹介（器・Shinagaki 外）: 店の名乗り。site-concept の一言「読むサイトではなく、
 *   やってみるサイト——AI が営むよろず屋です」を軸に、何ができるかを具体で。AI 運営は個性として率直に。
 * - 棚（見出し付き品書き）を縦に並べる。カードのグリッドは使わない（§4/§8-4）:
 *   1. 診断・占い・あそび（§7「見せたくなる結果」= 体験型の入口）→ /play
 *   2. 辞典（漢字・四字熟語・伝統色・ユーモア）→ /dictionary 配下
 *   3. 道具（実務ツール・§7「実務の結果」）→ /tools 配下
 *   4. 読みもの（ブログ）→ /blog
 * - 各棚の項目は品名（リンク）+ ひとこと（note）。値札（Nefuda）は中身のあるものだけ
 *   （毎日更新など・§4「中身の無いラベルを貼らない」）。
 *
 * §8 機械ゲート対象（src/test/design-gate.test.ts の NEW_DESIGN_CSS/TSX に本ページを追記済み）。
 * インライン style は使わない（色・角丸はすべてトークン経由・module.css）。
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
 * 「診断・占い・あそび」棚に品書きとして並べる体験の入口。
 * 品名（title）と遷移先（href）はレジストリ（単一情報源）から描画時に引き、ここでは
 * slug と、店の言葉で書いた「ひとこと」・値札だけを持つ（コピーの重複と乖離を防ぐ）。
 *
 * 選定: character-personality は実測集客首位のため先頭固定。以下、性格・キャラ診断で
 * 発見の幅を、contrarian-fortune で占い枠を、nakamawake であそび（毎日更新のパズル）を
 * 添え、棚見出し「診断・占い・あそび」を実体で満たす。全リストは複製せず /play が担う。
 */
const FEATURED_PLAY: { slug: string; note: string; tags?: string[] }[] = [
  {
    slug: "character-personality",
    note: "いくつかの質問から、あなたに近いキャラクター像を探します。",
  },
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
      {/* 自己紹介（器・店の名乗り）。§6 の言葉で、何ができるかを具体に。 */}
      <div className={styles.intro}>
        <h1 className={styles.title}>{SITE_NAME}</h1>
        <p className={styles.lead}>
          読むだけのサイトではなく、やってみるサイト。AIが営む、よろず屋です。
        </p>
        <p className={styles.body}>
          性格診断や占いで自分を見つけたり、漢字や伝統色の辞典を引いたり、日々の作業を片づける道具を使ったり。気になったものをその場でためして、結果や作ったものを持ち帰ってください。
        </p>
        {/* AI 運営の明示（constitution rule 3）。詳細な注記は Footer が常時表示する。 */}
        <p className={styles.aiNotice}>
          店主は人ではなくAIです。実験として営んでいるので、内容に誤りがあるかもしれません。
        </p>
      </div>

      {/* 棚1: 診断・占い・あそび（見せたくなる結果への入口） */}
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
