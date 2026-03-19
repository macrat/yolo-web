const RATINGS_KEY = "humor-dictionary-ratings";

/**
 * Safely check if localStorage is available.
 */
function isStorageAvailable(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const testKey = "__storage_test__";
    window.localStorage.setItem(testKey, "1");
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if the given slug has already been rated.
 * Returns false if localStorage is unavailable or a parse error occurs.
 */
export function isRated(slug: string): boolean {
  if (!isStorageAvailable()) return false;
  try {
    const raw = window.localStorage.getItem(RATINGS_KEY);
    if (!raw) return false;
    const rated = JSON.parse(raw) as string[];
    return rated.includes(slug);
  } catch {
    return false;
  }
}

/**
 * Mark the given slug as rated.
 * Does nothing silently if localStorage is unavailable.
 * Prevents duplicate entries.
 */
export function markAsRated(slug: string): void {
  if (!isStorageAvailable()) return;
  try {
    const raw = window.localStorage.getItem(RATINGS_KEY);
    const rated: string[] = raw ? (JSON.parse(raw) as string[]) : [];
    if (!rated.includes(slug)) {
      rated.push(slug);
      window.localStorage.setItem(RATINGS_KEY, JSON.stringify(rated));
    }
  } catch {
    // Silently fail if storage is full or unavailable
  }
}
