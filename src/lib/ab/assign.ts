/**
 * SSR-safe A/B arm assignment.
 *
 * Responsibility: decide and return the arm ("A"/"B") for a given experiment,
 * persisting the choice per-device in localStorage so the same visitor keeps
 * the same arm. This module does NOT touch GA (analytics.ts) or rendering
 * (ResultCard); those depend on this module, not the other way around
 * (関心の分離 / coding rule #3).
 *
 * Privacy (憲法ルール2 / coding rule #2): assignment is entirely client-side
 * and localStorage-only. No external API/DB/auth, no server-side tracking,
 * and no identifier that can single out a person — only a random arm label.
 *
 * SSR safety (coding rule #1): every localStorage / Math.random() access is
 * guarded by `typeof window === "undefined"`. The server never produces an
 * arm-dependent render, which avoids hydration mismatch. Math.random() is
 * only ever called at runtime inside these functions, never at module load.
 *
 * Design reference: docs/visitor-value-measurement.md 論点1.
 */

import type { AbArm } from "./experiments";

/** localStorage key holding the arm map: `{ "<experiment_id>": "<arm>" }`. */
export const AB_STORAGE_KEY = "yolos-ab";

/**
 * In-memory fallback assignments, used when localStorage is unavailable
 * (private mode, storage disabled, quota). These are session-consistent
 * (stable within the page lifetime) but intentionally not persisted, so a
 * fallback visitor's experience is never broken — they just may get a fresh
 * arm on their next visit. Keyed by experiment id.
 */
const memoryArms: Record<string, AbArm> = {};

/** Type guard: is the value a valid arm label? */
function isAbArm(value: unknown): value is AbArm {
  return value === "A" || value === "B";
}

/**
 * Pick an arm uniformly at random (50/50). Called only at runtime, never at
 * module top-level or during SSR (see file header).
 */
function pickRandomArm(): AbArm {
  return Math.random() < 0.5 ? "A" : "B";
}

/**
 * Read and parse the persisted arm map from localStorage.
 * Returns an empty object on any failure (missing key, malformed JSON,
 * storage exception). Never throws.
 */
function readArmMap(): Record<string, AbArm> {
  try {
    const raw = window.localStorage.getItem(AB_STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return {};
    const result: Record<string, AbArm> = {};
    for (const [key, value] of Object.entries(parsed)) {
      // Keep only well-formed arm entries; drop anything unexpected so a
      // corrupted/foreign value can't poison assignment.
      if (isAbArm(value)) result[key] = value;
    }
    return result;
  } catch {
    return {};
  }
}

/**
 * Persist a single experiment's arm into the localStorage arm map, preserving
 * other experiments' entries. Returns true on success, false if localStorage
 * could not be written (caller falls back to in-memory).
 */
function writeArm(experimentId: string, arm: AbArm): boolean {
  try {
    const map = readArmMap();
    map[experimentId] = arm;
    window.localStorage.setItem(AB_STORAGE_KEY, JSON.stringify(map));
    return true;
  } catch {
    return false;
  }
}

/**
 * Get the arm for an experiment (SSR-safe).
 *
 * - SSR (window undefined): returns `null`. The caller must treat null as
 *   "arm not yet determined" and render an arm-independent result, then
 *   re-render once an arm is available on the client (see `useAbVariant`).
 *   This avoids hydration mismatch.
 * - Client, arm already stored: returns the stored arm (fixed for the visitor).
 * - Client, no stored arm: random 50/50, persisted to localStorage, then
 *   returned. Subsequent calls return the same arm.
 * - Client, localStorage unavailable: random 50/50 held in memory for the
 *   page lifetime (session-consistent), not persisted.
 *
 * @param experimentId an id from the experiment registry (see ./experiments).
 */
export function getAbArm(experimentId: string): AbArm | null {
  // SSR guard: never read storage or randomize on the server.
  if (typeof window === "undefined") return null;

  // Prefer a persisted arm so the visitor stays on the same arm across visits.
  const stored = readArmMap()[experimentId];
  if (stored) return stored;

  // Fall back to an arm already chosen this page lifetime (covers the
  // localStorage-unavailable case so repeated calls stay consistent).
  const inMemory = memoryArms[experimentId];
  if (inMemory) return inMemory;

  // First encounter this visit: choose and try to persist.
  const arm = pickRandomArm();
  memoryArms[experimentId] = arm;
  // If persistence fails (private mode etc.), the in-memory value above keeps
  // the arm consistent for the rest of this page lifetime without throwing.
  writeArm(experimentId, arm);
  return arm;
}
