import type { SVGProps } from "react";

/**
 * BarChart — 棒グラフ風アイコン（Lucide 互換、stroke 1.5px）。
 *
 * 統計（プレイ記録・正解分布）を開くボタンのアイコンに使う。
 * `color: currentColor` で親要素のテキスト色を継承する。
 */
export default function BarChart(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <line x1="12" y1="20" x2="12" y2="10" />
      <line x1="18" y1="20" x2="18" y2="4" />
      <line x1="6" y1="20" x2="6" y2="16" />
    </svg>
  );
}
