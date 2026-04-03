import { ImageResponse } from "next/og";
import { getContrastTextColor } from "@/play/color-utils";

/** Configuration for generating OGP images. */
export type OgpImageConfig = {
  title: string;
  subtitle?: string;
  accentColor?: string;
  icon?: string;
};

const OGP_SIZE = { width: 1200, height: 630 };
const DEFAULT_ACCENT_COLOR = "#2563eb";
const SITE_NAME = "yolos.net";

/**
 * Google Fonts URL for Noto Sans JP (Regular 400 weight).
 * The CSS response contains a url() pointing to the actual font binary.
 */
const GOOGLE_FONTS_CSS_URL =
  "https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400&display=swap";

/**
 * User-Agent strings to try when fetching from Google Fonts.
 * Different UAs cause Google to serve different font formats:
 * - IE10 UA → WOFF (~3MB), compatible with Satori
 * - Old Android UA → TTF (~5MB), compatible with Satori
 * We try these in order and fall back to the next if the response is invalid.
 */
const FONT_FETCH_USER_AGENTS = [
  // IE10: Google returns WOFF format
  "Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; Trident/6.0)",
  // Old Android: Google returns TTF format
  "Mozilla/5.0 (Linux; U; Android 4.4.2; en-us; Nexus 5 Build/KOT49H) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30",
];

/**
 * Magic number prefixes for font formats that Satori supports.
 * WOFF2 is explicitly excluded because Satori does not support it.
 */
const VALID_FONT_MAGIC_NUMBERS: ReadonlyArray<readonly number[]> = [
  [0x77, 0x4f, 0x46, 0x46], // WOFF: "wOFF"
  [0x00, 0x01, 0x00, 0x00], // TTF
  [0x4f, 0x54, 0x54, 0x4f], // OpenType: "OTTO"
];

/**
 * Check whether an ArrayBuffer contains a Satori-compatible font binary.
 * Returns false for WOFF2 ("wOF2") and any other unrecognised format.
 */
function isSatoriCompatibleFont(buffer: ArrayBuffer): boolean {
  if (buffer.byteLength < 4) return false;
  const header = new Uint8Array(buffer, 0, 4);
  return VALID_FONT_MAGIC_NUMBERS.some(
    (magic) =>
      magic[0] === header[0] &&
      magic[1] === header[1] &&
      magic[2] === header[2] &&
      magic[3] === header[3],
  );
}

/**
 * Attempt to fetch Noto Sans JP using a single User-Agent string.
 * Returns an ArrayBuffer if a Satori-compatible font is obtained, otherwise null.
 */
async function tryFetchWithUserAgent(
  userAgent: string,
): Promise<ArrayBuffer | null> {
  const cssResponse = await fetch(GOOGLE_FONTS_CSS_URL, {
    headers: { "User-Agent": userAgent },
  });
  if (!cssResponse.ok) return null;

  const css = await cssResponse.text();

  // Extract font file URLs from the CSS @font-face rules.
  const fontUrls = css.match(
    /src:\s*url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/g,
  );
  if (!fontUrls || fontUrls.length === 0) return null;

  const allUrls: string[] = [];
  for (const match of fontUrls) {
    const urlMatch = match.match(/url\((https:\/\/[^)]+)\)/);
    if (urlMatch) {
      allUrls.push(urlMatch[1]);
    }
  }

  if (allUrls.length === 0) return null;

  // Fetch the first font binary (covers the main character range)
  const fontResponse = await fetch(allUrls[0]);
  if (!fontResponse.ok) return null;

  const buffer = await fontResponse.arrayBuffer();

  // Reject WOFF2 and other formats Satori cannot handle
  if (!isSatoriCompatibleFont(buffer)) return null;

  return buffer;
}

/**
 * Fetch Noto Sans JP font data from Google Fonts CDN.
 * Tries multiple User-Agent strings in order to obtain a Satori-compatible
 * font format (WOFF or TTF). Returns null if all attempts fail.
 */
async function fetchNotoSansJP(): Promise<ArrayBuffer | null> {
  for (const userAgent of FONT_FETCH_USER_AGENTS) {
    try {
      const result = await tryFetchWithUserAgent(userAgent);
      if (result !== null) return result;
    } catch {
      // Try next UA on any error
    }
  }
  return null;
}

/** Cached font data promise (fetched once per build). */
let fontDataPromise: Promise<ArrayBuffer | null> | null = null;

export function getFontData(): Promise<ArrayBuffer | null> {
  if (!fontDataPromise) {
    fontDataPromise = fetchNotoSansJP();
  }
  return fontDataPromise;
}

/** Shared OGP image size. */
export const ogpSize = OGP_SIZE;

/** Shared content type for OGP images. */
export const ogpContentType = "image/png";

/**
 * Create an OGP ImageResponse with a consistent design.
 *
 * Design:
 * - Full-bleed background with the accent color
 * - Optional icon (emoji) at the top
 * - Title in large bold text (centered)
 * - Optional subtitle below the title
 * - "yolos.net" site name in the bottom-right corner
 *
 * Japanese font (Noto Sans JP) is loaded from Google Fonts CDN.
 * Falls back to default sans-serif if font loading fails.
 */
export async function createOgpImageResponse(
  config: OgpImageConfig,
): Promise<ImageResponse> {
  const { title, subtitle, accentColor = DEFAULT_ACCENT_COLOR, icon } = config;

  // Automatically determine text color based on WCAG contrast ratio.
  // Delegates to the shared color-utils implementation for consistency.
  const textColor = getContrastTextColor(accentColor);

  const fontData = await getFontData();

  const fonts = fontData
    ? [
        {
          name: "NotoSansJP",
          data: fontData,
          style: "normal" as const,
          weight: 400 as const,
        },
      ]
    : [];

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: accentColor,
        color: textColor,
        fontFamily: fontData ? "NotoSansJP, sans-serif" : "sans-serif",
        padding: "40px 60px",
      }}
    >
      {icon && (
        <div
          style={{
            fontSize: 80,
            marginBottom: 20,
          }}
        >
          {icon}
        </div>
      )}
      <div
        style={{
          fontSize: title.length > 20 ? 48 : 64,
          fontWeight: 700,
          textAlign: "center",
          lineHeight: 1.3,
          maxWidth: "90%",
          overflow: "hidden",
          marginBottom: subtitle ? 16 : 0,
        }}
      >
        {title}
      </div>
      {subtitle && (
        <div
          style={{
            fontSize: 28,
            opacity: 0.9,
            textAlign: "center",
            maxWidth: "80%",
          }}
        >
          {subtitle}
        </div>
      )}
      <div
        style={{
          position: "absolute",
          bottom: 30,
          right: 40,
          fontSize: 24,
          opacity: 0.7,
        }}
      >
        {SITE_NAME}
      </div>
    </div>,
    {
      ...OGP_SIZE,
      fonts,
    },
  );
}
