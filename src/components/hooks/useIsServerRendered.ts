"use client";

import { useSyncExternalStore } from "react";

const subscribeNever = () => () => {};

/**
 * 描いている木が、サーバーで描いた HTML にあったものか。サーバーで描くときと、その HTML を水和で引き継ぐ
 * 最初の描画では true、引き継いだあとの描画と、ブラウザで新しく描くものでは false。
 */
export function useIsServerRendered(): boolean {
  return useSyncExternalStore(
    subscribeNever,
    () => false,
    () => true,
  );
}
