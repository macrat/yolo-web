"use client";

import Link from "next/link";
import styles from "./CrossCategoryBanner.module.css";

/**
 * ゲーム完了モーダル内で他カテゴリへの導線として表示する1件分のデータ。
 * Server Component（各ゲームのpage.tsx）で事前計算してprops経由で渡す。
 */
export interface CrossCategoryItem {
  slug: string;
  title: string;
  /** コンテンツが持つアイコンの字。一覧の行には出さない（§5 絵文字を置かない）。 */
  icon: string;
  contentPath: string;
  /** resolveDisplayCategory() の結果（「診断」「クイズ」「運勢」等） */
  categoryLabel: string;
  /** コンテンツの分類の識別子（PlayContentMeta の category）。 */
  category: string;
}

interface CrossCategoryBannerProps {
  items: CrossCategoryItem[];
}

/**
 * ゲーム完了後のResultModal内で、他カテゴリ（診断・占い）への導線を1行1項目の一覧で出す（§7）。
 * 行は名前と種別を持ち、下線は名前に付く。押せる範囲は行全体。
 */
export function CrossCategoryBanner({ items }: CrossCategoryBannerProps) {
  if (items.length === 0) return null;

  return (
    <div className={styles.crossCategory}>
      <p className={styles.label}>他のコンテンツも試してみよう</p>
      <ul className={styles.linkList} data-text-box="rows">
        {items.map((item) => (
          <li key={item.slug} className={styles.row}>
            <Link
              href={item.contentPath}
              className={styles.link}
              data-hit-area="after"
            >
              <span className={styles.title}>{item.title}</span>
            </Link>
            <span className={styles.kind}>{item.categoryLabel}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
