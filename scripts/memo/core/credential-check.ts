/**
 * Credential pattern detection for memo content.
 * Checks memo text for potential secrets before creation.
 * Patterns copied from src/lib/secrets.ts (cannot import due to path alias).
 */

const CREDENTIAL_PATTERNS: { pattern: RegExp; description: string }[] = [
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
 * Check if text contains potential credential patterns.
 * Returns an object indicating whether a match was found and, if so, its description.
 */
export function checkCredentials(text: string): {
  found: boolean;
  description: string | null;
} {
  for (const { pattern, description } of CREDENTIAL_PATTERNS) {
    if (pattern.test(text)) {
      return { found: true, description };
    }
  }
  return { found: false, description: null };
}
