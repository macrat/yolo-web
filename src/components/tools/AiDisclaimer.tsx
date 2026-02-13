import styles from "./AiDisclaimer.module.css";

export default function AiDisclaimer() {
  return (
    <aside className={styles.disclaimer} role="note" aria-label="AI disclaimer">
      <p>
        このツールはAIによる実験的プロジェクトの一部です。結果が不正確な場合があります。
      </p>
    </aside>
  );
}
