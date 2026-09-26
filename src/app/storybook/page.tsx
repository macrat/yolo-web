import type { Metadata } from "next";
import StorybookContent from "./StorybookContent";
import RelatedBlogPosts from "@/components/RelatedBlogPosts";
import type { ItemListItem } from "@/components/ItemList";
import {
  LIST_SAMPLES,
  LIST_SAMPLE_IDS,
  listSampleBasePath,
} from "./list/samples";

/** /storybook は開発者向けのコンポーネントカタログ。
 * 来訪者の目に触れる想定はないため `robots: noindex` を指定する。
 * page.tsx を server component に保ち、インタラクティブな描画は子の client component に閉じ込める。 */
export const metadata: Metadata = {
  title: "Storybook（開発者向け） | yolos.net",
  description: "yolos.net のデザインシステムのコンポーネントカタログ。",
  robots: { index: false, follow: false },
};

const listSamples: ItemListItem[] = LIST_SAMPLE_IDS.map((id) => ({
  name: LIST_SAMPLES[id].list.pageTitle,
  href: listSampleBasePath(id),
  description: LIST_SAMPLES[id].note,
}));

export default function StorybookPage() {
  // RelatedBlogPosts は @/lib/cross-links → @/blog/_lib/blog 経由で fs（node:fs）を
  // 参照するサーバー専用コンポーネント。client component の StorybookContent から
  // 直接 import すると Turbopack が node:fs をクライアントバンドルに含めようとして
  // ビルドが失敗する。そのため server component である本ページで描画し、
  // ReactNode を prop として渡す（Next.js の server-in-client パターン）。
  // BrowsableList の見本の行も、辞典のデータを読むのでここで組む。
  return (
    <StorybookContent
      relatedBlogPostsWithPosts={<RelatedBlogPosts slug="business-email" />}
      relatedBlogPostsEmpty={<RelatedBlogPosts slug="char-count" />}
      listSamples={listSamples}
    />
  );
}
