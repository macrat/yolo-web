/**
 * Secret pattern detection for memo content sanitization.
 * Memos matching any of these patterns are excluded from public display
 * and a warning is emitted at build time.
 */

/** Patterns that indicate potentially sensitive content. */
export const SECRET_PATTERNS: { pattern: RegExp; description: string }[] = [
  {
    pattern:
      /(?:api[_-]?key|apikey|password|secret|token|credential)\s*[:=]\s*\S+/i,
    description: "API key / password / secret / token assignment",
  },
  {
    pattern: /Bearer\s+[A-Za-z0-9\-._~+/]+=*/i,
    description: "Bearer token",
  },
  {
    pattern: /-----BEGIN/,
    description: "PEM block (private key or certificate)",
  },
  {
    pattern: /AKIA[A-Z0-9]{16}/,
    description: "AWS access key",
  },
  {
    pattern: /:\/\/[^/\s]+:[^@\s]+@/,
    description: "URL with embedded credentials",
  },
  {
    pattern:
      /(?:^|[\s=])(?:[A-Za-z_][A-Za-z0-9_]*\s*=\s*)['"]*[A-Za-z0-9+/]{40,}={0,3}['"]*\s*$/m,
    description: "Possible base64-encoded secret in variable assignment",
  },
];

/**
 * Check if text contains any secret patterns.
 * Returns the first matching pattern description, or null if no match.
 */
export function detectSecrets(text: string): string | null {
  for (const { pattern, description } of SECRET_PATTERNS) {
    if (pattern.test(text)) {
      return description;
    }
  }
  return null;
}
