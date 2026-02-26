import styles from "./DictionaryGrid.module.css";

interface DictionaryGridProps {
  children: React.ReactNode;
  wide?: boolean;
}

export default function DictionaryGrid({
  children,
  wide = false,
}: DictionaryGridProps) {
  return (
    <div
      className={`${styles.grid} ${wide ? styles.gridWide : ""}`}
      role="list"
      aria-label="辞典エントリ一覧"
    >
      {children}
    </div>
  );
}
