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
  // サイト共通 keywords（cycle-232 T-2 決定で旧コンセプト「占い・診断」系から
  // 新コンセプト「日常の傍にある道具」系へ刷新。docs/site-concept.md 参照）
  keywords: [
    "オンラインツール",
    "無料ツール",
    "便利ツール",
    "Webツール",
    "道具箱",
    "文字数カウント",
    "JSON整形",
    "単位変換",
    "QRコード生成",
    "パスワード生成",
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
