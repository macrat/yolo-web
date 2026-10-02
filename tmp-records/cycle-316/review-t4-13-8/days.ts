import { splitIntoPhrases } from "@/lib/phrase-breaks";
import { sayingPhrases, dailyOrder, getAllWords } from "@/play/games/nakamawake/_lib/engine";
import data from "@/play/games/nakamawake/data/nakamawake-data.json";
import sched from "@/play/games/nakamawake/data/nakamawake-schedule.json";
const out: Record<string, string[][]> = {};
for (const e of sched as any[]) { const p = (data as any[])[e.puzzleIndex]; out[e.puzzleIndex + "@" + e.date] = dailyOrder(getAllWords(p), e.date).map((w: string) => sayingPhrases(splitIntoPhrases(w)) ?? [w]); }
console.log(JSON.stringify({ out }));
