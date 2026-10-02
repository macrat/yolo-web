import { quizBySlug } from "../src/play/quiz/registry";
import { splitIntoPhrases } from "../src/lib/phrase-breaks";
const out: Record<string, string[]> = {};
for (const r of quizBySlug.get("contrarian-fortune")!.results) {
  const d: any = r.detailedContent;
  for (const m of d?.humorMetrics ?? []) for (const t of [m.label, m.value]) out[t] = splitIntoPhrases(t, { tableCell: true }) as string[];
}
console.log(JSON.stringify(out, null, 1));
