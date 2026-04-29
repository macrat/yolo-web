"use client";

/**
 * ThemeToggle — テキストボタンによるライト/ダーク切替。
 *
 * - next-themes の `useTheme()` フックで `resolvedTheme`（実際の適用テーマ）と
 *   `setTheme` を取得する。
 * - `resolvedTheme` を使うことで "system" の場合も実際の値（"light" / "dark"）が得られ、
 *   ボタンラベルを適切に表示できる。
 * - `useSyncExternalStore` を使って hydration mismatch を回避する（next-themes の慣例）。
 *   サーバー側ではテーマが不明なため、ボタンを表示しない。
 * - DESIGN.md §3 の「絵文字は使わない」「アイコンは原則として使わない」に従い、テキストボタンで実装。
 * - 既存の Button コンポーネント（variant="ghost" size="small"）を再利用してデザイン整合を取る。
 * - Header の `actions` スロットに渡して使用する。
 *
 * 文言ロジック:
 * - 現在ダーク → 「ライト」（= ライトに切り替えるボタン）
 * - 現在ライト → 「ダーク」（= ダークに切り替えるボタン）
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
      {label}
    </Button>
  );
}
