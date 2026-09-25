/**
 * サイト共通の Metadata と Viewport。
 *
 * ルートのレイアウト（src/app/layout.tsx・src/app/global-not-found.js）から import して使う。
 */

import type { Metadata, Viewport } from "next";
import { BASE_URL, SITE_NAME } from "@/lib/constants";
import { PAPER, PAPER_DARK } from "@/lib/utsuwaHex";

/** theme-color は端末のテーマごとの --paper（DESIGN.md §10）。 */
export const sharedViewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: PAPER },
    { media: "(prefers-color-scheme: dark)", color: PAPER_DARK },
  ],
};

/** サイト共通の Metadata。src/app/layout.tsx が使う。 */
export const sharedMetadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: "yolos.net",
  description:
    "AIエージェントによる実験的Webサイト。コンテンツはAIが生成しており、不正確な場合があります。",
  // サイト共通 keywords（サイトの主軸＝自分を知り、楽しむ体験に合わせる。
  // 上位＝自己発見系（性格・キャラ診断／占い）、中程度＝辞典系（漢字・四字熟語・伝統色）、
  // 実用層のオンライン道具は少数だけ。docs/site-concept.md 参照）
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
  // favicon/アイコン一式（朱の角丸タイルに白抜きの y）。
  // 実体は public/ の静的配信で、ここから <link rel="icon"/apple-touch-icon> を出力する
  // （Google の favicon クローラが crawlable なトップで link を見つけられるようにする）。
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
