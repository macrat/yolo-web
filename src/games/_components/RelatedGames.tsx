import Link from "next/link";
import { allGameMetas } from "@/games/registry";
import type { GameMeta } from "@/games/types";
import styles from "./RelatedGames.module.css";

interface RelatedGamesProps {
  currentSlug: string;
  relatedSlugs: string[] | undefined;
}

export default function RelatedGames({
  currentSlug,
  relatedSlugs,
}: RelatedGamesProps) {
  const slugs = relatedSlugs ?? [];
  const relatedGames: GameMeta[] = allGameMetas.filter(
    (meta) => meta.slug !== currentSlug && slugs.includes(meta.slug),
  );

  if (relatedGames.length === 0) return null;

  return (
    <nav className={styles.related} aria-label="関連ゲーム">
      <h2 className={styles.heading}>関連ゲーム</h2>
      <ul className={styles.list}>
        {relatedGames.map((game) => (
          <li key={game.slug}>
            <Link href={`/games/${game.slug}`} className={styles.link}>
              <span className={styles.icon} aria-hidden="true">
                {game.icon}
              </span>
              <span className={styles.name}>{game.title}</span>
              <span className={styles.description}>
                {game.shortDescription}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
