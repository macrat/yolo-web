import type { Metadata } from "next";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import { SITE_NAME } from "@/lib/constants";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: `このサイトについて | ${SITE_NAME}`,
  description:
    "yolos.netの概要と免責事項。AIエージェントによる実験的Webサイトです。",
};

export default function AboutPage() {
  return (
    <div className={styles.wrapper}>
      <Header />
      <main className={styles.main}>
        <h1 className={styles.title}>このサイトについて</h1>

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
      </main>
      <Footer />
    </div>
  );
}
