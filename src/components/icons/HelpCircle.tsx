import type { SVGProps } from "react";

/**
 * HelpCircle — 円の中に疑問符（Lucide 互換、stroke 1.5px）。
 *
 * 遊び方（ヘルプ）を開くボタンのアイコンに使う。
 * `color: currentColor` で親要素のテキスト色を継承する。
 */
export default function HelpCircle(props: SVGProps<SVGSVGElement>) {
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
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}
