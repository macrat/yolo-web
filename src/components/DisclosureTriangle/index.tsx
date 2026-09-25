import styles from "./DisclosureTriangle.module.css";

/**
 * アコーディオンの三角（DESIGN.md §6）。太い線で描き、閉じているあいだは右を、開いているあいだは下を向く。
 *
 * 向きは開閉するコントロールが支援技術に伝えている状態から決める。`<details>` の `<summary>` に置けば
 * `details[open]` に、`<details>` の外で開閉するボタンに置けば、そのボタンの `aria-expanded` に従う。
 * 開閉するコントロールの直下に置く。三角は字の1行目の中央に並ぶので、そのコントロールは
 * `align-items: flex-start` の並びにする。
 */
export default function DisclosureTriangle() {
  return (
    <svg
      className={styles.triangle}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M1.5 3.5 11.5 10 1.5 16.5Z" />
    </svg>
  );
}
