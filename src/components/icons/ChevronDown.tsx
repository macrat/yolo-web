import type { SVGProps } from "react";

/**
 * ChevronDown — 下向き V 字シェブロン（Lucide 互換、stroke 1.5px）。
 *
 * `<details>/<summary>` の開閉状態を表現するアイコン。`color: currentColor` で
 * 親要素のテキスト色を継承する。開閉時の回転は CSS（`details[open] svg` 等）で
 * 制御する想定なので、回転ロジックはここでは持たない。
 */
export default function ChevronDown(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}
