import Link from "next/link";
import styles from "./ColorCard.module.css";

interface ColorCardProps {
  slug: string;
  name: string;
  romaji: string;
  hex: string;
  categoryLabel: string;
}

export default function ColorCard({
  slug,
  name,
  romaji,
  hex,
  categoryLabel,
}: ColorCardProps) {
  return (
    <Link
      href={`/colors/${slug}`}
      className={styles.card}
      data-testid="color-card"
    >
      <span className={styles.swatch} style={{ backgroundColor: hex }} />
      <span className={styles.name}>{name}</span>
      <span className={styles.romaji}>{romaji}</span>
      <span className={styles.hex}>{hex}</span>
      <div className={styles.meta}>
        <span className={styles.badge}>{categoryLabel}</span>
      </div>
    </Link>
  );
}
