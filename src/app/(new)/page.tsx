import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import Panel from "@/components/Panel";
import { SITE_NAME, BASE_URL } from "@/lib/constants";
import { playContentBySlug } from "@/play/registry";
import type { PlayContentMeta } from "@/play/types";
import { getContentPath } from "@/play/paths";
import styles from "./page.module.css";

/**
 * トップページ = 診断中心の着地面（cycle-277 T6-c / B-545 決定(a)）
 *
 * cycle-277 の決定(a)で、サイトの根幹を「自分を知り、楽しむ場所（診断中心）」へ
 * 一本化した（外部マーケット検証つき。docs/research/2026-07-03-market-research-b545.md・
 * docs/site-unification-plan.md U1）。これに伴い、cycle-232 でトップに据えられて
 * いた道具箱ダッシュボードは実用層として /toolbox へ降ろし（削除ではなく降格）、
 * ここは価値の中心＝診断をサイトの顔に据える基調面へ作り直した。
 *
 * 構成（DESIGN.md §7「サイトの顔」準拠）:
 * - h1（Panel 外）= サイト名。about・ブログ詳細・道具箱と同じ先例。
 * - intro Panel = 自己定義「自分を知り、楽しむ。そのための場所。」＋ AI 運営の
 *   明示（constitution rule 3。詳細な注記は Footer が常時表示）。
 * - 主役セクション「自分を発見する」= 厳選した性格/キャラ診断・占いをカードで
 *   見せ、各カードから該当診断へ。全リストは複製せず「すべての診断・占い・
 *   ゲームを見る」→ /play で受ける。
 * - 二次セクション「ほかにも」= 支え層（辞典）・道具層（ツール・道具箱）への
 *   控えめな導線（主役を食わない）。
 *
 * 視覚（DESIGN.md §7 の基調＝cycle-276 第一版の austere との違い）: 各カードへ
 * 固有色を「淡い色の気配」として最小限効かせる（面＝薄いにじみ背景・一点＝
 * タイトル上の短い色帯）。詳細は page.module.css。煽りコピー・絵文字は使わない
 * （§7 レッドライン・§3。象徴絵文字は診断結果面の専用）。
 */

const TOP_DESCRIPTION =
  "性格診断・キャラ診断・占い・ちょっとしたゲームで、自分を知り、楽しむ。漢字や伝統色の辞典、便利なオンライン道具も添えた、AIが運営する実験的なサイトです。";

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
 * 主役セクションに厳選して並べる診断の slug（すべて personality/fortune 系。
 * §7: 固有色・象徴を主役に立てる表現は「自分についての発見」を返す性格・
 * キャラ診断系で最も効き、知識クイズ系には一律適用しないため、ここは診断系に絞る）。
 *
 * 選定根拠:
 * - character-personality: 実測で集客首位（直近4週 organic 着地 146 セッション・
 *   サイト全クリックの過半）。先頭固定（DESIGN.md §7 / site-unification-plan U1）。
 * - word-sense-personality: 実測で次点。四字熟語8タイプ＝文化層（辞典）への橋渡し。
 * - animal-personality: 日本固有の動物という題材で発見の幅と色（緑）を足す。
 * - traditional-color: 「文化×診断」＝差別化レーンの体現（伝統色・辞典への橋渡し。
 *   docs/site-concept.md・site-unification-plan U4）。
 * - unexpected-compatibility: 相性という切り口で「楽しむ／人に見せたくなる」幅を足す。
 * - contrarian-fortune: 占い枠で体験の幅を見せる。
 *
 * 全リストの複製はしない（/play が担う）。コピー（title/説明）と固有色は
 * レジストリ（単一情報源）から描画時に引くため、ここでは slug のみ持つ。
 */
const FEATURED_SLUGS = [
  "character-personality",
  "word-sense-personality",
  "animal-personality",
  "traditional-color",
  "unexpected-compatibility",
  "contrarian-fortune",
] as const;

/** 二次導線（支え層・道具層）。主役にしない控えめな発見リンク。 */
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
              <Link
                href={getContentPath(content)}
                className={styles.card}
                // 各診断の固有色を §7「淡い色の気配」として CSS に渡す。
                // 色は面と帯にのみ使い、テキストには使わない（page.module.css）。
                style={
                  { "--card-accent": content.accentColor } as CSSProperties
                }
              >
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

      {/* 二次 = 支え層・道具層への控えめな導線 */}
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
