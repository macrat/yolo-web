import type { Metadata } from "next";
import ItemList, { type ItemListItem } from "@/components/ItemList";
import ListPage from "@/components/ListPage";
import ListStatus from "@/components/ListStatus";
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
const countFormat = new Intl.NumberFormat("ja-JP");

const summaryText = `漢字・四字熟語・日本の伝統色・ユーモア辞典を楽しめるオンライン辞典。漢字${countFormat.format(kanjiCount)}字、四字熟語${countFormat.format(yojiCount)}語、伝統色${countFormat.format(colorCount)}色、ユーモア定義${countFormat.format(humorCount)}語を収録。`;

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
 * 4つの辞典。行は辞典名と、何を引けるかを言う説明を持ち、収録数を補助情報に添える。収録数は、辞典の規模を
 * 比べて選ぶ手がかりになる（DESIGN.md §7）。
 */
const DICTIONARIES: ItemListItem[] = [
  {
    name: "漢字辞典",
    href: "/dictionary/kanji",
    description:
      "常用漢字を字・読み・熟語で引き、部首・画数や英語の意味を確かめられます。",
    facts: [{ text: `${countFormat.format(kanjiCount)}字` }],
  },
  {
    name: "四字熟語辞典",
    href: "/dictionary/yoji",
    description:
      "よく使う四字熟語を、意味と使い方、カテゴリや難易度から探せます。",
    facts: [{ text: `${countFormat.format(yojiCount)}語` }],
  },
  {
    name: "伝統色辞典",
    href: "/dictionary/colors",
    description: "日本の伝統色の名前と色みを、カラーコードつきで並べています。",
    facts: [{ text: `${countFormat.format(colorCount)}色` }],
  },
  {
    name: "ユーモア辞典",
    href: "/dictionary/humor",
    description: "日常の言葉を、AIがくすっと笑える形に言い換えた辞典。",
    facts: [{ text: `${countFormat.format(humorCount)}語` }],
  },
];

/**
 * 辞典の一覧（DESIGN.md §7）。4つの辞典を行の一覧で並べる。全件の一覧なので件数の行を持ち、10件に満たないので
 * 名前の欄も並び順の組も持たない。
 */
export default function DictionaryPage() {
  return (
    <ListPage
      trail={[{ label: "ホーム", href: "/" }, { label: "辞典" }]}
      heading="辞典"
      description="漢字・四字熟語・日本の伝統色、それにAIが作ったユーモア辞典。気になる言葉や色を引いて、読み方や意味、由来を確かめてください。"
    >
      <div className={styles.list}>
        <ListStatus
          total={DICTIONARIES.length}
          matched={DICTIONARIES.length}
          filtering={false}
          unit="件"
          announcement=""
        />
        <ItemList label="辞典の一覧" items={DICTIONARIES} />
      </div>
    </ListPage>
  );
}
