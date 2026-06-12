"use client";

import { useRef } from "react";
import { trackTileFirstInteraction } from "@/lib/analytics";

interface TileInteractionTrackerProps {
  /** Tool slug. Sent as item_id (cycle-234: item_id = slug on both surfaces). */
  itemId: string;
  /** Class for the <section> (ToolPageLayout passes styles.content). */
  className?: string;
  /** Accessible name for the <section> (preserves the pre-tracker markup). */
  ariaLabel: string;
  children: React.ReactNode;
}

/**
 * TileInteractionTracker — ツール詳細ページのタイル本体（ファーストビューの
 * ツール UI）に対する「最初の操作」計測のクライアント境界。
 *
 * ToolPageLayout（サーバーコンポーネント）が従来描画していた
 * `<section className={styles.content} aria-label=...>` をそのまま
 * このコンポーネントが描画する。余分な wrapper 要素を足さないので
 * DOM 構造・レイアウト・スタイルへの影響はゼロ（cycle-234 制約）。
 *
 * 計測仕様（cycle-234 T-1 確定版）:
 * - 最初のポインタ操作（pointerdown）またはキーボード操作（keydown）で
 *   tile_first_interaction を 1 回だけ送る（マウントごと 1 回）
 * - capture phase で捕捉するため、39 タイル実装には一切手を入れない
 * - 送るのは item_id（ツール slug）と surface のみ。入力内容・出力内容は
 *   送らない。詳細ページに variant 概念はないため variant は渡さない
 */
export default function TileInteractionTracker({
  itemId,
  className,
  ariaLabel,
  children,
}: TileInteractionTrackerProps) {
  // state ではなく ref: 送信済みフラグは描画に影響せず、再レンダーも不要
  const hasTrackedRef = useRef(false);

  const handleFirstInteraction = (): void => {
    if (hasTrackedRef.current) return;
    hasTrackedRef.current = true;
    trackTileFirstInteraction({ item_id: itemId, surface: "detail" });
  };

  return (
    // onPointerDownCapture / onKeyDownCapture は capture phase で発火するため、
    // タイル内部の stopPropagation の影響を受けずに最初の操作を捕捉できる
    <section
      className={className}
      aria-label={ariaLabel}
      onPointerDownCapture={handleFirstInteraction}
      onKeyDownCapture={handleFirstInteraction}
    >
      {children}
    </section>
  );
}
