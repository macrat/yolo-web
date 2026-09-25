import Link from "next/link";
import styles from "./FrameLink.module.css";

interface FrameLinkProps {
  href: string;
  label: string;
  /** いま開いているページを指すなら true（§6 の現在地）。 */
  current: boolean;
  className?: string;
}

/**
 * 上端・下端に並べるリンク（DESIGN.md §5 レイアウト・§6）。上端と下端で押せる範囲・hover・フォーカス・
 * 現在地の見え方を1つにする。
 *
 * 字は data-label にも持たせ、CSS がその字の太字の幅を先に取る（FrameLink.module.css の .label）。
 */
export default function FrameLink({
  href,
  label,
  current,
  className,
}: FrameLinkProps) {
  return (
    <Link
      href={href}
      className={className ? `${styles.link} ${className}` : styles.link}
      aria-current={current ? "page" : undefined}
      data-hit-area="after"
    >
      <span className={styles.label} data-label={label}>
        {label}
      </span>
    </Link>
  );
}
