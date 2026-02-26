import styles from "./ColorTarget.module.css";

interface Props {
  hex: string;
}

/**
 * Displays the target color as a large patch.
 */
export default function ColorTarget({ hex }: Props) {
  return (
    <div className={styles.targetArea}>
      <div className={styles.label}>
        {"\u3053\u306E\u8272\u3092\u4F5C\u308D\u3046!"}
      </div>
      <div
        className={styles.colorPatch}
        style={{ backgroundColor: hex }}
        role="img"
        aria-label={"\u30BF\u30FC\u30B2\u30C3\u30C8\u30AB\u30E9\u30FC"}
      />
    </div>
  );
}
