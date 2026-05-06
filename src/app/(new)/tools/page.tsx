import type { Metadata } from "next";
import { allToolMetas } from "@/tools/registry";
import { SITE_NAME, BASE_URL } from "@/lib/constants";
import ToolsListView from "@/tools/_components/ToolsListView";

export function generateMetadata(): Metadata {
  const count = allToolMetas.length;
  const description = `文字数カウント、日付計算、パスワード生成などの便利ツールから、JSON整形・正規表現テストなどの開発者向けツールまで、${count}個を無料で提供。登録不要でブラウザ上ですぐに使えます。`;

  return {
    title: "無料オンラインツール一覧 | yolos.net Tools",
    description,
    keywords: [
      "オンラインツール",
      "無料ツール",
      "便利ツール",
      "開発者ツール",
      "文字数カウント",
      "日付計算",
    ],
    openGraph: {
      title: "無料オンラインツール一覧 | yolos.net Tools",
      description,
      type: "website",
      url: `${BASE_URL}/tools`,
      siteName: SITE_NAME,
    },
    twitter: {
      card: "summary_large_image",
      title: "無料オンラインツール一覧 | yolos.net Tools",
      description,
    },
    alternates: {
      canonical: `${BASE_URL}/tools`,
      types: {
        "application/rss+xml": "/feed",
        "application/atom+xml": "/feed/atom",
      },
    },
  };
}

export default function ToolsPage() {
  return <ToolsListView tools={allToolMetas} />;
}
