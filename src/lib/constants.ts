/** Shared constants used across the application. */

/** Base site name used in metadata, titles, etc. */
export const SITE_NAME = "Yolo-Web";

/** Base URL for the site. Falls back to a placeholder if env var is not set. */
export const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://yolo-web.example.com";

if (typeof process !== "undefined" && !process.env.NEXT_PUBLIC_BASE_URL) {
  console.warn(
    "[constants] NEXT_PUBLIC_BASE_URL is not set. Using fallback: https://yolo-web.example.com",
  );
}
