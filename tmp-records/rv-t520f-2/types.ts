import { quizBySlug } from "@/play/quiz/registry";
for (const [s,q] of quizBySlug as any) console.log(s, q.results.length, "detailed:", q.results.filter((r:any)=>r.detailedContent).length, "faq:", (q.meta.faq??[]).length);
