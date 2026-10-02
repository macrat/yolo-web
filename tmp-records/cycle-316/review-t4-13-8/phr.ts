import { splitIntoPhrases } from "@/lib/phrase-breaks";
import { sayingPhrases } from "@/play/games/nakamawake/_lib/engine";
import data from "@/play/games/nakamawake/data/nakamawake-data.json";
const out: Record<string, string[][]> = {};
for (const [i, p] of (data as any[]).entries()) out[i] = p.groups.flatMap((g: any) => g.words).map((w: string) => sayingPhrases(splitIntoPhrases(w)) ?? [w]);
console.log(JSON.stringify({ out }));
