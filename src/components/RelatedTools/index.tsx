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
 * RelatedTools — 関連ツール一覧コンポーネント。
 *
 * 仕様:
 * - allToolMetas から relatedSlugs に一致するツールをフィルタし、1行1項目のリストとして並べる（§7）
 * - currentSlug のツールは一覧から除外される
 * - 件数 0 の場合は null を返す（何もレンダリングしない）
 * - 各行にはツール名と shortDescription（一行説明）を表示する。似たツールで迷わないよう、
 *   遷移先が何かを一行説明で判断できるようにする
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
      <ul className={styles.list} data-text-box="rows">
        {relatedTools.map((tool) => (
          <li key={tool.slug} className={styles.row}>
            <Link
              href={`/tools/${tool.slug}`}
              className={styles.link}
              data-hit-area="after"
            >
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
