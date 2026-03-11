"use client";

import { useSyncExternalStore } from "react";

/**
 * Returns today's date formatted in Japanese (e.g. "2026年3月11日").
 * Uses JST timezone to match the site's target audience.
 */
function getDateString(): string {
  const formatter = new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  return formatter.format(new Date());
}

/** Always returns empty string for server-side rendering to avoid hydration mismatch. */
function getServerSnapshot(): string {
  return "";
}

/** Subscribe is a no-op because the date does not change during the session. */
function subscribe(): () => void {
  return () => {};
}

/**
 * Client component that displays today's date in Japanese format.
 * Uses useSyncExternalStore to safely provide the date on the client
 * while returning an empty string during SSR, preventing hydration mismatch.
 */
export default function TodayDate({ className }: { className?: string }) {
  const dateString = useSyncExternalStore(
    subscribe,
    getDateString,
    getServerSnapshot,
  );

  return (
    <p className={className}>
      {dateString ? `${dateString}のパズル` : "\u00A0"}
    </p>
  );
}
