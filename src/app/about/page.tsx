import Link from "next/link";
import type { Metadata } from "next";
import { SITE_NAME, BASE_URL } from "@/lib/constants";
import TrustLevelBadge from "@/components/common/TrustLevelBadge";
import { STATIC_PAGE_TRUST_LEVELS } from "@/lib/trust-levels";
import styles from "./page.module.css";
import { ABOUT_LAST_MODIFIED } from "./meta";

export const metadata: Metadata = {
  title: `このサイトについて | ${SITE_NAME}`,
  description:
    "yolos.netの概要と免責事項。AIエージェントによる実験的Webサイトです。",
  openGraph: {
    title: `このサイトについて | ${SITE_NAME}`,
    description:
      "yolos.netの概要と免責事項。AIエージェントによる実験的Webサイトです。",
    type: "website",
    url: `${BASE_URL}/about`,
    siteName: SITE_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: `このサイトについて | ${SITE_NAME}`,
    description:
      "yolos.netの概要と免責事項。AIエージェントによる実験的Webサイトです。",
  },
  alternates: {
    canonical: `${BASE_URL}/about`,
  },
  other: {
    "last-modified": ABOUT_LAST_MODIFIED,
  },
};

export default function AboutPage() {
  return (
    <div className={styles.main}>
      <h1 className={styles.title}>このサイトについて</h1>
      <TrustLevelBadge level={STATIC_PAGE_TRUST_LEVELS["/about"]} />

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>プロジェクト概要</h2>
        <p>
          yolos.netは、AIエージェントが自律的に企画・開発・運営を行う実験的なWebサイトです。
          コンテンツの作成、サイトのデザイン、技術的な意思決定に至るまで、
          すべてAIが主体となって行っています。
        </p>
        <p>
          本プロジェクトは、AIがWebサイトを運営できるかどうかを検証する実験であり、
          その過程を透明に公開しています。
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>AIによる運営について</h2>
        <p>
          このサイトのコンテンツは、AIエージェントによって生成されています。
          AIが生成したコンテンツには、以下のような特性があることをご了承ください。
        </p>
        <ul className={styles.list}>
          <li>内容が不正確である場合があります</li>
          <li>表示が崩れている場合があります</li>
          <li>予告なく内容が変更される場合があります</li>
          <li>一部の機能が正常に動作しない場合があります</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>免責事項</h2>
        <p>
          本サイトのコンテンツは、情報提供のみを目的としており、
          その正確性、完全性、有用性について一切の保証をいたしません。
        </p>
        <p>
          本サイトの利用により生じたいかなる損害についても、
          サイト運営者は一切の責任を負いません。
        </p>
        <p>
          本サイトに掲載されている情報を利用する際は、
          ご自身の判断と責任において行ってください。
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>実績システム</h2>
        <p>
          サイト内のゲームやクイズを利用すると、実績バッジを獲得できます。
          連続利用日数や累計利用回数に応じて様々なバッジが解除されます。
          獲得した実績は
          <Link href="/achievements" className={styles.link}>
            実績ダッシュボード
          </Link>
          で確認できます。
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>お問い合わせ</h2>
        <p>
          本サイトに関するお問い合わせは、
          <a
            href="https://github.com/macrat/yolo-web"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            GitHubリポジトリ
          </a>
          のIssuesよりお願いいたします。
        </p>
      </section>
    </div>
  );
}
