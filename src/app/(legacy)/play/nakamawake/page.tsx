import type { Metadata } from "next";
import { safeJsonLdStringify } from "@/lib/seo";
import { gameBySlug } from "@/play/games/registry";
import { buildGameJsonLd, buildGamePageMetadata } from "@/play/games/seo";
import GameLayout from "@/play/games/_components/GameLayout";
import GameContainer from "@/play/games/nakamawake/_components/GameContainer";
import type {
  NakamawakePuzzle,
  NakamawakeScheduleEntry,
} from "@/play/games/nakamawake/_lib/types";
import {
  getTodaysPuzzle,
  formatDateJST,
} from "@/play/games/nakamawake/_lib/daily";
import puzzleDataJson from "@/play/games/nakamawake/data/nakamawake-data.json";
import scheduleJson from "@/play/games/nakamawake/data/nakamawake-schedule.json";
import { computeCrossCategoryItems } from "@/play/games/shared/_lib/crossCategoryItems";

// Force dynamic rendering so today's puzzle is selected on each request,
// not fixed to the build-time date.
export const dynamic = "force-dynamic";

const gameMeta = gameBySlug.get("nakamawake")!;

export const metadata: Metadata = buildGamePageMetadata(gameMeta);

const gameJsonLd = buildGameJsonLd(gameMeta);

// 他カテゴリ推薦データはリクエストごとに変わらないため、モジュールスコープで計算。
// Server Component（page.tsx）で計算することで、registry/seoのimportが
// クライアントバンドルに含まれるのを防ぐ。
const crossCategoryItems = computeCrossCategoryItems("nakamawake");

export default function NakamawakePage() {
  const puzzleData = puzzleDataJson as NakamawakePuzzle[];
  const schedule = scheduleJson as NakamawakeScheduleEntry[];

  const { puzzle, puzzleNumber } = getTodaysPuzzle(puzzleData, schedule);

  // Generate todayStr on the server so the puzzle selection date and
  // localStorage key always match, even near JST midnight boundaries.
  const todayStr = formatDateJST(new Date());

  // Generate the Japanese display string from todayStr on the server to keep
  // it consistent with the puzzle selection date.
  // new Date(todayStr) is parsed as UTC 00:00:00; Intl.DateTimeFormat with
  // timeZone "Asia/Tokyo" converts it to JST 09:00:00, yielding the same date.
  const dateDisplayString = new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(todayStr));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(gameJsonLd) }}
      />
      <GameLayout meta={gameMeta}>
        <GameContainer
          puzzle={puzzle}
          puzzleNumber={puzzleNumber}
          todayStr={todayStr}
          dateDisplayString={dateDisplayString}
          crossCategoryItems={crossCategoryItems}
        />
      </GameLayout>
    </>
  );
}
