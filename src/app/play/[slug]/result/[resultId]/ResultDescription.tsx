/**
 * ⚠️ 重要 — このコードは「受検者本人には表示されない」第三者向け結果ページの一部です。
 *
 * ルート `/play/[slug]/result/[resultId]`（診断の result ページ）は【第三者向けの
 * シェア／検索ランディング専用】。診断を遊んだ本人は、完了時に `/play/[slug]` 上に
 * インライン描画される結果（ResultCard 経由）で見ており、この `/result/<id>` ページへは
 * 遷移しない（この URL はシェア用に生成される）。文言・構造・メタ・OGP は
 * 「診断をやっていない第三者が初めて見る」前提で設計すること。本人向け結果体験は
 * `src/play/quiz/_components/ResultCard.tsx` 側で編集する。
 */

import styles from "./ResultDescription.module.css";

interface Props {
  /** 結果の本文（タイプの説明）。 */
  description: string;
}

/**
 * 結果の本文を出す。
 *
 * 畳まない。DESIGN.md §6「結果を出し惜しみしない——診断・計測の結果は即座に・全部
 * 見せる」に従う。いちばん長い本文でも349字（実測129結果）で、読む幅に収まる分量である。
 */
export default function ResultDescription({ description }: Props) {
  return <p className={styles.description}>{description}</p>;
}
