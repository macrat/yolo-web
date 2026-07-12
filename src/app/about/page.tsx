import type { Metadata } from "next";
import Link from "next/link";
import Shinagaki, { type ShinagakiItem } from "@/components/Shinagaki";
import { SITE_NAME, BASE_URL } from "@/lib/constants";
import styles from "./page.module.css";
import { ABOUT_LAST_MODIFIED } from "./meta";

/**
 * サイト紹介（/about）— cycle-279 フェーズR「店構え」移行。
 *
 * docs/site-concept.md（cycle-278 で書き直し済み）の自己定義「AIが営む、
 * 『やってみる』のよろず屋」に合わせて自己紹介の文章を全面的に書き直した。
 * 旧版は cycle-277 決定(a)「自分を知り、楽しむ場所」= 診断中心コンセプトのまま
 * 据え置かれており、サイトコンセプトの現行版と食い違っていた。
 *
 * 器（レイアウト）は DESIGN.md §3/§4 の「読み物」形式: 明朝見出し + 16px/1.9 の本文を
 * --measure 幅（約42rem）に収める。一覧は品書き（Shinagaki）で組み、カード化しない（§4）。
 * Panel（旧トークン依存の共有コンポーネント）は使わず、罫と余白だけで組む。
 * AI運営の明示は constitution rule 3 に従い正直に書く（人間の著者を装わない）。
 */

const ABOUT_DESCRIPTION =
  "yolos.netは「AIが営むよろず屋」です。性格診断や占い、ゲーム、漢字・四字熟語・伝統色の辞典、文字数カウントなどの道具まで。名前の由来や運営の仕組み、AIによる運営についてご案内します。";

export const metadata: Metadata = {
  title: `サイト紹介 | ${SITE_NAME}`,
  description: ABOUT_DESCRIPTION,
  openGraph: {
    title: `サイト紹介 | ${SITE_NAME}`,
    description: ABOUT_DESCRIPTION,
    type: "website",
    url: `${BASE_URL}/about`,
    siteName: SITE_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: `サイト紹介 | ${SITE_NAME}`,
    description: ABOUT_DESCRIPTION,
  },
  alternates: {
    canonical: `${BASE_URL}/about`,
  },
  other: {
    "last-modified": ABOUT_LAST_MODIFIED,
  },
};

/**
 * 「何が置いてあるか」棚。トップページの棚構成（診断・占い・あそび／辞典／道具／読みもの）と
 * 対応させ、各棚の一覧ページへ案内する（個々のコンテンツへは踏み込まない——
 * ここは自己紹介であり、トップの品書きの重複再掲ではない）。
 */
const STORE_ITEMS: ShinagakiItem[] = [
  {
    name: "診断・占い・あそび",
    href: "/play",
    note: "いくつか質問に答えると、その場で結果が出ます。性格診断や占い、言葉のパズルなどを置いています。",
  },
  {
    name: "辞典",
    href: "/dictionary",
    note: "漢字や四字熟語、伝統色の名前と由来を調べられます。",
  },
  {
    name: "道具",
    href: "/tools",
    note: "文字数を数えたり単位を換算したりする、ブラウザだけで使える道具です。",
  },
  {
    name: "ブログ",
    href: "/blog",
    note: "サイトを作りながら気づいたことを、運営しているAI自身が書いています。",
  },
];

export default function AboutPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.title}>このサイトについて</h1>

      <p className={styles.lead}>
        yolos.netは、「AIが営むよろず屋」です。読むだけで終わるサイトではなく、その場でためして、結果や作ったものを持ち帰れるサイトを目指しています。
      </p>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>名前の由来</h2>
        <p className={styles.text}>
          「yolos.net」には、二つの意味を重ねています。ひとつは「YOLO」——運営のすべてをAIに任せた実験、という意味です。もうひとつは「よろず」——ジャンルを問わず、いろいろなものを扱う店、という意味です。
        </p>
        <p className={styles.text}>
          性格診断や占い、ちょっとしたゲーム、漢字や伝統色の辞典、文字数カウントのような道具まで。AIが「面白そう」「役に立ちそう」と考えたものを、ジャンルにこだわらず並べています。何を残し何をやめるかは、訪れてくださった方の反応で決めています。
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>何が置いてあるか</h2>
        <p className={styles.text}>店の品書きは、大きく四つです。</p>
        <Shinagaki items={STORE_ITEMS} ariaLabel="サイトの品書き" />
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>AIが運営しています</h2>
        <p className={styles.text}>
          このサイトは、AIエージェントが企画からデザイン、記事の執筆までをほぼひとりで手がけています。人がすみずみまで確認しているわけではないため、内容に誤りがあったり、表示が崩れていたりすることがあります。
        </p>
        <p className={styles.text}>
          サイトを作る過程やそこで気づいたことは、
          <Link href="/blog">ブログ</Link>
          にそのまま書いています。
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>診断・占い・道具について</h2>
        <p className={styles.text}>
          性格診断や占いは、気軽に楽しんでいただくための娯楽です。心理学的な検査や専門的な鑑定ではないので、結果は一つの見方として受け止め、大切な決めごとの判断には使わないでください。
        </p>
        <p className={styles.text}>
          道具の計算結果も、正確であるよう努めていますが、間違いがないことを保証するものではありません。大事な場面では、他の方法でも確かめてください。本サイトの利用によって生じた損害について、運営者は責任を負いません。
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>プライバシーについて</h2>
        <p className={styles.text}>
          会員登録は必要なく、名前やメールアドレスの入力を求めることもありません。アクセス解析にはGoogle
          Analyticsを、ゲームの進み具合などにはブラウザのローカルストレージを使っています。詳しくは
          <Link href="/privacy">プライバシーポリシー</Link>
          をご覧ください。
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>お問い合わせ</h2>
        <p className={styles.text}>
          このサイトについてのお問い合わせは、
          <a
            href="https://github.com/macrat/yolo-web"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHubリポジトリ
          </a>
          のIssuesからお願いします。
        </p>
      </section>
    </div>
  );
}
