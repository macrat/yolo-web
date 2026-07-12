import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";
import DictionarySearch, {
  type DictionarySearchItem,
} from "@/dictionary/_components/DictionarySearch";
import { SITE_NAME, BASE_URL } from "@/lib/constants";
import {
  getAllKanji,
  getKanjiGrades,
  getKanjiRadicals,
  getKanjiStrokeCounts,
} from "@/dictionary/_lib/kanji";
import { KANJI_GRADE_LABELS } from "@/dictionary/_lib/types";
import styles from "./page.module.css";

/**
 * 漢字辞典トップ = 引くための入口（DESIGN.md フェーズ R・新デザイン「店構え」へ変換）。
 *
 * 旧トップ（CategoryNav の pill 群 + 常用漢字2,136字を DictionaryCard で全件フラット列挙する
 * カードグリッド + 検索）を全廃し、DESIGN.md の店構えへ作り直した。フェーズ R・C2/C3 で、
 * 共有の検索器（DictionarySearch）を使って「引く体験」を復活させた——検索結果はカードでなく
 * 品書き（罫区切りリスト・§4/§8-4）で出し、字・読み・意味・使用例を横断して引ける。
 *
 * 構成（§1「器は静か」/ §4「罫の建築」/ §6 文章 / §7「実務辞典は引く体験が主役」）:
 * - 名乗り（読む面）: 何を収録し、どう引けるかを自然な日本語で（§6）。
 * - 検索（引く体験の主役・§7）: 共有の検索器を名乗りの直後に置く。
 * - 学年・部首・画数の 3 つのファセットを、それぞれ見出し付きの「棚」= 罫で区切った区画に置き、
 *   区画の中はファセット値へのテキストリンクの索引にする。カードのグリッド（§8-4）も、
 *   2,136 字の全件フラット列挙もしない。全ての漢字は 3 ファセットのいずれかから到達できる。
 *
 * 索引が品書き（罫区切りの縦リスト）ではなく折り返すリンク群なのは、部首 198・画数 24 の
 * ファセット値は「一覧の項目」ではなく多数の短い入口＝索引だからである（198 行の縦リストは
 * 帳面の区画として成立しない）。リンクの流儀（墨→hover で朱＋下線・44px のタップ面）と
 * 罫での区画分けで店の言語に接地する。
 *
 * 色・角丸・書体・余白はすべてトークン経由（§10・直書き禁止）。インライン style は使わない。
 */

export const metadata: Metadata = {
  title: `漢字辞典 | ${SITE_NAME}`,
  description:
    "常用漢字2,136字を、学年・部首・画数から引けるオンライン漢字辞典。各漢字の読み方・意味・部首・画数と使用例をまとめています。",
  keywords: ["漢字辞典", "漢字", "読み方", "常用漢字", "部首", "画数"],
  openGraph: {
    title: `漢字辞典 | ${SITE_NAME}`,
    description:
      "常用漢字2,136字を、学年・部首・画数から引けるオンライン漢字辞典。",
    type: "website",
    url: `${BASE_URL}/dictionary/kanji`,
    siteName: SITE_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: `漢字辞典 | ${SITE_NAME}`,
    description:
      "常用漢字2,136字を、学年・部首・画数から引けるオンライン漢字辞典。",
  },
  alternates: {
    canonical: `${BASE_URL}/dictionary/kanji`,
  },
};

/** 1 つのファセット索引（学年・部首・画数）の表示に必要な最小データ。 */
interface FacetIndex {
  /** 棚の見出し（例「学年別」）。 */
  heading: string;
  /** 見出しの下に添える一文（初訪者にファセットの意味を伝える・§6）。 */
  intro: string;
  /** リスト全体のアクセシビリティ名。 */
  ariaLabel: string;
  /** ファセット値へのリンク先を作る基底パス（例「/dictionary/kanji/grade」）。 */
  basePath: string;
  /** ファセット値。slug はリンク末尾、label は表示文言。 */
  items: { slug: string; label: string }[];
}

