import type { Metadata } from "next";
import { allCheatsheetMetas } from "@/cheatsheets/registry";
import { SITE_NAME, BASE_URL } from "@/lib/constants";
import CheatsheetGrid from "@/cheatsheets/_components/CheatsheetGrid";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "チートシート一覧 | yolos.net",
  description:
    "正規表現・Git・Markdownなど、開発者向けチートシート集。基本構文から実例まで、すぐに使えるリファレンスを無料で提供。",
  keywords: [
    "チートシート",
    "正規表現",
    "Git",
    "Markdown",
    "開発者向け",
    "リファレンス",
  ],
  openGraph: {
    title: "チートシート一覧 | yolos.net",
    description:
      "正規表現・Git・Markdownなど、開発者向けチートシート集。基本構文から実例まで、すぐに使えるリファレンスを無料で提供。",
    type: "website",
    url: `${BASE_URL}/cheatsheets`,
    siteName: SITE_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: "チートシート一覧 | yolos.net",
    description:
      "正規表現・Git・Markdownなど、開発者向けチートシート集。基本構文から実例まで、すぐに使えるリファレンスを無料で提供。",
  },
  alternates: {
    canonical: `${BASE_URL}/cheatsheets`,
  },
};

export default function CheatsheetsPage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>チートシート</h1>
        <p className={styles.description}>
          開発者向けのチートシート・リファレンス集です。基本構文から実例まで、すぐに使える情報をまとめています。
        </p>
      </header>
      <CheatsheetGrid cheatsheets={allCheatsheetMetas} />
    </div>
  );
}
