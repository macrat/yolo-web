import { getAllQuizSlugs, getResultIdsForQuiz, quizBySlug } from "../src/play/quiz/registry";
const out: Record<string, { type: string; ids: string[]; detailed: string[]; metrics: string[] }> = {};
for (const s of getAllQuizSlugs()) {
  const q = quizBySlug.get(s)!;
  out[s] = {
    type: q.meta.type,
    ids: getResultIdsForQuiz(s),
    detailed: q.results.filter((r) => r.detailedContent).map((r) => r.id),
    metrics: q.results.filter((r: any) => r.detailedContent?.humorMetrics?.length).map((r) => r.id),
  };
}
console.log(JSON.stringify(out, null, 1));
