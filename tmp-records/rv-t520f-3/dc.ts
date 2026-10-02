import { quizBySlug } from "@/play/quiz/registry";
let n=0; for (const [s,q] of quizBySlug as any){const k=(q.results as any[]).filter(r=>r.detailedContent).length; console.log(s,q.results.length,k); if(k) n++;} console.log(n);
