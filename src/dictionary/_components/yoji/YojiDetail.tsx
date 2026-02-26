import Link from "next/link";
import type { YojiEntry } from "@/dictionary/_lib/types";
import {
  YOJI_CATEGORY_LABELS,
  YOJI_DIFFICULTY_LABELS,
} from "@/dictionary/_lib/types";
import { getYojiByCategory } from "@/dictionary/_lib/yoji";
import { getAllKanjiChars } from "@/dictionary/_lib/kanji";
import styles from "./YojiDetail.module.css";

interface YojiDetailProps {
  yoji: YojiEntry;
}

export default function YojiDetail({ yoji }: YojiDetailProps) {
  const relatedYoji = getYojiByCategory(yoji.category).filter(
    (y) => y.yoji !== yoji.yoji,
  );
  const categoryLabel = YOJI_CATEGORY_LABELS[yoji.category];
  const difficultyLabel = YOJI_DIFFICULTY_LABELS[yoji.difficulty];

  // Cross-link: find kanji characters from this yoji that exist in kanji-data
  const allKanjiChars = new Set(getAllKanjiChars());
  const yojiChars = Array.from(yoji.yoji);
  const linkedKanji = yojiChars.filter((ch) => allKanjiChars.has(ch));
  // De-duplicate (e.g., if same kanji appears twice in one yoji)
  const uniqueLinkedKanji = Array.from(new Set(linkedKanji));

  return (
    <article className={styles.detail} data-testid="yoji-detail">
      <div className={styles.header}>
        <span className={styles.character}>{yoji.yoji}</span>
        <p className={styles.reading}>{yoji.reading}</p>
        <p className={styles.meaning}>{yoji.meaning}</p>
        <div className={styles.badges}>
          <Link
            href={`/dictionary/yoji/category/${yoji.category}`}
            className={styles.badge}
          >
            {categoryLabel}
          </Link>
          <span className={styles.badge}>{difficultyLabel}</span>
        </div>
      </div>

      {yojiChars.length > 0 && (
        <section className={styles.section}>
          <h2>構成漢字</h2>
          <div className={styles.kanjiLinks}>
            {yojiChars.map((ch, i) =>
              uniqueLinkedKanji.includes(ch) ? (
                <Link
                  key={`${ch}-${i}`}
                  href={`/dictionary/kanji/${encodeURIComponent(ch)}`}
                  className={styles.kanjiLink}
                  title={`漢字「${ch}」の詳細を見る`}
                >
                  {ch}
                </Link>
              ) : (
                <span key={`${ch}-${i}`} className={styles.kanjiChar}>
                  {ch}
                </span>
              ),
            )}
          </div>
        </section>
      )}

      {relatedYoji.length > 0 && (
        <section className={styles.section}>
          <h2>同じカテゴリの四字熟語（{categoryLabel}）</h2>
          <div className={styles.relatedList}>
            {relatedYoji.map((y) => (
              <Link
                key={y.yoji}
                href={`/dictionary/yoji/${encodeURIComponent(y.yoji)}`}
                className={styles.relatedLink}
              >
                {y.yoji}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className={styles.section}>
        <h2>関連ゲーム</h2>
        <Link href="/games/yoji-kimeru" className={styles.crossLink}>
          四字キメル - 毎日の四字熟語パズルで遊ぶ
        </Link>
      </section>
    </article>
  );
}
