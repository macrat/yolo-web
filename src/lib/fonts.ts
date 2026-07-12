/**
 * Web フォント基盤（DESIGN.md §3 タイポグラフィ由来）。
 *
 * next/font/google で見出し明朝と数字書体を CSS 変数として配線する。
 * - 見出し明朝: DESIGN.md §3「見出し・店号・品名」の明朝系 Web フォント1書体。
 *   源ノ明朝（= Noto Serif JP）をウェイト1本（600）で採用する。
 * - 数字: DESIGN.md §3「数字（スコア・計測値・結果の主役）」用。tabular・大サイズで
 *   個性が立つ書体として Zilla Slab（500）を採用（Inter/Roboto 系の既定は §8-7 で禁止）。
 *
 * display: "swap" は §10「Web フォント読み込みで本文・結果がリフローしない」の要件
 * （font-display: swap + フォールバック）に対応する。本文・UI はシステムゴシックで
 * ネイティブ描画するため、ここでは見出し明朝と数字だけを Web フォント配信する。
 */
import { Noto_Serif_JP, Zilla_Slab } from "next/font/google";

export const mincho = Noto_Serif_JP({
  weight: "600",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mincho",
});

export const number = Zilla_Slab({
  weight: "500",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-number",
});
