"use client";

import { useRef } from "react";
import { trackTileFirstInteraction } from "@/lib/analytics";

interface TileInteractionTrackerProps {
  /** 道具の slug。item_id として送る。 */
  itemId: string;
  /** <section> のクラス（ToolPageLayout は styles.content を渡す）。 */
  className?: string;
  /** <section> の読み上げの名前。 */
  ariaLabel: string;
  children: React.ReactNode;
}

/**
 * TileInteractionTracker — 道具のページの本体（タイル）での最初の操作を計測するクライアントの境界。
 *
 * 道具の本体を包む <section> そのものを描き、ほかの包みを足さない。
 *
 * - 最初のポインタ操作（pointerdown）かキーボード操作（keydown）で、tile_first_interaction をマウントごとに
 *   1回だけ送る。
 * - capture phase で受けるので、道具の中の実装に手を入れずに済む。
 * - 送るのは item_id（道具の slug）と surface だけで、入力や出力の内容は送らない。
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
