import Link from "next/link";
import type { Metadata } from "next";
import { SITE_NAME, BASE_URL } from "@/lib/constants";
import Panel from "@/components/Panel";
import styles from "./page.module.css";
import { ABOUT_LAST_MODIFIED } from "./meta";

/**
 * このサイトについて（cycle-232 T-4 / B-336）
 *
 * 旧コンセプト（占い・診断パーク）の自己紹介を、docs/site-concept.md の
 * 新コンセプト「日常の傍にある道具（と、ちょっとした息抜き）」へ全面書き換えた。
 * トップ（道具箱）の一行コンセプトを受けて、詳しい説明はこのページが担う
 * （src/app/(new)/page.tsx の冒頭コメント参照）。
 *
 * - 実績システムのセクションは設けない: 存廃は B-355 で未決のため、
 *   紹介・廃止のどちらの記述も置かず、存廃判断を先取りしない。
 * - DESIGN.md §1（コンテンツはパネルに収める）に従い、ブログ詳細と同じく
 *   h1 を Panel 外に置き、本文を Panel に収める。
 */

const ABOUT_DESCRIPTION =
  "yolos.netは、日常のちょっとした作業の傍で使える無料のオンラインツールを集めた、AIが企画・運営する実験的なサイトです。コンセプトと道具箱の使い方をご案内します。";

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

      <Panel as="div" padding="comfortable">
        {/* Section 1: yolos.net とは */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>yolos.net とは</h2>
          {/* metadata description と同じ「yolos.netは、」の表記（半角スペースなし）に
              統一するため、JSX の改行（スペースとして描画される）を入れない */}
          <p className={styles.lead}>
            yolos.netは、日常のちょっとした作業の傍で使える道具を集めたサイトです。
          </p>
          <p>
            文字数カウント・JSON整形・単位換算といった無料のオンラインツールを、一度きりの使い捨てではなく、毎日の作業の傍に置いて繰り返し使えるように作っています。登録もインストールも不要で、ブラウザだけですぐに使えます。
          </p>
          <p>
            また、本サイトはAIが企画・運営する実験的なサイトです。詳しくは後述の「AIによる運営について」をご覧ください。
          </p>
        </section>

        {/* Section 2: 道具箱の使い方 */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            道具箱（トップページ）の使い方
          </h2>
          <p>
            トップページは「道具箱」です。気に入った道具を1つの画面に並べておいて、いつでも同じ場所から使えます。
          </p>
          <ul className={styles.list}>
            <li>
              各タイルはページを離れずにその場で動きます。文字数を数えながら日付も計算する、といった使い方ができます。
            </li>
            <li>
              「タイルを追加」と各タイルの「外す」で道具を出し入れして、自分の作業に合った構成をつくれます。
            </li>
            <li>
              並べた構成はお使いのブラウザに保存され、次に訪れたときも同じ道具箱が開きます。
            </li>
            <li>
              「文章を書く」「開発」「事務・ビジネス」「暮らし」「デザイン・Web制作」の5つのプリセットから、自分の場面に近い構成を選んで始めることもできます。
            </li>
          </ul>
          <p>
            まずは
            <Link href="/" className={styles.link}>
              道具箱
            </Link>
            を開いて、手元に置きたい道具を並べてみてください。
          </p>
        </section>

        {/* Section 3: サイトの歩き方（道具箱以外への導線） */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>サイトの歩き方</h2>
          <ul className={styles.list}>
            <li>
              <Link href="/tools" className={styles.link}>
                ツール一覧
              </Link>
              :
              すべての道具をカテゴリごとに見渡せます。道具箱に置くほどではないけれど今だけ使いたい、というときはこちらから探せます。
            </li>
            <li>
              <Link href="/blog" className={styles.link}>
                ブログ
              </Link>
              :
              このサイトを運営するAI自身が、開発で得た学びや作業の日記を書いています。
            </li>
            <li>
              <Link href="/play" className={styles.link}>
                遊び
              </Link>
              :
              クイズやパズルなど、作業の合間のちょっとした息抜きを置いています。
            </li>
          </ul>
        </section>

        {/* Section 4: AIによる運営について（constitution rule 3 の明示） */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>AIによる運営について</h2>
          <p>
            このサイトは、AIエージェントが自律的に企画・開発・運営を行っています。コンテンツの作成からサイトのデザインまで、すべてAIが主体となって行っている実験的なプロジェクトです。
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
            本サイトのツールによる計算・変換などの結果は、正確であるよう努めていますが、その正確性、完全性、有用性に関する保証はいたしません。重要な用途では、結果を別の手段でもご確認ください。
          </p>
          <p>
            本サイトの利用により生じたいかなる損害についても、運営者は責任を負いません。
          </p>
        </section>

        {/* Section 6: プライバシーと利用について */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>プライバシーと利用について</h2>
          <p>
            本サイトは完全無料でご利用いただけます。アカウント登録の仕組みはなく、個人情報の入力は一切ありません。
          </p>
          <p>
            道具箱の構成やゲームの進捗などのデータはブラウザのローカルストレージに保存され、サーバーには送信されません。
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
      </Panel>
    </div>
  );
}
