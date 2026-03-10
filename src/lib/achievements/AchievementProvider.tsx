"use client";

/**
 * Achievement system provider and context.
 *
 * Wraps the application to provide achievement state and actions
 * to all client components via React Context.
 *
 * SSR safety: useSyncExternalStore with getServerSnapshot returning null
 * ensures localStorage is never accessed during server rendering.
 */

import {
  createContext,
  useCallback,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import type { ReactNode } from "react";
import type { AchievementStore } from "./types";
import { loadStore } from "./storage";
import { recordPlay as engineRecordPlay } from "./engine";
import AchievementToast from "./AchievementToast";
import { trackAchievementUnlock } from "@/lib/analytics";

/** Shape of the achievement context value */
export interface AchievementContextValue {
  /** Current achievement store, or null before client-side initialization */
  store: AchievementStore | null;
  /** Record a content play and update achievements */
  recordPlay: (contentId: string) => void;
  /** Badge IDs that were newly unlocked (for toast notifications) */
  newlyUnlocked: string[];
  /** Clear the newly unlocked notifications */
  dismissNotifications: () => void;
}

/**
 * React context for the achievement system.
 * Exported for use by useAchievements hook.
 */
export const AchievementContext = createContext<AchievementContextValue | null>(
  null,
);

interface AchievementProviderProps {
  children: ReactNode;
}

// --- External store management for useSyncExternalStore ---

/** Listeners that are notified when the store changes */
const storeListeners = new Set<() => void>();

/** Cached store value to avoid repeated localStorage reads */
let cachedStore: AchievementStore | null | undefined;

function subscribe(onStoreChange: () => void): () => void {
  storeListeners.add(onStoreChange);
  return () => {
    storeListeners.delete(onStoreChange);
  };
}

/** Get the current store snapshot. Reads from localStorage only on first call. */
function getSnapshot(): AchievementStore | null {
  if (cachedStore === undefined) {
    cachedStore = loadStore();
  }
  return cachedStore;
}

/** SSR snapshot: always null (no localStorage on server) */
function getServerSnapshot(): AchievementStore | null {
  return null;
}

/** Update the cached store and notify all subscribers */
function updateExternalStore(newStore: AchievementStore): void {
  cachedStore = newStore;
  for (const listener of storeListeners) {
    listener();
  }
}

/**
 * Provider component that manages achievement state.
 *
 * - Uses useSyncExternalStore for SSR-safe localStorage reading
 * - Provides recordPlay function that updates store and detects new badges
 * - Tracks newly unlocked badges for toast notification display
 */
export default function AchievementProvider({
  children,
}: AchievementProviderProps) {
  const store = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [newlyUnlocked, setNewlyUnlocked] = useState<string[]>([]);

  const recordPlay = useCallback((contentId: string) => {
    const result = engineRecordPlay(contentId);
    if (result) {
      updateExternalStore(result.store);
      if (result.newlyUnlocked.length > 0) {
        for (const badgeId of result.newlyUnlocked) {
          trackAchievementUnlock(badgeId);
        }
        setNewlyUnlocked((prev) => [...prev, ...result.newlyUnlocked]);
      }
    }
  }, []);

  const dismissNotifications = useCallback(() => {
    setNewlyUnlocked([]);
  }, []);

  const value = useMemo<AchievementContextValue>(
    () => ({
      store,
      recordPlay,
      newlyUnlocked,
      dismissNotifications,
    }),
    [store, recordPlay, newlyUnlocked, dismissNotifications],
  );

  return (
    <AchievementContext.Provider value={value}>
      {children}
      <AchievementToast />
    </AchievementContext.Provider>
  );
}
