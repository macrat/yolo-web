import type { Metadata } from "next";
import Breadcrumb from "@/components/Breadcrumb";
import Shinagaki, { type ShinagakiItem } from "@/components/Shinagaki";
import { SITE_NAME, BASE_URL } from "@/lib/constants";
import {
  getAllYoji,
  getYojiByCategory,
  getYojiCategories,
} from "@/dictionary/_lib/yoji";
import { YOJI_CATEGORY_LABELS } from "@/dictionary/_lib/types";
import type { YojiCategory } from "@/dictionary/_lib/types";
import styles from "./page.module.css";

/**
 * 四字熟語辞典トップ = 引く辞典の入口（DESIGN.md フェーズ R で新デザインへ変換）
 *
 * 旧トップ（400語をカードのグリッドで一気に並べ、クライアント検索を載せる YojiIndexClient +
 * 共有 DictionaryGrid/DictionaryCard/SearchBox・旧トークン）を、DESIGN.md の「店構え」へ
 * 作り直した。このページの役割は「カテゴリ導線と入口」——全語の一覧は各カテゴリページが
 * 担い、トップはカテゴリの品書き（罫区切りリスト・§4）に絞る。
 *
 * 構成（§1「器は静か」/ §4「一覧の既定は品書き」/ §6 文章）:
 * - 自己紹介（器・Shinagaki 外）: 何の辞典か・何が読めるかを具体の日本語で（§6）。
 * - 「カテゴリから探す」棚（見出し付き品書き）: 各カテゴリ = 品名（カテゴリページへのリンク）
 *   + ひとこと（note）+ 収録数の値札（Nefuda・§4「件数は値札で」）。件数の多い順に並べる。
 *
 * カードのグリッドは使わない（§4/§8-4）。色・角丸・書体はすべてトークン経由（§10・直書き禁止）。
 * インライン style は使わない。
 */

const yojiCount = getAllYoji().length;

export const metadata: Metadata = {
  title: `四字熟語辞典 | ${SITE_NAME}`,
  description: `四字熟語${yojiCount}語の読み方・意味・由来を、カテゴリ別にまとめた辞典です。`,
  keywords: ["四字熟語辞典", "四字熟語", "読み方", "意味", "カテゴリ"],
  openGraph: {
    title: `四字熟語辞典 | ${SITE_NAME}`,
    description: `四字熟語${yojiCount}語を、意味・読み方・由来つきでカテゴリ別に。`,
    type: "website",
    url: `${BASE_URL}/dictionary/yoji`,
    siteName: SITE_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: `四字熟語辞典 | ${SITE_NAME}`,
    description: `四字熟語${yojiCount}語を、意味・読み方・由来つきでカテゴリ別に。`,
  },
  alternates: {
    canonical: `${BASE_URL}/dictionary/yoji`,
  },
};

/**
 * カテゴリごとの「ひとこと」（§6 具体で書く）。品書きの各行の説明に使う。
 * ラベル（YOJI_CATEGORY_LABELS）だけでは伝わりにくい範囲を、自然な日本語で補う。
 */
const CATEGORY_NOTES: Record<YojiCategory, string> = {
  life: "生き方や人の一生にまつわる四字熟語。",
  virtue: "誠実さや品格など、人の善さを表す言葉。",
  negative: "困難や欠点、よくない状態を言い表す四字熟語。",
  society: "世の中や人との関わりに関する言葉。",
  knowledge: "学びや道理、物事の理解にまつわる四字熟語。",
  change: "移り変わりや、変わっていくさまを表す言葉。",
  effort: "がんばりや積み重ねに関する四字熟語。",
  emotion: "喜びや怒りなど、心の動きを表す言葉。",
  nature: "季節や風景など、自然のさまを表す四字熟語。",
  conflict: "争いや対立、せめぎ合いに関する言葉。",
};

/**
 * カテゴリの品書き。各カテゴリを収録数の多い順に並べ、収録数を値札（Nefuda）で添える。
 * リンク先はカテゴリページ（実在ルート）で、そこから各語の詳細へ辿れる。
 */
const categoryItems: ShinagakiItem[] = getYojiCategories()
  .map((slug) => ({ slug, count: getYojiByCategory(slug).length }))
  .sort((a, b) => b.count - a.count)
  .map(({ slug, count }) => ({
    name: YOJI_CATEGORY_LABELS[slug],
    href: `/dictionary/yoji/category/${slug}`,
    note: CATEGORY_NOTES[slug],
    tags: [`${count}語`],
  }));

export default function YojiIndexPage() {
  return (
    <div className={styles.page}>
      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "辞典", href: "/dictionary" },
          { label: "四字熟語辞典" },
        ]}
      />

      {/* 自己紹介（器・辞典の名乗り）。何が読めるかを具体に（§6）。 */}
      <div className={styles.intro}>
        <h1 className={styles.title}>四字熟語辞典</h1>
        <p className={styles.lead}>{yojiCount}語の四字熟語を集めた辞典です。</p>
        <p className={styles.body}>
          カテゴリから気になるものをたどって、四字熟語を選んでください。読み方と意味、成り立ちや例文まで読めます。
        </p>
      </div>

      {/* カテゴリの品書き（カテゴリ導線）。件数は値札で（§4）。 */}
      <div className={styles.directory}>
        <Shinagaki
          heading="カテゴリから探す"
          items={categoryItems}
          ariaLabel="四字熟語のカテゴリ"
        />
      </div>
    </div>
  );
}
