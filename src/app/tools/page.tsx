import type { Metadata } from "next";
import { allToolMetas } from "@/tools/registry";
import { paginate, TOOLS_PER_PAGE } from "@/lib/pagination";
import { BASE_URL } from "@/lib/constants";
import ToolsListView from "@/components/tools/ToolsListView";

export const metadata: Metadata = {
  title: "無料オンラインツール一覧 | yolos.net Tools",
  description:
    "文字数カウント、日付計算、パスワード生成などの便利ツールから、JSON整形・正規表現テストなどの開発者向けツールまで、32個を無料で提供。登録不要でブラウザ上ですぐに使えます。",
  keywords: [
    "オンラインツール",
    "無料ツール",
    "便利ツール",
    "開発者ツール",
    "文字数カウント",
    "日付計算",
  ],
  alternates: {
    canonical: `${BASE_URL}/tools`,
    types: {
      "application/rss+xml": "/feed",
      "application/atom+xml": "/feed/atom",
    },
  },
};

export default function ToolsPage() {
  const { items, totalPages } = paginate(allToolMetas, 1, TOOLS_PER_PAGE);

  return (
    <ToolsListView tools={items} currentPage={1} totalPages={totalPages} />
  );
}
