import type { Metadata } from "next";
import { safeJsonLdStringify } from "@/lib/seo";
import { gameBySlug } from "@/play/games/registry";
import { buildGameJsonLd, buildGamePageMetadata } from "@/play/games/seo";
import GameLayout from "@/play/games/_components/GameLayout";
import GameContainer from "@/play/games/irodori/_components/GameContainer";
import type { TraditionalColor } from "@/play/games/irodori/_lib/daily";
import type { IrodoriScheduleEntry } from "@/play/games/irodori/_lib/types";
import {
  getTodaysPuzzle,
  formatDateJST,
} from "@/play/games/irodori/_lib/daily";
import traditionalColorsJson from "@/data/traditional-colors.json";
import scheduleJson from "@/play/games/irodori/data/irodori-schedule.json";

// Force dynamic rendering so that the puzzle is selected based on the
// current date at request time, not the build time date.
export const dynamic = "force-dynamic";

const gameMeta = gameBySlug.get("irodori")!;

export const metadata: Metadata = buildGamePageMetadata(gameMeta);

const gameJsonLd = buildGameJsonLd(gameMeta);

export default function IrodoriPage() {
  const { colors, puzzleNumber } = getTodaysPuzzle(
    traditionalColorsJson as TraditionalColor[],
    scheduleJson as IrodoriScheduleEntry[],
  );

  const todayStr = formatDateJST(new Date());

  // Parse todayStr as UTC midnight and format in JST to produce a Japanese
  // date string (e.g. "2026年3月19日"). Since todayStr is JST-based,
  // UTC midnight + 9 hours stays on the same calendar day in JST.
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
          colors={colors}
          puzzleNumber={puzzleNumber}
          todayStr={todayStr}
          dateDisplayString={dateDisplayString}
        />
      </GameLayout>
    </>
  );
}
