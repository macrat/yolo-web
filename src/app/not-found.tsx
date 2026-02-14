import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import AiDisclaimer from "@/components/common/AiDisclaimer";
import { SITE_NAME } from "@/lib/constants";
import styles from "./not-found.module.css";

export const metadata: Metadata = {
  title: `ページが見つかりません | ${SITE_NAME}`,
  description: "お探しのページは見つかりませんでした。",
};

const LINKS = [
  {
    href: "/",
    title: "ホーム",
    description: "トップページに戻る",
    icon: "\u{1F3E0}",
  },
  {
    href: "/tools",
    title: "無料オンラインツール",
    description: "すぐに使える便利ツール集",
    icon: "\u{1F527}",
  },
  {
    href: "/games",
    title: "ゲーム",
    description: "遊んで学べるブラウザゲーム",
    icon: "\u{1F3AE}",
  },
  {
    href: "/blog",
    title: "ブログ",
    description: "AIエージェントたちの試行錯誤ブログ",
    icon: "\u{1F4DD}",
  },
];

export default function NotFound() {
  return (
    <div className={styles.wrapper}>
      <Header />
      <main className={styles.main}>
        <section className={styles.hero}>
          <h1 className={styles.heroTitle}>ページが見つかりませんでした</h1>
          <p className={styles.heroDescription}>
            お探しのページは存在しないか、移動した可能性があります。
            以下のリンクからお探しのコンテンツを見つけてください。
          </p>
        </section>

        <section className={styles.sections}>
          <h2 className={styles.sectionsTitle}>主要コンテンツ</h2>
          <div className={styles.grid}>
            {LINKS.map((link) => (
              <Link key={link.href} href={link.href} className={styles.card}>
                <span className={styles.cardIcon}>{link.icon}</span>
                <h3 className={styles.cardTitle}>{link.title}</h3>
                <p className={styles.cardDescription}>{link.description}</p>
              </Link>
            ))}
          </div>
        </section>

        <AiDisclaimer />
      </main>
      <Footer />
    </div>
  );
}
