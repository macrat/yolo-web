import { getAllQuizSlugs, quizBySlug } from "../src/play/quiz/registry";
import { splitIntoPhrases } from "../src/lib/phrase-breaks";
import { wordStartsOf } from "../src/lib/word-starts";
const out: Record<string, unknown> = {};
for (const s of getAllQuizSlugs()) {
  const t = quizBySlug.get(s)!.meta.title;
  out[t] = { phrases: splitIntoPhrases(t), words: wordStartsOf(t) };
}
for (const t of ["ホーム", "遊び", "結果"]) out[t] = { phrases: [t], words: wordStartsOf(t) };
console.log(JSON.stringify(out, null, 1));
