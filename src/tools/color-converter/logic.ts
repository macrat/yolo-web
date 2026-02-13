export interface RGB {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
}

export interface HSL {
  h: number; // 0-360
  s: number; // 0-100
  l: number; // 0-100
}

export interface ColorResult {
  success: boolean;
  hex?: string;
  rgb?: RGB;
  hsl?: HSL;
  error?: string;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// --- Parsing ---

export function parseHex(input: string): ColorResult {
  const hex = input.replace(/^#/, "").trim();
  let expanded: string;

  if (/^[0-9a-fA-F]{3}$/.test(hex)) {
    expanded = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  } else if (/^[0-9a-fA-F]{6}$/.test(hex)) {
    expanded = hex;
  } else {
    return {
      success: false,
      error: "Invalid HEX format. Use #RGB or #RRGGBB.",
    };
  }

  const r = parseInt(expanded.slice(0, 2), 16);
  const g = parseInt(expanded.slice(2, 4), 16);
  const b = parseInt(expanded.slice(4, 6), 16);

  const rgb: RGB = { r, g, b };
  return {
    success: true,
    hex: "#" + expanded.toLowerCase(),
    rgb,
    hsl: rgbToHsl(rgb),
  };
}

export function parseRgb(input: string): ColorResult {
  // Accept "rgb(R, G, B)" or "R, G, B" or "R G B"
  const match = input.match(
    /^(?:rgb\s*\(\s*)?(\d{1,3})\s*[,\s]\s*(\d{1,3})\s*[,\s]\s*(\d{1,3})\s*\)?$/i,
  );
  if (!match) {
    return {
      success: false,
      error: "Invalid RGB format. Use rgb(R,G,B) or R,G,B.",
    };
  }

  const r = clamp(parseInt(match[1], 10), 0, 255);
  const g = clamp(parseInt(match[2], 10), 0, 255);
  const b = clamp(parseInt(match[3], 10), 0, 255);

  const rgb: RGB = { r, g, b };
  return {
    success: true,
    hex: rgbToHex(rgb),
    rgb,
    hsl: rgbToHsl(rgb),
  };
}

export function parseHsl(input: string): ColorResult {
  // Accept "hsl(H, S%, L%)" or "H, S, L" or "H S L"
  const match = input.match(
    /^(?:hsl\s*\(\s*)?(\d{1,3}(?:\.\d+)?)\s*[,\s]\s*(\d{1,3}(?:\.\d+)?)%?\s*[,\s]\s*(\d{1,3}(?:\.\d+)?)%?\s*\)?$/i,
  );
  if (!match) {
    return {
      success: false,
      error: "Invalid HSL format. Use hsl(H,S%,L%) or H,S,L.",
    };
  }

  const h = ((parseFloat(match[1]) % 360) + 360) % 360;
  const s = clamp(parseFloat(match[2]), 0, 100);
  const l = clamp(parseFloat(match[3]), 0, 100);

  const hsl: HSL = { h: Math.round(h), s: Math.round(s), l: Math.round(l) };
  const rgb = hslToRgb(hsl);
  return {
    success: true,
    hex: rgbToHex(rgb),
    rgb,
    hsl,
  };
}

// --- Conversions ---

export function rgbToHex(rgb: RGB): string {
  const toHex = (n: number) => n.toString(16).padStart(2, "0");
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

export function rgbToHsl(rgb: RGB): HSL {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);

    if (max === r) {
      h = ((g - b) / delta + (g < b ? 6 : 0)) * 60;
    } else if (max === g) {
      h = ((b - r) / delta + 2) * 60;
    } else {
      h = ((r - g) / delta + 4) * 60;
    }
  }

  return {
    h: Math.round(h),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

export function hslToRgb(hsl: HSL): RGB {
  const h = hsl.h;
  const s = hsl.s / 100;
  const l = hsl.l / 100;

  if (s === 0) {
    const v = Math.round(l * 255);
    return { r: v, g: v, b: v };
  }

  const hueToRgb = (p: number, q: number, t: number): number => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  return {
    r: Math.round(hueToRgb(p, q, h / 360 + 1 / 3) * 255),
    g: Math.round(hueToRgb(p, q, h / 360) * 255),
    b: Math.round(hueToRgb(p, q, h / 360 - 1 / 3) * 255),
  };
}

// --- Format helpers ---

export function formatRgb(rgb: RGB): string {
  return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
}

export function formatHsl(hsl: HSL): string {
  return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
}
