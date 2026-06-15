import Link from "next/link";
import type {
  YojiEntry,
  YojiOrigin,
  YojiStructure,
} from "@/dictionary/_lib/types";
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

/** origin (3値) を来訪者向けの説明的な日本語に変換する。
 * 「不明」は隠さず誠実に示す（憲法 Rule 2 / N-3）。*/
const ORIGIN_LABELS: Record<YojiOrigin, string> = {
  中国: "中国伝来",
  日本: "日本由来",
  不明: "不明（出典資料でも特定されていない）",
};

/** structure (3値) を説明的なラベルに変換する。値は型で 3 種類に固定。*/
const STRUCTURE_LABELS: Record<YojiStructure, string> = {
  対句: "対句構造",
  組合せ: "組合せ構造",
  因果: "因果関係",
};

/** 出典 URL のホスト名 → 表示名の辞書。
 * 後続の他コンポーネントから再利用する予定はないため component ローカルに置く。
 * 不一致のホストは fallback としてホスト名をそのまま表示する。*/
const SOURCE_HOST_LABELS: Record<string, string> = {
  "kotobank.jp": "コトバンク",
  "yoji.jitenon.jp": "四字熟語辞典オンライン",
  "idiom-encyclopedia.com": "四字熟語の百科事典",
  "www.weblio.jp": "Weblio辞書",
  "yoji-jukugo.com": "四字熟語辞典",
  "imidas.jp": "imidas",
  "ja.wiktionary.org": "Wiktionary",
  "10mtv.jp": "テンミニッツTV",
};

/** sourceUrl から表示用の出典名を得る。
 * URL のパースに失敗した場合は元の URL 文字列を表示する（壊さない方針）。*/
function getSourceLabel(sourceUrl: string): string {
  try {
    const host = new URL(sourceUrl).hostname;
    return SOURCE_HOST_LABELS[host] ?? host;
  } catch {
    return sourceUrl;
  }
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

      <section className={styles.section}>
        <h2>成立と出典</h2>
        <dl className={styles.metaList}>
          <div className={styles.metaItem}>
            <dt className={styles.metaTerm}>成立地</dt>
            <dd className={styles.metaDesc}>{ORIGIN_LABELS[yoji.origin]}</dd>
          </div>
          <div className={styles.metaItem}>
            <dt className={styles.metaTerm}>構成</dt>
            <dd className={styles.metaDesc}>
              {STRUCTURE_LABELS[yoji.structure]}
            </dd>
          </div>
          {yoji.sourceUrl && (
            <div className={styles.metaItem}>
              <dt className={styles.metaTerm}>出典</dt>
              <dd className={styles.metaDesc}>
                <a
                  href={yoji.sourceUrl}
                  className={styles.externalLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${getSourceLabel(yoji.sourceUrl)}（外部サイト・新しいタブで開く）`}
                >
                  {getSourceLabel(yoji.sourceUrl)}
                  {/* DESIGN.md §3: テキストより小さめの外部リンク記号 (Footer と統一) */}
                  <span className={styles.externalIcon} aria-hidden="true">
                    ↗
                  </span>
                </a>
              </dd>
            </div>
          )}
        </dl>
      </section>

      {/* フッターにAI運営の旨が記載されているため、セクション単位の注記は不要 */}
      {yoji.example && (
        <section className={styles.section}>
          <h2>AIによる使用例</h2>
          <p className={styles.exampleQuote}>{yoji.example}</p>
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
        <Link href="/play/yoji-kimeru" className={styles.crossLink}>
          四字キメル - 毎日の四字熟語パズルで遊ぶ
        </Link>
      </section>
    </article>
  );
}
