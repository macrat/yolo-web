import { getAllQuizSlugs, getResultIdsForQuiz, quizBySlug } from "@/play/quiz/registry";
const out: { slug: string; id: string; title: string }[] = [];
for (const slug of getAllQuizSlugs()) for (const id of getResultIdsForQuiz(slug)) {
  const r = quizBySlug.get(slug)!.results.find((x) => x.id === id)!;
  out.push({ slug, id, title: r.title });
}
console.log(JSON.stringify(out));
