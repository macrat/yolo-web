import type { Metadata } from "next";
import StorybookContent from "./StorybookContent";
import RelatedBlogPosts from "@/components/RelatedBlogPosts";

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
  // RelatedBlogPosts は @/lib/cross-links → @/blog/_lib/blog 経由で fs（node:fs）を
  // 参照するサーバー専用コンポーネント。client component の StorybookContent から
  // 直接 import すると Turbopack が node:fs をクライアントバンドルに含めようとして
  // ビルドが失敗する（cycle-224）。そのため server component である本ページで描画し、
  // ReactNode を prop として渡す（Next.js の server-in-client パターン）。
  return (
    <StorybookContent
      relatedBlogPostsWithPosts={<RelatedBlogPosts toolSlug="business-email" />}
      relatedBlogPostsEmpty={<RelatedBlogPosts toolSlug="char-count" />}
    />
  );
}
