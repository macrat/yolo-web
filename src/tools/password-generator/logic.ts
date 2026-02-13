export interface PasswordOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  digits: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
}

const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const DIGITS = "0123456789";
const SYMBOLS = "!@#$%^&*()-_=+[]{}|;:,.<>?";

const AMBIGUOUS = "O0Il1";

export const DEFAULT_OPTIONS: PasswordOptions = {
  length: 16,
  uppercase: true,
  lowercase: true,
  digits: true,
  symbols: true,
  excludeAmbiguous: false,
};

function buildCharset(options: PasswordOptions): string {
  let charset = "";
  if (options.uppercase) charset += UPPERCASE;
  if (options.lowercase) charset += LOWERCASE;
  if (options.digits) charset += DIGITS;
  if (options.symbols) charset += SYMBOLS;

  if (options.excludeAmbiguous) {
    charset = charset
      .split("")
      .filter((c) => !AMBIGUOUS.includes(c))
      .join("");
  }

  return charset;
}

export function generatePassword(options: PasswordOptions): string {
  const charset = buildCharset(options);
  if (charset.length === 0) {
    return "";
  }

  const length = Math.max(1, Math.min(128, options.length));
  const randomValues = new Uint32Array(length);
  crypto.getRandomValues(randomValues);

  return Array.from(randomValues)
    .map((val) => charset[val % charset.length])
    .join("");
}

export type PasswordStrength = "weak" | "fair" | "good" | "strong";

export function evaluateStrength(options: PasswordOptions): PasswordStrength {
  const charset = buildCharset(options);
  if (charset.length === 0) return "weak";

  // Entropy = length * log2(charset size)
  const entropy = options.length * Math.log2(charset.length);

  if (entropy < 40) return "weak";
  if (entropy < 60) return "fair";
  if (entropy < 80) return "good";
  return "strong";
}
