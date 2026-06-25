import Link from "next/link";
import { allGameMetas } from "@/play/games/registry";
import type { GameMeta } from "@/play/games/types";
import styles from "@/play/_components/RelatedContentCard.module.css";

interface RelatedGamesProps {
  currentSlug: string;
  relatedSlugs: string[] | undefined;
}

/**
 * 関連ゲームカード（(new) デザイン体系版・cycle-268 フォーク）。
 *
 * legacy `../RelatedGames` との差分は **registry の絵文字アイコン
 * （game.icon = 📚🎯🧩🎨）を描画しないこと**（DESIGN.md §3「絵文字は UI 装飾・
 * ナビには使わない」準拠・MUST-1）。ゲーム名テキストで十分に識別できる。
 *
 * 共有 CSS `RelatedContentCard.module.css` は既に (new) トークンで移行済みクイズ面
 * （RelatedQuizzes 等）と共有中のためフォークせずそのまま参照する（MUST-2）。
 * 旧版が出していた `.icon` 関連 CSS は span を出さないだけで CSS には触れない。
 * registry の icon フィールドは他面（PlayCard 等）が使うため変更しない。
 */
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
            <Link href={`/play/${game.slug}`} className={styles.link}>
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
