"use client";

/**
 * ThemeToggle — トグルスイッチ風のライト/ダーク切替。
 *
 * - next-themes の `useTheme()` フックで `resolvedTheme`（実際の適用テーマ）と
 *   `setTheme` を取得する。
 * - `resolvedTheme` を使うことで "system" の場合も実際の値（"light" / "dark"）が得られ、
 *   現在の状態を正確に反映できる。
 * - `useSyncExternalStore` を使って hydration mismatch を回避する（next-themes の慣例）。
 *   サーバー側ではテーマが不明なため、コンポーネントを表示しない。
 * - DESIGN.md §3: Lucide スタイル線画アイコン、strokeWidth 1.5px、サイズ 16px。
 *   アイコンのみのボタンには aria-label を付与（DESIGN.md §3 の規定）。
 * - DESIGN.md §5: ON/OFF 切替は原則トグルスイッチを使う。
 *
 * デザイン:
 * - ボタンではなく横長のトラック + サムのトグルスイッチ風。
 * - トラック左端に太陽アイコン（ライト）、右端に月アイコン（ダーク）を配置。
 * - ライト時: サムは左（太陽側）。ダーク時: サムは右（月側）。
 * - 「ライト」「ダーク」のテキストラベルは表示しない（控えめアイコンのみ）。
 * - role="switch" + aria-checked で現在状態を読み上げ可能にする。
 *
 * aria-checked の意味:
 * - false = ライトモード（ダーク側がオフ）
 * - true = ダークモード（ダーク側がオン）
 */

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import styles from "./ThemeToggle.module.css";

/**
 * 外部ストアとして登録するための空のサブスクライバー関数。
 * useSyncExternalStore は subscribe 引数を必須とするため、何もしないサブスクライバーを渡す。
 * これにより SSR 時（getServerSnapshot）は false を返し、
 * クライアント mount 後（getSnapshot）は true を返してコンポーネントを描画する。
 */
const emptySubscribe = () => () => {};

/**
 * 太陽アイコン — トラック左端（ライト側）に配置。
 * Lucide "sun" の paths に準拠。DESIGN.md §3: strokeWidth 1.5px、16px 表示。
 */
function SunIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

/**
 * 月アイコン — トラック右端（ダーク側）に配置。
 * Lucide "moon" の path に準拠。DESIGN.md §3: strokeWidth 1.5px、16px 表示。
 */
function MoonIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  // useSyncExternalStore でマウント状態を管理。
  // - サーバー側（getServerSnapshot）: false → 何も描画しない（hydration mismatch 回避）
  // - クライアント側（getSnapshot）: true → コンポーネントを描画する
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  // hydration mismatch 回避: mount 前はプレースホルダーを描画して CLS を防ぐ。
  // .toggle に min-width: 52px; min-height: 28px を設定済みのため、
  // 内部コンテンツがない空ボタンでも .track と同じサイズが確保される。
  // hydration 後にスイッチへ切り替わるが、サイズ変化は発生しない。
  if (!mounted) {
    return (
      <button
        type="button"
        className={styles.toggle}
        aria-hidden="true"
        tabIndex={-1}
        disabled
      />
    );
  }

  // isDark=true のとき「ダーク側がオン」= aria-checked=true
  const isDark = resolvedTheme === "dark";
  const ariaLabel = isDark
    ? "ライトモードに切り替え"
    : "ダークモードに切り替え";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={ariaLabel}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={styles.toggle}
    >
      {/* トラック: 横長の楕円。左に太陽アイコン、右に月アイコンを配置。
          サム（丸いつまみ）が現在状態側（ライト=左、ダーク=右）に移動する。 */}
      <span className={styles.track} aria-hidden="true">
        {/* 左端: 太陽アイコン（ライト側） */}
        <span className={styles.iconLeft}>
          <SunIcon />
        </span>
        {/* 右端: 月アイコン（ダーク側） */}
        <span className={styles.iconRight}>
          <MoonIcon />
        </span>
        {/* サム: isDark のとき右側（月側）へ移動する */}
        <span className={`${styles.thumb} ${isDark ? styles.thumbDark : ""}`} />
      </span>
    </button>
  );
}
