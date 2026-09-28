"use client";

import { useSyncExternalStore } from "react";
import {
  nextPuzzleAt,
  nextPuzzleTimeText,
} from "@/play/games/shared/_lib/nextPuzzleTime";

/**
 * 日本時間の 0:00 に1度だけ知らせ、次の 0:00 まで何もしない。開いたまま日付をまたいでも、すでに出た問題の
 * 時刻を「出ます」と言い続けない。
 */
function subscribe(onChange: () => void): () => void {
  let timer: ReturnType<typeof setTimeout>;
  const waitForNextPuzzle = () => {
    const now = new Date();
    timer = setTimeout(
      () => {
        onChange();
        waitForNextPuzzle();
      },
      nextPuzzleAt(now).getTime() - now.getTime(),
    );
  };
  waitForNextPuzzle();
  return () => clearTimeout(timer);
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
 * 残り時間を刻み続けず、文が替わるのは日本時間の日付が替わったときだけ（DESIGN.md §11「表示が自動で
 * 書き換わり続けるもの」）。
 */
export default function NextPuzzleTime({ className }: NextPuzzleTimeProps) {
  const text = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  if (text === null) return null;
  return <p className={className}>{text}</p>;
}
