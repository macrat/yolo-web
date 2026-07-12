import Link from "next/link";
import { allToolMetas } from "@/tools/registry";
import type { ToolMeta } from "@/tools/types";
import styles from "./RelatedTools.module.css";

interface RelatedToolsProps {
  /** 現在表示中のツールのスラッグ（このツールは一覧から除外される） */
  currentSlug: string;
  /** 表示する関連ツールのスラッグ配列 */
  relatedSlugs: string[];
}

/**
 * RelatedTools — 関連ツール一覧コンポーネント（DESIGN.md フェーズ R・店構えへ変換）。
 *
 * 仕様:
 * - props は旧 `src/tools/_components/RelatedTools` と互換（currentSlug / relatedSlugs）
 * - allToolMetas から relatedSlugs に一致するツールをフィルタし、品書き（罫区切りのリスト）
 *   として並べる（PlayRecommendBlock と同型・§4「一覧の既定は品書き」）
 * - currentSlug のツールは一覧から除外される
 * - 件数 0 の場合は null を返す（何もレンダリングしない）
 * - 各行にはツール名と shortDescription（一行説明）を表示する
 *   → ターゲット1の「似たツールで迷う」を防ぐため、遷移先が何かを一行説明で判断できる導線を維持する（M-3）
 *
 * デザイン:
 * - 新デザイントークンのみ使用（--ink / --ink-2 / --rule / --accent 等）
 * - 旧トークン（--fg / --bg / --border / --r-* 等）は使用しない
 * - DESIGN.md §4: 区切りは罫（--rule）。カードのグリッド・角丸装飾は使わない
 * - DESIGN.md §2: フォーカスは outline: 2px solid var(--accent); outline-offset: 2px
 */
export default function RelatedTools({
  currentSlug,
  relatedSlugs,
}: RelatedToolsProps) {
  const relatedTools: ToolMeta[] = allToolMetas.filter(
    (meta) => meta.slug !== currentSlug && relatedSlugs.includes(meta.slug),
  );

  if (relatedTools.length === 0) return null;

  return (
    <nav className={styles.related} aria-label="関連ツール">
      <h2 className={styles.heading}>関連ツール</h2>
      <ul className={styles.list}>
        {relatedTools.map((tool) => (
          <li key={tool.slug} className={styles.row}>
            <Link href={`/tools/${tool.slug}`} className={styles.link}>
              <span className={styles.name}>{tool.name}</span>
              <span className={styles.description}>
                {tool.shortDescription}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
