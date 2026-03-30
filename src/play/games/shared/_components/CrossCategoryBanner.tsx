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
  icon: string;
  contentPath: string;
  /** resolveDisplayCategory() の結果（「診断」「クイズ」「運勢」等） */
  categoryLabel: string;
  /**
   * data-category 属性に設定するカテゴリ文字列。
   * CSSのセレクタ（.badge[data-category="fortune"]等）でバッジの色付けに使用する。
   */
  category: string;
}

interface CrossCategoryBannerProps {
  items: CrossCategoryItem[];
}

/**
 * ゲーム完了後のResultModal内で、他カテゴリ（診断・占い）への導線を表示するバナー。
 * registryやseoへのimportを持たず、クライアントバンドルを肥大化させない。
 * データはServer Component（各ゲームのpage.tsx）で事前計算してprops経由で受け取る。
 */
export function CrossCategoryBanner({ items }: CrossCategoryBannerProps) {
  if (items.length === 0) return null;

  return (
    <div className={styles.crossCategory}>
      <p className={styles.label}>他のコンテンツも試してみよう</p>
      <div className={styles.linkList}>
        {items.map((item) => (
          <Link key={item.slug} href={item.contentPath} className={styles.link}>
            <span className={styles.icon} aria-hidden="true">
              {item.icon}
            </span>
            <span className={styles.title}>{item.title}</span>
            <span className={styles.badge} data-category={item.category}>
              {item.categoryLabel}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
