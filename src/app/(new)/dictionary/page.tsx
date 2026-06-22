import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";
import { SITE_NAME, BASE_URL } from "@/lib/constants";
import { getAllKanji } from "@/dictionary/_lib/kanji";
import { getAllYoji } from "@/dictionary/_lib/yoji";
import { getAllColors } from "@/dictionary/_lib/colors";
import { getAllEntries as getAllHumorEntries } from "@/humor-dict/data";
import styles from "./page.module.css";

const kanjiCount = getAllKanji().length;
const yojiCount = getAllYoji().length;
const colorCount = getAllColors().length;
const humorCount = getAllHumorEntries().length;

const summaryText = `漢字・四字熟語・日本の伝統色・ユーモア辞典を楽しめるオンライン辞典。漢字${kanjiCount}字、四字熟語${yojiCount}語、伝統色${colorCount}色、ユーモア定義${humorCount}語を収録。`;

export const metadata: Metadata = {
  title: `辞典 | ${SITE_NAME}`,
  description: summaryText,
  keywords: [
    "辞典",
    "漢字辞典",
    "四字熟語辞典",
    "伝統色辞典",
    "ユーモア辞典",
    "漢字",
    "四字熟語",
    "伝統色",
  ],
  openGraph: {
    title: `辞典 | ${SITE_NAME}`,
    description: summaryText,
    type: "website",
    url: `${BASE_URL}/dictionary`,
    siteName: SITE_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: `辞典 | ${SITE_NAME}`,
    description: summaryText,
  },
  alternates: {
    canonical: `${BASE_URL}/dictionary`,
  },
};

/**
 * 辞典トップ（回遊ハブ）。
 *
 * このページの役割は検索の入口ではなく、辞典内にいる来訪者が4系統
 * （漢字・四字熟語・伝統色・ユーモア）の間を渡る「回遊ハブ」。価値は
 * 4枚のナビカードの明快さと渡しやすさにある（cycle-262 接地）。
 *
 * デザイン方針: austere（無彩）基調を維持する index 面。診断の視覚言語
 * （結果固有色・象徴絵文字・色チップ等）は持ち込まない（DESIGN.md §7 は
 * 診断のタッチポイント限定。辞典は文化層であり基調を純粋に保つ）。
 * 各カード冒頭の 漢/四/色/笑 は明朝系グリフで意味を担うため、絵文字ではなく
 * タイポグラフィとして無彩のまま残す。
 *
 * BreadcrumbList の構造化データは Breadcrumb コンポーネントが内部で
 * JSON-LD を出力する（tools/blog と同じ既存パターン）。
 */
export default function DictionaryPage() {
  const sections = [
    {
      href: "/dictionary/kanji",
      glyph: "漢",
      title: "漢字辞典",
      desc: "常用漢字の読み方・意味・部首・画数などの情報をまとめています。",
      count: `${kanjiCount}字収録`,
    },
    {
      href: "/dictionary/yoji",
      glyph: "四",
      title: "四字熟語辞典",
      desc: "よく使われる四字熟語の読み方と意味を、カテゴリ・難易度別に整理しています。",
      count: `${yojiCount}語収録`,
    },
    {
      href: "/dictionary/colors",
      glyph: "色",
      title: "伝統色辞典",
      desc: "日本の伝統色の名前とカラーデータを一覧で確認できます。",
      count: `${colorCount}色収録`,
    },
    {
      href: "/dictionary/humor",
      glyph: "笑",
      title: "ユーモア辞典",
      desc: "日常のあらゆる言葉をユーモラスに再定義。クスッと笑える新解釈で、言葉の別の側面を楽しもう。",
      count: `${humorCount}語収録`,
    },
  ];

  return (
    <div className={styles.container}>
      <Breadcrumb items={[{ label: "ホーム", href: "/" }, { label: "辞典" }]} />

      <header className={styles.header}>
        <h1 className={styles.title}>辞典</h1>
        <p className={styles.description}>
          漢字・四字熟語・日本の伝統色を楽しく調べて学べる辞典です。気になる言葉や色をクリックして、読み方・意味・使い方を見てみましょう。
        </p>
      </header>

      <ul className={styles.sectionGrid}>
        {sections.map((section) => (
          <li key={section.href} className={styles.sectionItem}>
            <Link href={section.href} className={styles.sectionCard}>
              <span className={styles.sectionIcon} aria-hidden="true">
                {section.glyph}
              </span>
              <h2 className={styles.sectionTitle}>{section.title}</h2>
              <p className={styles.sectionDesc}>{section.desc}</p>
              <p className={styles.sectionCount}>{section.count}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
