"use client";

/**
 * ToolboxContent — /toolbox-preview ページの dynamic ラッパー。
 *
 * dnd-kit の useUniqueId がモジュールスコープのカウンタで ID 採番するため、
 * SSR と CSR でカウンタ値が乖離し hydration mismatch が発生する。
 * ToolboxContentInner を dynamic({ ssr: false }) で読み込むことで根本解消する。
 *
 * "use client" コンポーネント内でのみ dynamic({ ssr: false }) が使えるため、
 * Server Component の page.tsx ではなくこのラッパーに dynamic を置く。
 *
 * 参照: docs/knowledge/dnd-kit.md
 */

import dynamic from "next/dynamic";

/**
 * ToolboxContentInner を dynamic + ssr: false で読み込む。
 * クライアント mount 後のみ render することで dnd-kit の hydration mismatch を防ぐ。
 */
const ToolboxContentInner = dynamic(() => import("./ToolboxContentInner"), {
  ssr: false,
});

export default function ToolboxContent() {
  return <ToolboxContentInner />;
}
