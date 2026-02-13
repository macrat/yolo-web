import type { Metadata } from "next";
import { allToolMetas } from "@/tools/registry";
import ToolsGrid from "@/components/tools/ToolsGrid";
import AiDisclaimer from "@/components/tools/AiDisclaimer";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "無料オンラインツール一覧 | Yolo-Web Tools",
  description:
    "文字数カウント、JSON整形、Base64エンコード、パスワード生成など、開発者やライター向けの無料オンラインツール集。登録不要でブラウザ上ですぐに使えます。",
  keywords: [
    "オンラインツール",
    "開発者ツール",
    "テキストツール",
    "無料ツール",
    "Web開発",
  ],
};

export default function ToolsPage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>無料オンラインツール</h1>
        <p className={styles.description}>
          開発者やライター向けの便利なオンラインツール集です。すべて無料・登録不要でブラウザ上ですぐにお使いいただけます。
        </p>
      </header>
      <ToolsGrid tools={allToolMetas} />
      <AiDisclaimer />
    </div>
  );
}
