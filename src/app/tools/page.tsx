import type { Metadata } from "next";
import { allToolMetas } from "@/tools/registry";
import ToolsGrid from "@/components/tools/ToolsGrid";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "無料オンラインツール一覧 | yolos.net Tools",
  description:
    "文字数カウント、日付計算、パスワード生成などの便利ツールから、JSON整形・正規表現テストなどの開発者向けツールまで、32個を無料で提供。登録不要でブラウザ上ですぐに使えます。",
  keywords: [
    "オンラインツール",
    "無料ツール",
    "便利ツール",
    "開発者ツール",
    "文字数カウント",
    "日付計算",
  ],
};

export default function ToolsPage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>無料オンラインツール</h1>
        <p className={styles.description}>
          仕事や日常に役立つ便利ツールを集めました。文字数カウント・日付計算から、JSON整形・正規表現テストまで、すべて無料・登録不要でブラウザ上ですぐにお使いいただけます。
        </p>
      </header>
      <ToolsGrid tools={allToolMetas} />
    </div>
  );
}
