"use client";

/**
 * ThemeProvider — next-themes のラッパーコンポーネント。
 *
 * `<html class="dark">` 方式でクラスを付与し、CSS の `:root.dark { ... }` トークンを有効化する。
 * `defaultTheme="system"` により、OS の `prefers-color-scheme` に自動で追従する。
 * 手動切替は ThemeToggle コンポーネント経由で行う。
 *
 * 使用上の注意:
 * - このコンポーネントを使う場合、`<html>` タグに `suppressHydrationWarning` を付けること。
 *   next-themes がサーバーサイドとクライアントサイドで `class` 属性を書き換えるため、
 *   React の hydration 警告を抑制する必要がある。
 * - `(new)/layout.tsx` が使う唯一の ThemeProvider（旧 `common/ThemeProvider` は
 *   cycle-279 C1 で `(legacy)/` 一式ごと削除済み）。
 */

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";

export default function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
