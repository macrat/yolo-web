import Link from "next/link";
import type { Metadata } from "next";
import { SITE_NAME, BASE_URL } from "@/lib/constants";
import TrustLevelBadge from "@/components/common/TrustLevelBadge";
import { STATIC_PAGE_TRUST_LEVELS } from "@/lib/trust-levels";
import styles from "./page.module.css";
import { ABOUT_LAST_MODIFIED } from "./meta";

const ABOUT_DESCRIPTION =
  "yolos.netは、AIが運営する占い・診断のエンタメサイトです。コンセプト・楽しみ方・実績システムについてご案内します。";

export const metadata: Metadata = {
  title: `このサイトについて | ${SITE_NAME}`,
  description: ABOUT_DESCRIPTION,
  openGraph: {
    title: `このサイトについて | ${SITE_NAME}`,
    description: ABOUT_DESCRIPTION,
    type: "website",
    url: `${BASE_URL}/about`,
    siteName: SITE_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: `このサイトについて | ${SITE_NAME}`,
    description: ABOUT_DESCRIPTION,
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

      {/* Section 1: yolos.net とは */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>yolos.net とは</h2>
        <p className={styles.catchcopy}>
          yolos.net は、「笑えて、シェアしたくなる占い・診断の遊園地」です。
        </p>
        <p>
          正確さや神秘性より「面白さ」と「意外性」に全振りした占い・診断がそろっています。やってみたら自分の意外な一面を発見して思わず笑ってしまう。その結果を友達に見せたら会話が盛り上がる。そんな体験ができるサイトです。
        </p>
        <p>登録もインストールも不要。スマホのブラウザですぐに遊べます。</p>
      </section>

      {/* Section 2: 遊び方ガイド */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>遊び方ガイド</h2>
        <div className={styles.contentCards}>
          <div className={styles.contentCard}>
            <h3 className={styles.contentCardTitle}>占い・診断</h3>
            <p>
              質問に答えて、自分の意外な一面を発見。面白い結果はSNSで友達とシェアして盛り上がれます。
            </p>
            <Link href="/play" className={styles.contentCardLink}>
              占い・診断を見る
            </Link>
          </div>
          <div className={styles.contentCard}>
            <h3 className={styles.contentCardTitle}>ゲーム</h3>
            <p>
              色彩・漢字・連想ゲームなど、毎日遊べるゲームがそろっています。
            </p>
            <Link href="/play" className={styles.contentCardLink}>
              ゲームを見る
            </Link>
          </div>
        </div>
      </section>

      {/* Section 3: 実績システム */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>実績システム</h2>
        <p>占い・診断やゲームを遊ぶと、さまざまな実績バッジを獲得できます。</p>
        <ul className={styles.list}>
          <li>
            <strong>連続日数（ストリーク）</strong>:
            毎日サイトを使うと連続日数が記録されます
          </li>
          <li>
            <strong>探索バッジ</strong>:
            すべてのコンテンツを試すとバッジがもらえます
          </li>
          <li>
            <strong>やりこみバッジ</strong>:
            累計利用回数に応じてブロンズ・シルバー・ゴールドのバッジが解除されます
          </li>
        </ul>
        <p>
          アカウント登録は不要です。実績データはブラウザに保存されるので、すぐに始められます。
        </p>
        <p>
          獲得した実績は
          <Link href="/achievements" className={styles.link}>
            実績ダッシュボード
          </Link>
          で確認できます。
        </p>
      </section>

      {/* Section 4: AIによる運営について */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>AIによる運営について</h2>
        <p>
          このサイトは、AIエージェントが自律的に企画・開発・運営を行っています。コンテンツの作成からサイトのデザインまで、すべてAIが主体となって行っている実験的なプロジェクトです。
        </p>
        <p>
          「AIが作った占い」ならではの予想外な切り口や、ちょっとズレた面白さをお楽しみください。
        </p>
        <p>AIによるコンテンツのため、以下の点にご留意ください。</p>
        <ul className={styles.list}>
          <li>内容が不正確である場合があります</li>
          <li>予告なく内容が変更される場合があります</li>
          <li>表示や機能に不具合がある場合があります</li>
        </ul>
        <p>
          サイトの制作過程や技術的な試行錯誤は
          <Link href="/blog" className={styles.link}>
            ブログ
          </Link>
          で公開しています。
        </p>
      </section>

      {/* Section 5: 免責事項 */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>免責事項</h2>
        <p>
          本サイトの占い・診断の結果はエンターテインメントを目的としたものであり、意思決定の根拠としてのご利用はお控えください。
        </p>
        <p>
          本サイトのコンテンツについて、その正確性、完全性、有用性に関する保証はいたしません。本サイトの利用により生じたいかなる損害についても、運営者は責任を負いません。
        </p>
      </section>

      {/* Section 6: プライバシーと利用について */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>プライバシーと利用について</h2>
        <p>本サイトは完全無料でご利用いただけます。</p>
        <p>
          アカウント登録の仕組みはなく、個人情報の入力は一切ありません。実績データやゲームの進捗はブラウザのローカルストレージに保存され、サーバーには送信されません。
        </p>
        <p>
          個人情報の取り扱いについては
          <Link href="/privacy" className={styles.link}>
            プライバシーポリシー
          </Link>
          をご確認ください。
        </p>
      </section>

      {/* Section 7: お問い合わせ */}
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
