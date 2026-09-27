"use client";

import { useSyncExternalStore } from "react";
import { nextPuzzleTimeText } from "@/play/games/shared/_lib/nextPuzzleTime";

function subscribe(): () => void {
  return () => {};
}

function getSnapshot(): string {
  return nextPuzzleTimeText(new Date());
}

function getServerSnapshot(): null {
  return null;
}

interface NextPuzzleTimeProps {
  className?: string;
}

/**
 * 次の問題が出る時刻を1つの文で言う。時刻は来訪者の端末の今から決まるので、ブラウザで描く。
 * 残り時間を刻み続けない（DESIGN.md §11「表示が自動で書き換わり続けるもの」）。
 */
export default function NextPuzzleTime({ className }: NextPuzzleTimeProps) {
  const text = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  if (text === null) return null;
  return <p className={className}>{text}</p>;
}
