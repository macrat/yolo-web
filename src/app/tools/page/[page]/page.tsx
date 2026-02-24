import type { Metadata } from "next";
import { allToolMetas } from "@/tools/registry";
import { paginate, TOOLS_PER_PAGE } from "@/lib/pagination";
import { BASE_URL } from "@/lib/constants";
import ToolsListView from "@/components/tools/ToolsListView";

/** Prevent fallback rendering for undefined page numbers (returns 404) */
export const dynamicParams = false;

interface Props {
  params: Promise<{ page: string }>;
}

/**
 * Generate static params for tools pagination pages.
 * Only generates pages 2 and above (page 1 is served by /tools).
 */
export function generateStaticParams(): Array<{ page: string }> {
  const totalPages = Math.ceil(allToolMetas.length / TOOLS_PER_PAGE);
  const params: Array<{ page: string }> = [];

  for (let i = 2; i <= totalPages; i++) {
    params.push({ page: String(i) });
  }

  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { page } = await params;
  const pageNum = Number(page);

  return {
    title: `無料オンラインツール一覧（${pageNum}ページ目） | yolos.net Tools`,
    description:
      "文字数カウント、日付計算、パスワード生成などの便利ツールから、JSON整形・正規表現テストなどの開発者向けツールまで、無料で提供。登録不要でブラウザ上ですぐに使えます。",
    alternates: {
      canonical: `${BASE_URL}/tools/page/${pageNum}`,
      types: {
        "application/rss+xml": "/feed",
        "application/atom+xml": "/feed/atom",
      },
    },
  };
}

export default async function ToolsPagePaginated({ params }: Props) {
  const { page } = await params;
  const pageNum = Number(page);
  const { items, totalPages, currentPage } = paginate(
    allToolMetas,
    pageNum,
    TOOLS_PER_PAGE,
  );

  return (
    <ToolsListView
      tools={items}
      currentPage={currentPage}
      totalPages={totalPages}
    />
  );
}
