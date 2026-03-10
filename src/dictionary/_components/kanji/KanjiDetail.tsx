import Link from "next/link";
import type { KanjiEntry } from "@/dictionary/_lib/types";
import { KANJI_CATEGORY_LABELS } from "@/dictionary/_lib/types";
import { getKanjiByCategory } from "@/dictionary/_lib/kanji";
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
          <h1>
            {"\u6F22\u5B57\u300C"}
            {kanji.character}
            {"\u300D"}
          </h1>
          {kanji.onYomi.length > 0 && (
            <p className={styles.readings}>
              <span className={styles.readingLabel}>
                {"\u97F3\u8AAD\u307F: "}
              </span>
              {kanji.onYomi.join("\u30FB")}
            </p>
          )}
          {kanji.kunYomi.length > 0 && (
            <p className={styles.readings}>
              <span className={styles.readingLabel}>
                {"\u8A13\u8AAD\u307F: "}
              </span>
              {kanji.kunYomi.join("\u30FB")}
            </p>
          )}
          <p className={styles.meanings}>{kanji.meanings.join(", ")}</p>
        </div>
      </div>

      <section className={styles.section}>
        <h2>{"\u57FA\u672C\u60C5\u5831"}</h2>
        <div className={styles.infoGrid}>
          <span className={styles.infoLabel}>{"\u90E8\u9996"}</span>
          <span>{kanji.radical}</span>
          <span className={styles.infoLabel}>{"\u90E8\u9996\u756A\u53F7"}</span>
          <span>{kanji.radicalGroup}</span>
          <span className={styles.infoLabel}>{"\u753B\u6570"}</span>
          <span>
            {kanji.strokeCount}
            {"\u753B"}
          </span>
          <span className={styles.infoLabel}>{"\u5B66\u5E74"}</span>
          <span>
            {kanji.grade <= 6
              ? `${kanji.grade}\u5E74\u751F`
              : "\u4E2D\u5B66\u4EE5\u964D"}
          </span>
          <span className={styles.infoLabel}>{"\u30AB\u30C6\u30B4\u30EA"}</span>
          <span>
            <Link href={`/dictionary/kanji/category/${kanji.category}`}>
              {categoryLabel}
            </Link>
          </span>
        </div>
      </section>

      {kanji.examples.length > 0 && (
        <section className={styles.section}>
          <h2>{"\u4F7F\u7528\u4F8B"}</h2>
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
          <h2>
            {"\u540C\u3058\u30AB\u30C6\u30B4\u30EA\u306E\u6F22\u5B57\uFF08"}
            {categoryLabel}
            {"\uFF09"}
          </h2>
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
        <h2>{"\u95A2\u9023\u30B2\u30FC\u30E0"}</h2>
        <Link href="/games/kanji-kanaru" className={styles.crossLink}>
          {
            "\u6F22\u5B57\u30AB\u30CA\u30FC\u30EB - \u6BCE\u65E5\u306E\u6F22\u5B57\u30D1\u30BA\u30EB\u3067\u904A\u3076"
          }
        </Link>
      </section>
    </article>
  );
}
