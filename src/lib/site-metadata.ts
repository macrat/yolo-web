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
  // サイト共通 keywords（cycle-276 決定(a)で道具箱中心から診断中心
  //（自分を知り、楽しむ）へ刷新。上位＝自己発見系（性格・キャラ診断／占い）、
  // 中程度＝辞典系（漢字・四字熟語・伝統色）、実用層のオンライン道具は少数だけ残す。
  // docs/cycles/cycle-276.md 決定(a)節・docs/site-concept.md 参照）
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
