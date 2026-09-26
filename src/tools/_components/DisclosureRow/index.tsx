import { useId, type ReactNode } from "react";
import DisclosureTriangle from "@/components/DisclosureTriangle";
import styles from "./DisclosureRow.module.css";

interface DisclosureRowProps {
  /** 行の名前（語）。読み上げの名前はこれだけになる。 */
  name: ReactNode;
  /** 名前に続けて見せる字（読み・意味・敬語の形など）。読み上げでは行の説明になる。 */
  description: ReactNode;
  open: boolean;
  onToggle: () => void;
  /** 開いたときに出る中身。 */
  children: ReactNode;
  /** 名前と説明を包む並びのクラス。並べ方は道具が決める。 */
  headClassName?: string;
  nameClassName?: string;
  descriptionClassName?: string;
}

/**
 * 道具の結果の、開閉する行（DESIGN.md §6 のアコーディオン・§8）。行の全体が開閉のボタンで、太い線の三角が
 * 開閉の向きを示す。
 *
 * 見える字は語と読み・意味などを並べるが、読み上げの名前は語だけにし、ほかは説明として読ませる。名前と説明を
 * aria-labelledby・aria-describedby で指すので、開閉は `<summary>` ではなく `button[aria-expanded]` で組む。
 * `<summary>` にはそれに当たる ARIA の役割が無く、ブラウザによってはそれらの属性を名前と説明に使わないため。
 * 縁の見えないコントロールなので、三角を並びの左端に揃え、その左右 8px を押せる範囲に含める
 * （data-text-box="inline"）。
 */
export default function DisclosureRow({
  name,
  description,
  open,
  onToggle,
  children,
  headClassName,
  nameClassName,
  descriptionClassName,
}: DisclosureRowProps) {
  const id = useId();
  const nameId = `${id}-name`;
  const descriptionId = `${id}-description`;
  const panelId = `${id}-panel`;
  return (
    <>
      <button
        type="button"
        className={styles.toggle}
        data-text-box="inline"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-labelledby={nameId}
        aria-describedby={descriptionId}
        onClick={onToggle}
      >
        <DisclosureTriangle />
        <span
          className={[styles.head, headClassName].filter(Boolean).join(" ")}
        >
          <span id={nameId} className={nameClassName}>
            {name}
          </span>
          <span id={descriptionId} className={descriptionClassName}>
            {description}
          </span>
        </span>
      </button>
      {open ? <div id={panelId}>{children}</div> : null}
    </>
  );
}
