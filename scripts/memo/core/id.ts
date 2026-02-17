/**
 * Generate a memo ID from the current UNIX timestamp in milliseconds,
 * encoded as lowercase hexadecimal (no zero-padding).
 * Returns both the ID and the timestamp so they can be kept in sync.
 */
export function generateMemoId(): { id: string; timestamp: number } {
  const timestamp = Date.now();
  return { id: timestamp.toString(16), timestamp };
}

/**
 * Compute a memo ID from an ISO-8601 date string.
 * Used for lint validation (checking ID/timestamp consistency).
 */
export function idFromTimestamp(isoString: string): string {
  return new Date(isoString).getTime().toString(16);
}

/**
 * Convert a memo ID (hex) back to a UNIX timestamp in milliseconds.
 */
export function timestampFromId(id: string): number {
  return parseInt(id, 16);
}
