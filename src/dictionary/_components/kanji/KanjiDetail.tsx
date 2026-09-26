import Link from "next/link";
import type { KanjiEntry } from "@/dictionary/_lib/types";
import { KANJI_GRADE_LABELS } from "@/dictionary/_lib/types";
import { getKanjiByRadical } from "@/dictionary/_lib/kanji";
import LinkIndex, { type LinkIndexGroup } from "@/components/LinkIndex";
import { headingFontAttr } from "@/lib/zen-antique-charset";
import styles from "./KanjiDetail.module.css";

interface KanjiDetailProps {
  kanji: KanjiEntry;
}

const RELATED_HEADING_ID = "same-radical-kanji";

/** 同じ部首の漢字を画数の順に区切る。画数は字に見えないので、区切りの見出しで見せる（§7）。 */
function groupByStrokeCount(kanjiList: KanjiEntry[]): LinkIndexGroup[] {
  const groups = new Map<number, KanjiEntry[]>();
  for (const k of kanjiList) {
    groups.set(k.strokeCount, [...(groups.get(k.strokeCount) ?? []), k]);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => a - b)
    .map(([strokeCount, members]) => {
      const heading = `${strokeCount}\u753B`;
      return {
        heading,
        headingFont: headingFontAttr(heading),
        items: members.map((k) => ({
          label: k.character,
          href: `/dictionary/kanji/${encodeURIComponent(k.character)}`,
        })),
      };
    });
}

export default function KanjiDetail({ kanji }: KanjiDetailProps) {
  const relatedKanji = getKanjiByRadical(kanji.radical).filter(
    (k) => k.character !== kanji.character,
  );
  const title = `\u6F22\u5B57\u300C${kanji.character}\u300D`;
  const relatedHeading = `\u540C\u3058\u90E8\u9996\u306E\u6F22\u5B57\uFF08${relatedKanji.length}\u5B57\uFF09`;

  return (
    <article className={styles.detail} data-testid="kanji-detail">
      <div className={styles.header}>
        {/* 直後の h1 が同じ字を言うので、読み上げでは二度読ませない。 */}
        <span
          className={styles.character}
          aria-hidden="true"
          {...headingFontAttr(kanji.character)}
        >
          {kanji.character}
        </span>
        <div className={styles.headerInfo}>
          <h1 {...headingFontAttr(title)}>{title}</h1>
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
        {/* 罫で区切った定義リスト（ラベルと値）。数値は本文の書体で組む。 */}
        <dl className={styles.infoList}>
          <div className={styles.infoRow}>
            <dt className={styles.infoTerm}>{"\u90E8\u9996"}</dt>
            <dd className={styles.infoDesc}>
              <Link
                href={`/dictionary/kanji/radical/${encodeURIComponent(kanji.radical)}`}
              >
                {kanji.radical}
              </Link>
            </dd>
          </div>
          <div className={styles.infoRow}>
            <dt className={styles.infoTerm}>{"\u90E8\u9996\u756A\u53F7"}</dt>
            <dd className={styles.infoDesc}>
              <span className={styles.number}>{kanji.radicalGroup}</span>
            </dd>
          </div>
          <div className={styles.infoRow}>
            <dt className={styles.infoTerm}>{"\u753B\u6570"}</dt>
            <dd className={styles.infoDesc}>
              <Link href={`/dictionary/kanji/stroke/${kanji.strokeCount}`}>
                <span className={styles.number}>{kanji.strokeCount}</span>
                {"\u753B"}
              </Link>
            </dd>
          </div>
          <div className={styles.infoRow}>
            <dt className={styles.infoTerm}>{"\u5B66\u5E74"}</dt>
            <dd className={styles.infoDesc}>
              <Link href={`/dictionary/kanji/grade/${kanji.grade}`}>
                {KANJI_GRADE_LABELS[kanji.grade] ??
                  (kanji.grade <= 6
                    ? `${kanji.grade}\u5E74\u751F`
                    : "\u4E2D\u5B66\u4EE5\u964D")}
              </Link>
            </dd>
          </div>
        </dl>
      </section>

      {kanji.examples.length > 0 && (
        <section className={styles.section}>
          <h2>{"\u4F7F\u7528\u4F8B"}</h2>
          {/* 使用例は熟語の列挙。カード/ピルではなく読点で組んだ自然な一文で見せる。 */}
          <p className={styles.examples}>{kanji.examples.join("\u3001")}</p>
        </section>
      )}

      {relatedKanji.length > 0 && (
        <section
          className={styles.section}
          aria-labelledby={RELATED_HEADING_ID}
        >
          <h2 id={RELATED_HEADING_ID} {...headingFontAttr(relatedHeading)}>
            {relatedHeading}
          </h2>
          <LinkIndex
            labelledBy={RELATED_HEADING_ID}
            groups={groupByStrokeCount(relatedKanji)}
            groupHeadingLevel={3}
          />
        </section>
      )}

      <section className={styles.section}>
        <h2>{"\u95A2\u9023\u30B2\u30FC\u30E0"}</h2>
        <Link
          href="/play/kanji-kanaru"
          className={styles.crossLink}
          data-text-box="inline"
        >
          {
            "\u6F22\u5B57\u30AB\u30CA\u30FC\u30EB - \u6BCE\u65E5\u306E\u6F22\u5B57\u30D1\u30BA\u30EB\u3067\u904A\u3076"
          }
        </Link>
      </section>
    </article>
  );
}
