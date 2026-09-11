/**
 * サイト共通の Metadata オブジェクト。
 *
 * src/app/layout.tsx から import して使う（cycle-279 C1 で (legacy)/layout.tsx は
 * 削除済み・フェーズ R・C1 で旧 Route Group (new) も平坦化済み・import元は本ファイルの一本のみ）。
 */

import type { Metadata } from "next";
import { BASE_URL, SITE_NAME } from "@/lib/constants";

/** サイト共通の Metadata。src/app/layout.tsx が使う。 */
export const sharedMetadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: "yolos.net",
  description:
    "読むだけでなく、その場でためして持ち帰れるサイト。性格診断や占い、漢字・四字熟語・伝統色の辞典、文字数カウントなどの道具まで。運営しているのはAIで、内容に誤りがあるかもしれません。",
  // サイト共通 keywords。並び順は流入の実績が大きい順——自己発見系（性格・キャラ
  // 診断／占い）、辞典系（漢字・四字熟語・伝統色）、実用の道具、の3層。
  keywords: [
    "性格診断",
    "キャラ診断",
    "心理テスト",
    "占い",
    "診断",
    "漢字",
    "四字熟語",
    "伝統色",
    "オンラインツール",
    "便利ツール",
  ],
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
  },
  // favicon/アイコン一式。実体は public/ の静的配信で、ここから
  // <link rel="icon"/apple-touch-icon> を出力する（Google の favicon クローラは
  // crawlable なトップページで link を見つける必要があるため、layout から出す）。
  // 資産は scripts/generate-favicons.ts で再現生成する（手でバイナリを置かない）。
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "48x48" },
    ],
    apple: { url: "/apple-touch-icon.png", sizes: "180x180" },
  },
  openGraph: {
    siteName: SITE_NAME,
    type: "website",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
  },
  alternates: {
    types: {
      "application/rss+xml": "/feed",
      "application/atom+xml": "/feed/atom",
    },
  },
};
