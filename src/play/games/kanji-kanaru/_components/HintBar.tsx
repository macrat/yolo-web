import styles from "./styles/KanjiKanaru.module.css";

interface HintBarProps {
  /** 答えの漢字のヒント。読み込むまでは null。 */
  hints: {
    strokeCount: number;
    onYomiCount: number;
    kunYomiCount: number;
  } | null;
}

/**
 * 遊び始める前から分かる、答えの漢字のヒント（画数・音読みの数・訓読みの数）。読み込むまでは値を空にし、
 * 読み込んだあとと同じ幅と行を取る。
 */
export default function HintBar({ hints }: HintBarProps) {
  const items = [
    { label: "画数", value: hints?.strokeCount },
    { label: "音読み数", value: hints?.onYomiCount },
    { label: "訓読み数", value: hints?.kunYomiCount },
  ];
  return (
    <p className={styles.hintBar} role="status">
      <span className={styles.hintLabel}>ヒント</span>
      {items.map(({ label, value }) => (
        <span key={label}>
          {label}
          <span className={styles.hintValue}>{value ?? ""}</span>
        </span>
      ))}
    </p>
  );
}
