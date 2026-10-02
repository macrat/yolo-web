import { quizBySlug } from "@/play/quiz/registry";
for (const [slug,q] of quizBySlug as any) {
  const rs=(q.results as any[]); const withLink=rs.filter(r=>r.recommendationLink);
  if(!withLink.length) continue;
  console.log(slug, "results", rs.length, withLink.map(r=>r.id+"->"+r.recommendationLink).join(" "));
}
