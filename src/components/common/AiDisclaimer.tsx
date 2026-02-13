import styles from "./AiDisclaimer.module.css";

export default function AiDisclaimer() {
  return (
    <aside
      className={styles.disclaimer}
      role="note"
      aria-label="AI disclaimer"
    >
      <p>
        このコンテンツはAIによる実験的プロジェクトの一部です。内容が壊れていたり不正確な場合があります。
      </p>
    </aside>
  );
}
