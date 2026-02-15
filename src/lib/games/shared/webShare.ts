/**
 * Web Share API utility for game result sharing.
 * Falls back gracefully when the API is not available (SSR, desktop browsers).
 */

import { useSyncExternalStore } from "react";

/**
 * Check if Web Share API is supported in the current environment.
 * Returns false during SSR.
 */
export function isWebShareSupported(): boolean {
  return (
    typeof navigator !== "undefined" &&
    "share" in navigator &&
    typeof navigator.share === "function"
  );
}

/** Subscribe stub: Web Share support never changes at runtime. */
function subscribeNoop(callback: () => void): () => void {
  // Capability does not change; nothing to subscribe to.
  void callback;
  return () => {};
}

/** Client snapshot: evaluated once and cached. */
function getClientSnapshot(): boolean {
  return isWebShareSupported();
}

/** Server snapshot: always false. */
function getServerSnapshot(): boolean {
  return false;
}

/**
 * React hook that returns whether the Web Share API is available.
 * Safe for SSR (returns false on server, real value on client).
 */
export function useCanWebShare(): boolean {
  return useSyncExternalStore(
    subscribeNoop,
    getClientSnapshot,
    getServerSnapshot,
  );
}

export interface ShareData {
  title: string;
  text: string;
  url: string;
}

/**
 * Share game result using the Web Share API.
 * Returns true if shared successfully, false if cancelled or unsupported.
 */
export async function shareGameResult(data: ShareData): Promise<boolean> {
  if (!isWebShareSupported()) return false;
  try {
    await navigator.share(data);
    return true;
  } catch {
    // User cancelled sharing or an error occurred
    return false;
  }
}
