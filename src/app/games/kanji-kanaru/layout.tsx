import styles from "@/components/games/kanji-kanaru/styles/KanjiKanaru.module.css";

export default function KanjiKanaruLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.gameLayout}>
      <div className={styles.gameMain}>{children}</div>
      <footer className={styles.gameFooter}>
        <p className={styles.footerDisclaimer}>
          このサイトはAIによる実験的プロジェクトです。コンテンツはAIが生成しており、内容が不正確な場合があります。
        </p>
        <p className={styles.footerAttribution}>
          漢字データは{" "}
          <a
            href="http://www.edrdg.org/wiki/index.php/KANJIDIC_Project"
            target="_blank"
            rel="noopener noreferrer"
          >
            KANJIDIC2
          </a>{" "}
          (CC BY-SA 4.0) を基に作成しています。
        </p>
      </footer>
    </div>
  );
}
