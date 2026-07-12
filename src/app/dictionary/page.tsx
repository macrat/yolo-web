import type { Metadata } from "next";
import Breadcrumb from "@/components/Breadcrumb";
import Shinagaki, { type ShinagakiItem } from "@/components/Shinagaki";
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
 * 辞典トップ（回遊ハブ）— DESIGN.md フェーズ R で新デザイン「店構え」へ変換。
 *
 * このページの役割は、辞典内にいる来訪者が4系統（漢字・四字熟語・伝統色・ユーモア）の
 * 間を渡る「回遊ハブ」。旧デザイン（同型グリフカード4枚のグリッド・--fg/--bg/--border/
 * --r- 系の旧トークン・淡色地カード）を全廃し、DESIGN.md の店構えへ組み直した。
 *
 * 構成（§1「器は静か」/ §4「一覧の既定は品書き」/ §6 文章）:
 * - 名乗り（器・Shinagaki 外）: h1「辞典」と、4系統を具体で示す短い説明。
 * - 4系統は品書き（Shinagaki）の罫区切りリスト1枚で渡す。カードのグリッド（§8-4）と
 *   同型グリフアイコンは使わない。各行は品名（リンク）+ ひとこと（note）+ 収録数（meta）。
 *   収録数は「中身のある実情報」なので右端メタとして tabular で添える（§4）。
 *
 * BreadcrumbList の構造化データは Breadcrumb コンポーネントが内部で JSON-LD を出力する。
 */

/** 4系統の辞典。リンク先は実在ルートのみ。収録数は data から算出した実数（meta）。 */
const DICTIONARY_ITEMS: ShinagakiItem[] = [
  {
    name: "漢字辞典",
    href: "/dictionary/kanji",
    note: "常用漢字を、読み・意味・画数・部首から引けます。",
    meta: `${kanjiCount}字`,
  },
  {
    name: "四字熟語辞典",
    href: "/dictionary/yoji",
    note: "よく使う四字熟語を、意味と使い方、カテゴリや難易度から探せます。",
    meta: `${yojiCount}語`,
  },
  {
    name: "伝統色辞典",
    href: "/dictionary/colors",
    note: "日本の伝統色の名前と色みを、由来つきで並べています。",
    meta: `${colorCount}色`,
  },
  {
    name: "ユーモア辞典",
    href: "/dictionary/humor",
    note: "日常の言葉を、AIがくすっと笑える形に言い換えた辞典。",
    meta: `${humorCount}語`,
  },
];

export default function DictionaryPage() {
  return (
    <div className={styles.page}>
      <Breadcrumb items={[{ label: "ホーム", href: "/" }, { label: "辞典" }]} />

      {/* 名乗り（器・読む面）。何を引けるかを具体で（§6）。 */}
      <div className={styles.intro}>
        <h1 className={styles.title}>辞典</h1>
        <p className={styles.description}>
          漢字・四字熟語・日本の伝統色、それにAIが作ったユーモア辞典。気になる言葉や色を引いて、読み方や意味、由来を確かめてください。
        </p>
      </div>

      {/* 4系統の品書き（罫区切りリスト1枚で渡す・§4） */}
      <Shinagaki items={DICTIONARY_ITEMS} ariaLabel="辞典の品書き" />
    </div>
  );
}
