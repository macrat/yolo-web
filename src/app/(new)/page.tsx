import type { Metadata } from "next";
import Link from "next/link";
import Panel from "@/components/Panel";
import { SITE_NAME, BASE_URL } from "@/lib/constants";
import { playContentBySlug } from "@/play/registry";
import type { PlayContentMeta } from "@/play/types";
import { getContentPath } from "@/play/paths";
import { playCategoryLabelMap } from "@/play/_components/categoryLabels";
import styles from "./page.module.css";

/**
 * トップページ = 診断中心の着地面（cycle-276 / B-545 決定(a)・B-542）
 *
 * cycle-276 の決定(a)で、サイトの根幹を「自分を知り、楽しむ場所（診断中心）」
 * へ一本化した。これに伴い、cycle-232 でトップに据えられた道具箱ダッシュ
 * ボード（＝道具箱-as-core の正面玄関）を撤去し、価値の中心＝診断を
 * サイトの顔に据え直す。道具箱は実用層として /toolbox へ降ろした
 * （削除ではなく降格。詳細は docs/cycles/cycle-276.md「決定(a)」）。
 *
 * 構成:
 * - h1（Panel 外）= サイト名。about・ブログ詳細と同じ先例（ページ見出しは
 *   ページの文脈でありコンテンツではないため Panel に収めない）。
 * - intro Panel = 一行コンセプト＋ AI 運営の明示（constitution rule 3。
 *   詳細な注記は Footer が常時表示）。
 * - 主役セクション「自分を発見する」= 厳選した性格/キャラ診断・占いを
 *   カードで見せ、各カードから該当診断（/play/<slug>）へ。全リストは
 *   複製せず、「すべての診断・占い・ゲームを見る」→ /play で受ける。
 * - 二次セクション「ほかにも」= 辞典・ツール・道具箱への控えめな
 *   実用/文化導線（主役にしない）。
 *
 * §7「入口ファーストビュー」の意図（何が分かって・どれくらい手軽か）は
 * セクションのリード文で一目に伝える（登録不要・数分）。煽りコピーは足さず、
 * 高揚は視覚と簡潔な言葉に留める（DESIGN.md §7 レッドライン）。
 * 診断結果固有色・象徴を主役にした §7 の視覚実装（austere 降格・基調化）は
 * cycle-277 のデザインシステム作り直しで行う。本サイクルは austere 基調の
 * まま、診断への発見導線を正面に据える第一版を出荷する。
 */

const TOP_DESCRIPTION =
  "性格診断・キャラ診断・占い・ちょっとしたゲームで、自分を知り、楽しむ。AIが企画・運営する、自分を発見する体験を集めた実験的なサイトです。";

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
 * 主役セクションに厳選して並べる診断の slug。
 *
 * 選定根拠（cycle-276 接地）:
 * - 実測で単独最大 PV のキャラ診断（character-personality・全 PV の約34%）を先頭に。
 * - 主体は性格・キャラ診断（category=personality＝サイト最強カテゴリ・カード上は
 *   「あなたはどのタイプ？」ラベル）。ただし title は character/animal/music/color と
 *   話題が異なり、来訪者には話題の幅が見える。
 * - traditional-color は伝統色で自分を表す診断（category は personality だが、結果色が
 *   辞典＝伝統色への橋渡しを兼ねる文化的な切り口）。
 * - daily（category=fortune・ラベル「今日の運勢」）を1枠入れ、性格診断以外の切り口も添える。
 * - 注記: カテゴリラベルの反復（personality が5枠で同一ラベル）は、結果ごとの固有色・象徴で
 *   カード自体を見分けやすくする視覚差＝§7 の基調化（cycle-277）で解く。本サイクルは austere 基調。
 *
 * 全リストの複製はしない（/play が担う）。コピー（title/説明/カテゴリ）は
 * レジストリ（単一情報源）から描画時に引くため、ここでは slug のみ持つ。
 * FEATURED_SLUGS は全て実在 slug（存在検証はテスト src/app/(new)/__tests__/page.test.tsx
 * が「厳選枠と同数の h3 が描画される」で担保。タイポで slug が握り潰されると数が減り落ちる）。
 */
const FEATURED_SLUGS = [
  "character-personality",
  "animal-personality",
  "music-personality",
  "traditional-color",
  "daily",
  "contrarian-fortune",
] as const;

/** 二次導線（実用・文化層）。主役にしない控えめな発見リンク。 */
const SECONDARY_LINKS = [
  {
    href: "/dictionary",
    label: "辞典",
    desc: "漢字・四字熟語・日本の伝統色を調べる。",
  },
  {
    href: "/tools",
    label: "ツール",
    desc: "文字数カウントや単位換算などの実用ツール。",
  },
  {
    href: "/toolbox",
    label: "道具箱",
    desc: "よく使う道具を一画面に並べて使う。",
  },
] as const;

export default function Home() {
  const featured = FEATURED_SLUGS.map((slug) =>
    playContentBySlug.get(slug),
  ).filter((content): content is PlayContentMeta => content !== undefined);

  return (
    <div className={styles.page}>
      {/* h1 は Panel 外（about・ブログ詳細と同じ先例）。説明本文は Panel に収める */}
      <h1 className={styles.title}>{SITE_NAME}</h1>
      <Panel as="div" className={styles.intro}>
        <p className={styles.lead}>自分を知り、楽しむ。そのための場所。</p>
        {/* AI 運営の明示（constitution rule 3。詳細な注記は Footer が常時表示） */}
        <p className={styles.aiNotice}>
          AIが企画・運営する実験的なサイトです。内容が正しくない場合があります。
        </p>
      </Panel>

      {/* 主役 = 自分を発見する体験への導線 */}
      <section className={styles.featured} aria-labelledby="featured-heading">
        <div className={styles.sectionHead}>
          <h2 id="featured-heading" className={styles.sectionTitle}>
            自分を発見する
          </h2>
          <p className={styles.sectionLead}>
            性格診断や占いで、今日のあなたを見つけてみましょう。登録不要、数分で楽しめます。
          </p>
        </div>
        <ul className={styles.cardGrid}>
          {featured.map((content) => (
            <li key={content.slug} className={styles.cardItem}>
              <Link href={getContentPath(content)} className={styles.card}>
                <span className={styles.cardCategory}>
                  {playCategoryLabelMap[content.category]}
                </span>
                <h3 className={styles.cardTitle}>{content.title}</h3>
                <p className={styles.cardDesc}>{content.shortDescription}</p>
              </Link>
            </li>
          ))}
        </ul>
        <p className={styles.allLink}>
          <Link href="/play" className={styles.allLinkAnchor}>
            すべての診断・占い・ゲームを見る
          </Link>
        </p>
      </section>

      {/* 二次 = 実用・文化層への控えめな導線 */}
      <section className={styles.more} aria-labelledby="more-heading">
        <h2 id="more-heading" className={styles.sectionTitle}>
          ほかにも
        </h2>
        <ul className={styles.moreList}>
          {SECONDARY_LINKS.map((link) => (
            <li key={link.href} className={styles.moreItem}>
              <Link href={link.href} className={styles.moreLink}>
                {link.label}
              </Link>
              <span className={styles.moreDesc}>{link.desc}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
