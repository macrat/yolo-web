/**
 * Web フォントの配り方（DESIGN.md §3）。
 *
 * 配るのは見出しの和文の Zen Antique と、欧文・数字の IBM Plex Sans だけ。
 * 本文・UI の和文は端末の書体で組むので配らない。
 * 書体の並び（--font-heading・--font-body）は globals.css で組み立てる。
 */
import { Zen_Antique } from "next/font/google";
import localFont from "next/font/local";

// next/font が自動で置く代わりの書体は unicode-range を持たず、読み込みのあいだ
// 和文の「——」「……」まで欧文の字形で描くので止める。Turbopack は next/font/google の
// adjustFontFallback: false だけでは自動の代わりの書体を止めないので、fallback: [] も渡す。
// preload しないのは、見出しの字ごとに分割ファイルが分かれ、どれを読むかがページで決まるため。
export const zenAntique = Zen_Antique({
  weight: "400",
  display: "swap",
  preload: false,
  adjustFontFallback: false,
  fallback: [],
  variable: "--font-zen-antique",
});

// Plex で組むのは U+0000-007F だけにする。ほかの字（欧文約物・アクセント付きラテン）は和文の書体が組む。
// 読み込みのあいだの代わりの書体は、同じ範囲を付けて globals.css に置く。
export const plexSans = localFont({
  src: [
    {
      path: "../fonts/ibm-plex-sans/IBMPlexSans-Regular-Latin1.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/ibm-plex-sans/IBMPlexSans-Bold-Latin1.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  display: "swap",
  // Bold も preload する。強調と表の見出しで本文に広く出るので、読み込み後の差し替えを避ける。
  preload: true,
  adjustFontFallback: false,
  declarations: [{ prop: "unicode-range", value: "U+0000-007F" }],
  variable: "--font-plex-sans",
});
