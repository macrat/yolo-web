"use client";

import { useEffect, useRef, useState } from "react";
import styles from "../page.module.css";

interface CategoryNavProps {
  categories: Array<{ category: string; label: string }>;
}

/**
 * カテゴリナビゲーションコンポーネント。
 * IntersectionObserver でカテゴリセクションの表示状態を監視し、
 * 現在ビューポート内に表示されているセクションに対応するタブをアクティブ表示する。
 *
 * 複数セクションが同時にintersectしている場合は、categories配列の順序で
 * 最初のものをアクティブとする（ページの読み進め方向を反映）。
 * どのセクションもintersectしていない場合（ページ最上部）は、
 * どのタブもアクティブにしない。
 */
export default function CategoryNav({ categories }: CategoryNavProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  // ビューポート内にあるセクションIDの Set を useRef で保持する
  // （コールバック内でstateを直接参照するとクロージャの問題が起きるため）
  const intersectingSet = useRef<Set<string>>(new Set());
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const nav = navRef.current;
    // クリーンアップ関数内で .current を直接参照すると、
    // react-hooks/exhaustive-deps の警告対象になるため、ローカル変数に保持する
    const currentIntersectingSet = intersectingSet.current;

    // navバーの高さをマウント時に1度だけ取得してrootMarginに設定する。
    // stickyナビの高さ分だけ上端のマージンを除外することで、
    // ナビバーに隠れたセクションが「表示中」とみなされないようにする。
    // 注意: ウィンドウリサイズ時には高さが再取得されないため、
    //       フォントサイズ変更などでナビ高さが変わる場合は多少ずれが生じる可能性がある。
    const navHeight = nav ? nav.getBoundingClientRect().height : 0;
    const rootMargin = `-${navHeight}px 0px 0px 0px`;

    /**
     * Setを更新した後、categories配列の順序で最初にintersectしているカテゴリを
     * アクティブとして設定する。どれもintersectしていない場合はnullにする。
     */
    function updateActiveCategory() {
      const firstActive = categories.find(({ category }) =>
        currentIntersectingSet.has(category),
      );
      setActiveCategory(firstActive?.category ?? null);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = (entry.target as HTMLElement).id;
          if (entry.isIntersecting) {
            currentIntersectingSet.add(id);
          } else {
            currentIntersectingSet.delete(id);
          }
        });
        updateActiveCategory();
      },
      { rootMargin, threshold: 0 },
    );

    // categories に対応するセクション要素を監視対象に追加する
    categories.forEach(({ category }) => {
      const section = document.getElementById(category);
      if (section) {
        observer.observe(section);
      }
    });

    return () => {
      observer.disconnect();
      // アンマウント時に intersecting 状態をクリアして、再マウント時の
      // 残留状態による誤ったアクティブ表示を防ぐ
      currentIntersectingSet.clear();
    };
  }, [categories]);

  return (
    <nav
      ref={navRef}
      className={styles.categoryNav}
      aria-label="カテゴリナビゲーション"
      data-sticky="true"
    >
      {categories.map(({ category, label }) => {
        const isActive = activeCategory === category;
        return (
          <a
            key={category}
            href={`#${category}`}
            className={
              isActive
                ? `${styles.categoryNavTab} ${styles.categoryNavTabActive}`
                : styles.categoryNavTab
            }
            aria-current={isActive ? "true" : undefined}
          >
            {label}
          </a>
        );
      })}
    </nav>
  );
}