/**
 * 見出し付きの棚（罫で区切った区画）にファセット値の索引を描く。
 * リンクは墨で組み、hover で朱＋下線（品名リンクと同じ流儀）。タップ面は 44px を確保する。
 */
function FacetShelf({ facet }: { facet: FacetIndex }) {
  return (
    <section className={styles.facet}>
      <h2 className={styles.facetHeading}>{facet.heading}</h2>
      <p className={styles.facetIntro}>{facet.intro}</p>
      <ul className={styles.facetList} aria-label={facet.ariaLabel}>
        {facet.items.map((item) => (
          <li key={item.slug}>
            <Link
              href={`${facet.basePath}/${item.slug}`}
              className={styles.facetLink}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function KanjiIndexPage() {
  const allKanji = getAllKanji();
  const totalKanji = allKanji.length;

  // 検索器（共有の器）へ渡す正規化データ。表示は品名（字）＋読み＋意味＋学年の値札、
  // 検索対象（haystack）は字・音訓・意味・使用例を連結（旧 KanjiIndexClient と同じ検索範囲を維持）。
  const searchItems: DictionarySearchItem[] = allKanji.map((k) => {
    const readings = [...k.onYomi, ...k.kunYomi];
    return {
      key: k.character,
      name: k.character,
      href: `/dictionary/kanji/${encodeURIComponent(k.character)}`,
      reading: readings.join("・") || undefined,
      note: k.meanings.join("・") || undefined,
      tags: [KANJI_GRADE_LABELS[k.grade]],
      haystack: [
        k.character,
        ...k.onYomi,
        ...k.kunYomi,
        ...k.meanings,
        ...k.examples,
      ]
        .join(" ")
        .toLowerCase(),
    };
  });

  const facets: FacetIndex[] = [
    {
      heading: "学年別",
      intro:
        "小学校で習う学年ごと、または中学以降で習う漢字に分けて並べています。",
      ariaLabel: "学年別に漢字を探す",
      basePath: "/dictionary/kanji/grade",
      items: getKanjiGrades().map((g) => ({
        slug: g,
        label: KANJI_GRADE_LABELS[Number(g)],
      })),
    },
    {
      heading: "部首別",
      intro: "部首から漢字を引けます。部首は画数の少ない順に並んでいます。",
      ariaLabel: "部首別に漢字を探す",
      basePath: "/dictionary/kanji/radical",
      items: getKanjiRadicals().map((r) => ({
        slug: encodeURIComponent(r),
        label: r,
      })),
    },
    {
      heading: "画数別",
      intro: "画数から漢字を探せます。1画から順に並んでいます。",
      ariaLabel: "画数別に漢字を探す",
      basePath: "/dictionary/kanji/stroke",
      items: getKanjiStrokeCounts().map((c) => ({
        slug: String(c),
        label: `${c}画`,
      })),
    },
  ];

  return (
    <div className={styles.container}>
      <Breadcrumb
        items={[
          { label: "ホーム", href: "/" },
          { label: "辞典", href: "/dictionary" },
          { label: "漢字辞典" },
        ]}
      />
      <h1 className={styles.title}>{"漢字辞典"}</h1>
      <p className={styles.intro}>
        {"常用漢字"}
        {totalKanji.toLocaleString("ja-JP")}
        {
          "字を収録しています。学年・部首・画数から目的の漢字を探すと、読み方や意味、部首、画数、使用例をまとめて確認できます。"
        }
      </p>

      {/* 検索（引く体験の主役・§7 実務辞典）。字・読み・意味・使用例を横断して引ける。 */}
      <div className={styles.search}>
        <DictionarySearch
          heading="漢字を検索"
          placeholder="漢字・読み・意味で検索..."
          unit="漢字"
          items={searchItems}
        />
      </div>

      {/* 閲覧の導線（学年・部首・画数のファセット索引）。 */}
      {facets.map((facet) => (
        <FacetShelf key={facet.basePath} facet={facet} />
      ))}
    </div>
  );
}
