"use client";

import { useSyncExternalStore } from "react";
import styles from "./CountdownTimer.module.css";

/**
 * Calculate milliseconds until next JST midnight (00:00:00 JST).
 * Uses UTC+9 offset calculation for the countdown interval.
 */
function getMsUntilJstMidnight(): number {
  const now = new Date();
  const jstOffset = 9 * 60 * 60 * 1000;
  const jstNow = new Date(now.getTime() + jstOffset);
  const jstMidnight = new Date(jstNow);
  jstMidnight.setUTCHours(0, 0, 0, 0);
  jstMidnight.setUTCDate(jstMidnight.getUTCDate() + 1);
  return jstMidnight.getTime() - jstNow.getTime();
}

/**
 * Format milliseconds as HH:MM:SS.
 */
function formatTime(ms: number): string {
  if (ms <= 0) return "00:00:00";
  const totalSec = Math.floor(ms / 1000);
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  return [hours, minutes, seconds]
    .map((v) => String(v).padStart(2, "0"))
    .join(":");
}

/**
 * External store for countdown remaining time string.
 * Updates every second via setInterval.
 */
let currentTime = "";
let listeners: Array<() => void> = [];
let intervalId: ReturnType<typeof setInterval> | null = null;

function updateTime() {
  currentTime = formatTime(getMsUntilJstMidnight());
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(callback: () => void): () => void {
  listeners.push(callback);
  if (listeners.length === 1) {
    updateTime();
    intervalId = setInterval(updateTime, 1000);
  }
  return () => {
    listeners = listeners.filter((l) => l !== callback);
    if (listeners.length === 0 && intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };
}

function getSnapshot(): string {
  return currentTime;
}

function getServerSnapshot(): string {
  return "";
}

/**
 * Countdown timer showing time until next puzzle (JST midnight).
 * Displays "次の問題まで HH:MM:SS" format.
 */
export default function CountdownTimer() {
  const remaining = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  if (!remaining) return null;

  return (
    <div className={styles.container}>
      <div className={styles.label}>次の問題まで</div>
      <div className={styles.time}>{remaining}</div>
    </div>
  );
}
