import type { Metadata } from "next";
import type { ReactNode } from "react";

/**
 * /storybook 専用レイアウト。
 *
 * (new)/layout.tsx が robots: index=true に変更されたため、
 * storybook（開発者向けページ）は個別に noindex を指定する。
 * "use client" である page.tsx から metadata を export できないため、
 * 専用の layout.tsx で metadata を上書きする。
 */
export const metadata: Metadata = {
  title: "Storybook（開発者向け） | yolos.net",
  description: "yolos.net 新デザインシステムのコンポーネントカタログ。",
  robots: { index: false, follow: false },
};

export default function StorybookLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
