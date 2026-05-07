import type { Metadata } from "next";
import { SITE_NAME, BASE_URL } from "@/lib/constants";
import { allPlayContents } from "@/play/registry";
import PlayListView from "@/play/_components/PlayListView";

export const metadata: Metadata = {
  title: `遊ぶ | ${SITE_NAME}`,
  description: `運勢占い・性格診断・知識クイズ・パズルなど全${allPlayContents.length}種のコンテンツを一画面で見渡せます。カテゴリ絞り込みとキーワード検索で、目的の遊びにすぐたどり着けます。`,
  keywords: [
    "ゲーム",
    "クイズ",
    "診断",
    "占い",
    "パズル",
    "ブラウザゲーム",
    "無料",
    "インタラクティブ",
  ],
  openGraph: {
    title: `遊ぶ | ${SITE_NAME}`,
    description: `運勢占い・性格診断・知識クイズ・パズルなど全${allPlayContents.length}種のコンテンツをカテゴリ絞り込みとキーワード検索で探せます。`,
    type: "website",
    url: `${BASE_URL}/play`,
    siteName: SITE_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: `遊ぶ | ${SITE_NAME}`,
    description: `運勢占い・性格診断・知識クイズ・パズルなど全${allPlayContents.length}種のコンテンツをカテゴリ絞り込みとキーワード検索で探せます。`,
  },
  alternates: {
    canonical: `${BASE_URL}/play`,
  },
};

export default function PlayPage() {
  return <PlayListView contents={allPlayContents} />;
}
