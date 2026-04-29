"use client";

/**
 * ThemeToggle — アイコン + テキストボタンによるライト/ダーク切替。
 *
 * - next-themes の `useTheme()` フックで `resolvedTheme`（実際の適用テーマ）と
 *   `setTheme` を取得する。
 * - `resolvedTheme` を使うことで "system" の場合も実際の値（"light" / "dark"）が得られ、
 *   ボタンラベルを適切に表示できる。
 * - `useSyncExternalStore` を使って hydration mismatch を回避する（next-themes の慣例）。
 *   サーバー側ではテーマが不明なため、ボタンを表示しない。
 * - DESIGN.md §3: Lucide スタイル線画アイコン、strokeWidth 1.5px、サイズ 16px でテキストと並べる。
 *   アイコンは aria-hidden="true"、ボタン全体に aria-label を付与。
 * - 既存の Button コンポーネント（variant="ghost" size="small"）を再利用してデザイン整合を取る。
 * - Header の `actions` スロットに渡して使用する。
 *
 * 文言ロジック:
 * - 現在ダーク → 太陽アイコン + 「ライト」（= ライトに切り替えるボタン）
 * - 現在ライト → 月アイコン + 「ダーク」（= ダークに切り替えるボタン）
 */

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import Button from "@/components/Button";

/**
 * 外部ストアとして登録するための空のサブスクライバー関数。
 * useSyncExternalStore は subscribe 引数を必須とするため、何もしないサブスクライバーを渡す。
 * これにより SSR 時（getServerSnapshot）は false を返し、
 * クライアント mount 後（getSnapshot）は true を返してボタンを描画する。
 */
const emptySubscribe = () => () => {};

/**
 * 太陽アイコン — 現在ダーク時に表示（ライトへの切替を示す）。
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
 * 月アイコン — 現在ライト時に表示（ダークへの切替を示す）。
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
  // - サーバー側（getServerSnapshot）: false → ボタンを描画しない（hydration mismatch 回避）
  // - クライアント側（getSnapshot）: true → ボタンを描画する
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  // hydration mismatch 回避: mount 前は何も描画しない
  if (!mounted) {
    return null;
  }

  // resolvedTheme が "dark" ならライトに切り替えるボタン、それ以外はダークに切り替えるボタン
  const isDark = resolvedTheme === "dark";
  const nextTheme = isDark ? "light" : "dark";
  const label = isDark ? "ライト" : "ダーク";
  const ariaLabel = isDark
    ? "ライトモードに切り替え"
    : "ダークモードに切り替え";

  return (
    <Button
      variant="ghost"
      size="small"
      onClick={() => setTheme(nextTheme)}
      aria-label={ariaLabel}
    >
      <span
        style={{ display: "inline-flex", alignItems: "center", gap: "0.4em" }}
      >
        {isDark ? <SunIcon /> : <MoonIcon />}
        <span>{label}</span>
      </span>
    </Button>
  );
}
