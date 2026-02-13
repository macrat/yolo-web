/**
 * Generate a memo ID from the current UNIX timestamp in milliseconds,
 * encoded as lowercase hexadecimal (no zero-padding).
 */
export function generateMemoId(): string {
  return Date.now().toString(16);
}
