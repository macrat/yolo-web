import { splitIntoPhrases } from "./pb6";
import { sayingPhrases } from "../wt-r6/src/play/games/nakamawake/_lib/engine";
import data from "../wt-r6/src/play/games/nakamawake/data/nakamawake-data.json";
const puzzles = data as { groups: { words: string[] }[] }[];
const out: Record<string, string[][]> = {};
const phrased: string[] = []; const rejected: string[] = [];
puzzles.forEach((p, i) => { out[i] = p.groups.flatMap((g) => g.words).map((w) => { const s = splitIntoPhrases(w); const r = sayingPhrases(s); if (r) phrased.push(r.join("|")); else if (s.length > 1) rejected.push(s.join("|")); return r ?? [w]; }); });
console.error("PHRASED", phrased.length, phrased.join(" / ")); console.error("REJECTED", rejected.length, rejected.join(" / "));
console.log(JSON.stringify({ out }));
