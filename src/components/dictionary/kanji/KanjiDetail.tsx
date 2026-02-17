import Link from "next/link";
import type { KanjiEntry } from "@/lib/dictionary/types";
import { KANJI_CATEGORY_LABELS } from "@/lib/dictionary/types";
import { getKanjiByCategory } from "@/lib/dictionary/kanji";
import styles from "./KanjiDetail.module.css";

interface KanjiDetailProps {
  kanji: KanjiEntry;
}

export default function KanjiDetail({ kanji }: KanjiDetailProps) {
  const relatedKanji = getKanjiByCategory(kanji.category).filter(
    (k) => k.character !== kanji.character,
  );
  const categoryLabel = KANJI_CATEGORY_LABELS[kanji.category];

  return (
    <article className={styles.detail} data-testid="kanji-detail">
      <div className={styles.header}>
        <span className={styles.character}>{kanji.character}</span>
        <div className={styles.headerInfo}>
          <h1>漢字「{kanji.character}」</h1>
          {kanji.onYomi.length > 0 && (
            <p className={styles.readings}>
              <span className={styles.readingLabel}>音読み: </span>
              {kanji.onYomi.join("・")}
            </p>
          )}
          {kanji.kunYomi.length > 0 && (
            <p className={styles.readings}>
              <span className={styles.readingLabel}>訓読み: </span>
              {kanji.kunYomi.join("・")}
            </p>
          )}
          <p className={styles.meanings}>{kanji.meanings.join(", ")}</p>
        </div>
      </div>

      <section className={styles.section}>
        <h2>基本情報</h2>
        <div className={styles.infoGrid}>
          <span className={styles.infoLabel}>部首</span>
          <span>{kanji.radical}</span>
          <span className={styles.infoLabel}>部首番号</span>
          <span>{kanji.radicalGroup}</span>
          <span className={styles.infoLabel}>画数</span>
          <span>{kanji.strokeCount}画</span>
          <span className={styles.infoLabel}>学年</span>
          <span>{kanji.grade}年生</span>
          <span className={styles.infoLabel}>カテゴリ</span>
          <span>
            <Link href={`/dictionary/kanji/category/${kanji.category}`}>
              {categoryLabel}
            </Link>
          </span>
        </div>
      </section>

      {kanji.examples.length > 0 && (
        <section className={styles.section}>
          <h2>使用例</h2>
          <div className={styles.examples}>
            {kanji.examples.map((ex) => (
              <span key={ex} className={styles.exampleTag}>
                {ex}
              </span>
            ))}
          </div>
        </section>
      )}

      {relatedKanji.length > 0 && (
        <section className={styles.section}>
          <h2>同じカテゴリの漢字（{categoryLabel}）</h2>
          <div className={styles.relatedList}>
            {relatedKanji.map((k) => (
              <Link
                key={k.character}
                href={`/dictionary/kanji/${encodeURIComponent(k.character)}`}
                className={styles.relatedLink}
              >
                {k.character}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className={styles.section}>
        <h2>関連ゲーム</h2>
        <Link href="/games/kanji-kanaru" className={styles.crossLink}>
          漢字カナール - 毎日の漢字パズルで遊ぶ
        </Link>
      </section>
    </article>
  );
}
