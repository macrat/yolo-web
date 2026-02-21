import { ImageResponse } from "next/og";

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
 * Fetch Noto Sans JP font data from Google Fonts CDN.
 * Returns the font as an ArrayBuffer, or null if the fetch fails.
 *
 * Important: Satori (used by next/og) only supports TrueType (.ttf) and
 * OpenType (.otf) fonts, NOT woff2. We use an old-browser User-Agent
 * to make Google Fonts return the .ttf version instead of woff2.
 */
async function fetchNotoSansJP(): Promise<ArrayBuffer | null> {
  try {
    // Fetch CSS with an old UA so Google returns .ttf URLs (not woff2).
    const cssResponse = await fetch(GOOGLE_FONTS_CSS_URL, {
      headers: {
        // Old IE UA triggers TrueType font delivery from Google Fonts
        "User-Agent":
          "Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; Trident/6.0)",
      },
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

    return await fontResponse.arrayBuffer();
  } catch {
    return null;
  }
}

/** Cached font data promise (fetched once per build). */
let fontDataPromise: Promise<ArrayBuffer | null> | null = null;

function getFontData(): Promise<ArrayBuffer | null> {
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
        color: "white",
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
