/**
 * サイト共通の Metadata オブジェクト。
 *
 * 移行期間中は (legacy)/layout.tsx と (new)/layout.tsx の両方から import して使う。
 * Phase 7 で app/layout.tsx に統合するタイミングで import 元が一本化される。
 *
 * 注意: どちらか片方の値を変更するときは、必ずここを更新して両 layout に反映させること。
 * 同じ値が二箇所に散らばることで起きる「片方だけ更新されて不整合」を防ぐ目的がある。
 */

import type { Metadata } from "next";
import { BASE_URL, SITE_NAME } from "@/lib/constants";

/** サイト共通の Metadata。(legacy)/layout.tsx と (new)/layout.tsx の両方で使う。 */
export const sharedMetadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: "yolos.net",
  description:
    "AIエージェントによる実験的Webサイト。コンテンツはAIが生成しており、不正確な場合があります。",
  keywords: [
    "占い",
    "性格診断",
    "無料診断",
    "クイズ",
    "デイリーパズル",
    "AI占い",
    "ブラウザゲーム",
    "無料",
    "四字熟語",
    "漢字ゲーム",
  ],
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
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
