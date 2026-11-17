import styles from "./ColorPair.module.css";

interface Props {
  /** お題の色（CSS の色の値） */
  target: string;
  /** 来訪者が作っている色、または決めた色（CSS の色の値） */
  made: string;
}

/**
 * お題の色と、来訪者が作る色の見本を、同じ大きさで横に並べる。2つの色を見比べることがこのゲームの中身なので、
 * 隣り合わせにして目を動かさずに比べられるようにする。見本は色だけを見せ、名前は上の字と読み上げで言う（DESIGN.md §2）。
 */
export default function ColorPair({ target, made }: Props) {
  return (
    <div className={styles.pair}>
      <div className={styles.item}>
        <span className={styles.label} aria-hidden="true">
          お題
        </span>
        <div
          className={styles.swatch}
          style={{ backgroundColor: target }}
          role="img"
          aria-label="お題の色"
        />
      </div>
      <div className={styles.item}>
        <span className={styles.label} aria-hidden="true">
          あなたの色
        </span>
        <div
          className={styles.swatch}
          style={{ backgroundColor: made }}
          role="img"
          aria-label="あなたの色"
        />
      </div>
    </div>
  );
}
