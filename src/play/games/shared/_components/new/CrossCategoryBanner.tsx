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
 * ゲーム完了後のResultModal内で、他カテゴリ（診断・占い）への導線を表示するバナー
 * （(new) デザイン体系版・cycle-268 フォーク）。
 *
 * legacy `../CrossCategoryBanner` との差分:
 * - バッジのハードコード派手色（紫/桃/青のカテゴリ別装飾色）を撤去し、無彩の
 *   `--bg-soft`/`--fg-soft`/`--border` に統一（DESIGN.md §2「色は機能のみ」）。
 *   カテゴリは categoryLabel テキストで識別できる。
 * - 装飾の絵文字アイコン（item.icon）を撤去（DESIGN.md §3「絵文字は UI 装飾・
 *   ナビには使わない」）。タイトルテキストで十分識別できる。
 * - ラベルの中央寄せを撤去（左寄せ）、角丸を新トークン化、旧 --color-* → 新トークン。
 *
 * CrossCategoryItem.icon フィールド自体は型・props を変えず保持する
 * （legacy 版や呼び出し側が参照するため）。描画しないだけ。
 */
export function CrossCategoryBanner({ items }: CrossCategoryBannerProps) {
  if (items.length === 0) return null;

  return (
    <div className={styles.crossCategory}>
      <p className={styles.label}>他のコンテンツも試してみよう</p>
      <div className={styles.linkList}>
        {items.map((item) => (
          <Link key={item.slug} href={item.contentPath} className={styles.link}>
            <span className={styles.title}>{item.title}</span>
            <span className={styles.badge}>{item.categoryLabel}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
