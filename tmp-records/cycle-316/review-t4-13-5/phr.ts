import { splitIntoPhrases } from "./pb";
import data from "../../../src/play/games/nakamawake/data/nakamawake-data.json";
const out: Record<string, string[][]> = {};
const puzzles = data as { groups: { words: string[]; difficulty: number }[] }[];
const scored = puzzles.map((p, i) => ({ i, max: Math.max(...p.groups.flatMap((g) => g.words.map((w) => w.length))), sum: p.groups.flatMap((g) => g.words).reduce((a, w) => a + w.length, 0) }));
scored.sort((a, b) => b.max - a.max || b.sum - a.sum);
const pick = scored.map((s) => s.i);
for (const i of pick) out[i] = puzzles[i].groups.flatMap((g) => g.words).map((w) => splitIntoPhrases(w));
console.log(JSON.stringify({ pick: scored.slice(0, 8), out, count: puzzles.length }));
