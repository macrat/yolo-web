export type NumberBase = 2 | 8 | 10 | 16;

export interface BaseConvertResult {
  success: boolean;
  binary: string;
  octal: string;
  decimal: string;
  hexadecimal: string;
  error?: string;
}

const BASE_LABELS: Record<NumberBase, string> = {
  2: "2進数 (Binary)",
  8: "8進数 (Octal)",
  10: "10進数 (Decimal)",
  16: "16進数 (Hexadecimal)",
};

export function getBaseLabel(base: NumberBase): string {
  return BASE_LABELS[base];
}

// Validate input for the given base
function isValidForBase(input: string, base: NumberBase): boolean {
  const cleaned = input.trim().toLowerCase();
  if (cleaned === "" || cleaned === "-") return false;

  const numPart = cleaned.startsWith("-") ? cleaned.slice(1) : cleaned;
  if (numPart === "") return false;

  switch (base) {
    case 2:
      return /^[01]+$/.test(numPart);
    case 8:
      return /^[0-7]+$/.test(numPart);
    case 10:
      return /^[0-9]+$/.test(numPart);
    case 16:
      return /^[0-9a-f]+$/.test(numPart);
    default:
      return false;
  }
}

// Parse string to BigInt for the given base
function parseBigInt(input: string, base: NumberBase): bigint {
  const cleaned = input.trim().toLowerCase();
  const isNegative = cleaned.startsWith("-");
  const numPart = isNegative ? cleaned.slice(1) : cleaned;

  let result = 0n;
  const baseBig = BigInt(base);

  for (const ch of numPart) {
    const digit = parseInt(ch, 16); // works for all bases <= 16
    result = result * baseBig + BigInt(digit);
  }

  return isNegative ? -result : result;
}

// Convert BigInt to string in the given base
function bigIntToString(value: bigint, base: NumberBase): string {
  if (value === 0n) return "0";

  const isNegative = value < 0n;
  let abs = isNegative ? -value : value;
  const baseBig = BigInt(base);
  const digits: string[] = [];

  while (abs > 0n) {
    const remainder = Number(abs % baseBig);
    digits.push(remainder.toString(base));
    abs = abs / baseBig;
  }

  const result = digits.reverse().join("");
  return isNegative ? "-" + result : result;
}

export function convertBase(
  input: string,
  fromBase: NumberBase,
): BaseConvertResult {
  const trimmed = input.trim();

  if (!trimmed) {
    return {
      success: true,
      binary: "",
      octal: "",
      decimal: "",
      hexadecimal: "",
    };
  }

  if (!isValidForBase(trimmed, fromBase)) {
    return {
      success: false,
      binary: "",
      octal: "",
      decimal: "",
      hexadecimal: "",
      error: `${getBaseLabel(fromBase)}として無効な入力です`,
    };
  }

  try {
    const value = parseBigInt(trimmed, fromBase);

    return {
      success: true,
      binary: bigIntToString(value, 2),
      octal: bigIntToString(value, 8),
      decimal: bigIntToString(value, 10),
      hexadecimal: bigIntToString(value, 16),
    };
  } catch (e) {
    return {
      success: false,
      binary: "",
      octal: "",
      decimal: "",
      hexadecimal: "",
      error: e instanceof Error ? e.message : "変換に失敗しました",
    };
  }
}

// Format binary with spaces every 4 digits for readability
export function formatBinary(binary: string): string {
  if (!binary || binary === "0") return binary;
  const isNeg = binary.startsWith("-");
  const abs = isNeg ? binary.slice(1) : binary;
  // Pad to multiple of 4
  const padded = abs.padStart(Math.ceil(abs.length / 4) * 4, "0");
  const formatted = padded.replace(/(.{4})/g, "$1 ").trim();
  return isNeg ? "-" + formatted : formatted;
}

// Format hex with spaces every 2 digits
export function formatHex(hex: string): string {
  if (!hex || hex === "0") return hex;
  const isNeg = hex.startsWith("-");
  const abs = isNeg ? hex.slice(1) : hex;
  const padded = abs.length % 2 === 0 ? abs : "0" + abs;
  const formatted = padded.replace(/(.{2})/g, "$1 ").trim();
  return isNeg ? "-" + formatted : formatted;
}
