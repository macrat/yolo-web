import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={styles.inner}>
        <p className={styles.disclaimer}>
          このサイトはAIによる実験的プロジェクトです。コンテンツはAIが生成しており、内容が不正確な場合があります。
        </p>
        <p className={styles.copyright}>
          &copy; {new Date().getFullYear()} Yolo-Web
        </p>
      </div>
    </footer>
  );
}
