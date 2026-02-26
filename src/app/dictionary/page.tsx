import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumb from "@/components/common/Breadcrumb";
import { SITE_NAME } from "@/lib/constants";
import { getAllKanji } from "@/dictionary/_lib/kanji";
import { getAllYoji } from "@/dictionary/_lib/yoji";
import { getAllColors } from "@/dictionary/_lib/colors";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: `辞典 | ${SITE_NAME}`,
  description:
    "漢字・四字熟語・日本の伝統色を楽しく学べるオンライン辞典。読み方・意味を丁寧にまとめています。漢字80字、四字熟語101語、伝統色250色を収録。",
  keywords: [
    "辞典",
    "漢字辞典",
    "四字熟語辞典",
    "伝統色辞典",
    "漢字",
    "四字熟語",
    "伝統色",
  ],
  openGraph: {
    title: `辞典 | ${SITE_NAME}`,
    description:
      "漢字・四字熟語・日本の伝統色を楽しく学べるオンライン辞典。漢字80字、四字熟語101語、伝統色250色を収録。",
    type: "website",
  },
  alternates: {
    canonical: "/dictionary",
  },
};

export default function DictionaryPage() {
  const kanjiCount = getAllKanji().length;
  const yojiCount = getAllYoji().length;
  const colorCount = getAllColors().length;

  return (
    <>
      <Breadcrumb items={[{ label: "ホーム", href: "/" }, { label: "辞典" }]} />

      <section className={styles.hero}>
        <h1 className={styles.heroTitle}>辞典</h1>
        <p className={styles.heroSubtext}>
          漢字・四字熟語・日本の伝統色を楽しく調べて学べる辞典です。気になる言葉や色をクリックして、読み方・意味・使い方を見てみましょう。
        </p>
      </section>

      <div className={styles.sectionGrid}>
        <Link href="/dictionary/kanji" className={styles.sectionCard}>
          <span className={styles.sectionIcon}>漢</span>
          <h2 className={styles.sectionTitle}>漢字辞典</h2>
          <p className={styles.sectionDesc}>
            小学1年生で学ぶ基本漢字の読み方・意味・部首・画数などの情報をまとめています。
          </p>
          <p className={styles.sectionCount}>{kanjiCount}字収録</p>
        </Link>

        <Link href="/dictionary/yoji" className={styles.sectionCard}>
          <span className={styles.sectionIcon}>四</span>
          <h2 className={styles.sectionTitle}>四字熟語辞典</h2>
          <p className={styles.sectionDesc}>
            よく使われる四字熟語の読み方と意味を、カテゴリ・難易度別に整理しています。
          </p>
          <p className={styles.sectionCount}>{yojiCount}語収録</p>
        </Link>

        <Link href="/colors" className={styles.sectionCard}>
          <span className={styles.sectionIcon}>色</span>
          <h2 className={styles.sectionTitle}>伝統色辞典</h2>
          <p className={styles.sectionDesc}>
            日本の伝統色の名前とカラーデータを一覧で確認できます。
          </p>
          <p className={styles.sectionCount}>{colorCount}色収録</p>
        </Link>
      </div>
    </>
  );
}
