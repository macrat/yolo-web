import type { PlayContentMeta } from "@/play/types";
import { DAILY_UPDATE_SLUGS } from "@/play/registry";
import PlayCard from "./PlayCard";
import styles from "./PlayGrid.module.css";

interface PlayGridProps {
  contents: PlayContentMeta[];
  /** NEW ラベルを表示するコンテンツのスラッグ集合 */
  newSlugs: ReadonlySet<string>;
}

/**
 * /play 一覧のグリッドレイアウト。
 * PlayCard を並べ、NEW バッジ・毎日更新バッジの判定を一元管理する。
 */
export default function PlayGrid({ contents, newSlugs }: PlayGridProps) {
  return (
    <div className={styles.grid} role="list" aria-label="遊びコンテンツ一覧">
      {contents.map((content) => (
        <div key={content.slug} role="listitem">
          <PlayCard
            content={content}
            isNew={newSlugs.has(content.slug)}
            isDaily={DAILY_UPDATE_SLUGS.has(content.slug)}
          />
        </div>
      ))}
    </div>
  );
}
