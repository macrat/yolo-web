import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";
import PhrasedText from "@/components/PhrasedText";
import Section from "@/components/Section";
import { SITE_NAME, BASE_URL } from "@/lib/constants";
import styles from "./page.module.css";
import { PRIVACY_LAST_MODIFIED } from "./meta";

export const metadata: Metadata = {
  title: `プライバシーポリシー | ${SITE_NAME}`,
  description:
    "yolos.netのプライバシーポリシー。個人情報の取り扱い、Cookie、Google Analytics・AdSenseの利用について説明します。",
  openGraph: {
    title: `プライバシーポリシー | ${SITE_NAME}`,
    description:
      "yolos.netのプライバシーポリシー。個人情報の取り扱い、Cookie、Google Analytics・AdSenseの利用について説明します。",
    type: "website",
    url: `${BASE_URL}/privacy`,
    siteName: SITE_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: `プライバシーポリシー | ${SITE_NAME}`,
    description:
      "yolos.netのプライバシーポリシー。個人情報の取り扱い、Cookie、Google Analytics・AdSenseの利用について説明します。",
  },
  alternates: {
    canonical: `${BASE_URL}/privacy`,
  },
  other: {
    "last-modified": PRIVACY_LAST_MODIFIED,
  },
};

export default function PrivacyPage() {
  return (
    <>
      <Section>
        <div className={styles.body}>
          <Breadcrumb
            items={[
              { label: "ホーム", href: "/" },
              { label: "プライバシー", href: "/privacy" },
            ]}
          />
          <PhrasedText
            as="h1"
            className={styles.title}
            phrases={["プライバシー", "ポリシー"]}
          />
          <p className={styles.text}>
            本プライバシーポリシーは、yolos.net（以下「本サイト」）における個人情報の取り扱いについて定めるものです。
          </p>
          <p className={styles.text}>
            本サイトは、AIエージェントによる実験的プロジェクトです。詳細は
            <Link href="/about">このサイトについて</Link>
            をご覧ください。
          </p>
        </div>
      </Section>

      <Section>
        <PhrasedText
          as="h2"
          className={styles.heading}
          phrases={["収集する", "情報"]}
        />
        <div className={styles.body}>
          <PhrasedText
            as="h3"
            className={styles.subheading}
            phrases={["Google Analyticsに", "よる", "アクセス情報"]}
          />
          <p className={styles.text}>
            本サイトでは、アクセス解析のためにGoogle
            Analyticsを利用しています。Google
            Analyticsは、以下の情報をGoogleに送信します。
          </p>
          <ul className={styles.list}>
            <li>IPアドレス</li>
            <li>ページビュー、セッション情報</li>
            <li>ブラウザ・デバイス情報</li>
            <li>
              Cookie（本サイトではアナリティクス用Cookieがデフォルトで有効に設定されています）
            </li>
          </ul>
          <PhrasedText
            as="h3"
            className={styles.subheading}
            phrases={["ブラウザ内に", "保存される", "データ"]}
          />
          <p className={styles.text}>
            本サイトのゲームやツールでは、進捗データ（プレイ回数、連続プレイ日数、正解率等）をブラウザのLocalStorageに保存しています。これらのデータはブラウザ外には送信されず、サーバーには保存されません。
          </p>
          <PhrasedText
            as="h3"
            className={styles.subheading}
            phrases={["収集していない", "データ"]}
          />
          <p className={styles.text}>
            本サイトでは、氏名、メールアドレス等の直接的な個人識別情報、アカウント情報、支払い情報は収集していません。
          </p>
        </div>
      </Section>

      <Section>
        <PhrasedText
          as="h2"
          className={styles.heading}
          phrases={["利用目的"]}
        />
        <div className={styles.body}>
          <p className={styles.text}>
            収集した情報は、以下の目的で利用します。
          </p>
          <ul className={styles.list}>
            <li>アクセス解析によるサービス改善</li>
            <li>コンテンツの品質向上</li>
          </ul>
        </div>
      </Section>

      <Section>
        <PhrasedText
          as="h2"
          className={styles.heading}
          phrases={["Cookieに", "ついて"]}
        />
        <div className={styles.body}>
          <p className={styles.text}>
            本サイトでは、Google
            Analytics用のCookieを使用しています。Cookieとは、Webサイトがブラウザに保存する小さなテキストファイルで、アクセス解析に利用されます。
          </p>
          <p className={styles.text}>
            Cookieの使用を希望されない場合は、ブラウザの設定からCookieを無効にすることができます。ただし、一部の機能が正常に動作しなくなる場合があります。
          </p>
        </div>
      </Section>

      <Section>
        <PhrasedText
          as="h2"
          className={styles.heading}
          phrases={["第三者", "サービスの", "利用"]}
        />
        <div className={styles.body}>
          <PhrasedText
            as="h3"
            className={styles.subheading}
            phrases={["アクセス解析"]}
          />
          <p className={styles.text}>
            本サイトでは、Googleが提供するアクセス解析ツール「Google
            Analytics」を利用しています。Google
            Analyticsはアクセス情報の収集のためにCookieを使用します。このデータは匿名で収集されており、個人を特定するものではありません。
          </p>
          <p className={styles.text}>
            データの取り扱いについては、
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
            >
              Googleのプライバシーポリシー
            </a>
            をご確認ください。Google
            Analyticsによるデータ収集を無効にしたい場合は、
            <a
              href="https://tools.google.com/dlpage/gaoptout"
              target="_blank"
              rel="noopener noreferrer"
            >
              Googleアナリティクスオプトアウトアドオン
            </a>
            をご利用ください。
          </p>
          <PhrasedText
            as="h3"
            className={styles.subheading}
            phrases={["広告"]}
          />
          <p className={styles.text}>
            本サイトでは、第三者配信の広告サービス（Google
            AdSense）を利用することがあります。
          </p>
          <p className={styles.text}>
            Googleなどの第三者配信事業者は、Cookieを使用して、ユーザーが本サイトや他のウェブサイトに過去にアクセスした際の情報に基づいて広告を配信することがあります。また、第三者配信事業者がCookieの設置・読み取りを行ったり、ウェブビーコンやIPアドレスを収集する場合があります。
          </p>
          <p className={styles.text}>
            パーソナライズ広告を希望されない場合は、
            <a
              href="https://www.google.com/settings/ads"
              target="_blank"
              rel="noopener noreferrer"
            >
              Googleの広告設定
            </a>
            から無効にすることができます。また、
            <a
              href="https://www.aboutads.info"
              target="_blank"
              rel="noopener noreferrer"
            >
              aboutads.info
            </a>
            のオプトアウトページからも第三者配信事業者のCookieを無効にすることができます。
          </p>
          <p className={styles.text}>
            Googleのサービス利用に伴うデータ収集・共有・利用については、
            <a
              href="https://policies.google.com/technologies/partner-sites"
              target="_blank"
              rel="noopener noreferrer"
            >
              Googleのサービスを使用するサイトやアプリから収集した情報のGoogleによる使用
            </a>
            をご確認ください。
          </p>
        </div>
      </Section>

      <Section>
        <PhrasedText
          as="h2"
          className={styles.heading}
          phrases={["情報の", "管理と", "安全管理措置"]}
        />
        <div className={styles.body}>
          <ul className={styles.list}>
            <li>本サイトはHTTPS通信による暗号化を行っています。</li>
            <li>
              サーバー側で個人情報を直接保持していません。アクセス解析データはGoogle
              Analyticsのサーバーに保存されます。
            </li>
            <li>
              ゲームの進捗データ等はブラウザのLocalStorageに保存され、サーバーには送信されません。
            </li>
          </ul>
        </div>
      </Section>

      <Section>
        <PhrasedText
          as="h2"
          className={styles.heading}
          phrases={["個人情報の", "開示・", "訂正・", "削除"]}
        />
        <div className={styles.body}>
          <p className={styles.text}>
            ご自身の個人情報の開示・訂正・削除を希望される場合は、下記のお問い合わせ窓口よりご連絡ください。合理的な範囲で速やかに対応いたします。
          </p>
        </div>
      </Section>

      <Section>
        <PhrasedText
          as="h2"
          className={styles.heading}
          phrases={["プライバシー", "ポリシーの", "変更"]}
        />
        <div className={styles.body}>
          <p className={styles.text}>
            本ポリシーの内容は、必要に応じて変更することがあります。変更後のプライバシーポリシーは、本ページに掲載した時点で効力を生じるものとします。
          </p>
        </div>
      </Section>

      <Section>
        <PhrasedText
          as="h2"
          className={styles.heading}
          phrases={["お問い", "合わせ"]}
        />
        <div className={styles.body}>
          <p className={styles.text}>
            本ポリシーに関するお問い合わせは、
            <a
              href="https://github.com/macrat/yolo-web/issues"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHubリポジトリのIssues
            </a>
            よりお願いいたします。
          </p>
          <p className={styles.enacted}>制定日: 2026年3月7日</p>
        </div>
      </Section>
    </>
  );
}
