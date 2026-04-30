import type { Metadata } from "next";
import StorybookContent from "./StorybookContent";

/** /storybook は開発者向けのコンポーネントカタログ。
 * 来訪者の目に触れる想定はないため `robots: noindex` を指定する。
 * page.tsx を server component に保ち（既存ページと同じパターン）、
 * インタラクティブな描画は子の client component に閉じ込める。 */
export const metadata: Metadata = {
  title: "Storybook（開発者向け） | yolos.net",
  description: "yolos.net 新デザインシステムのコンポーネントカタログ。",
  robots: { index: false, follow: false },
};

export default function StorybookPage() {
  return <StorybookContent />;
}
