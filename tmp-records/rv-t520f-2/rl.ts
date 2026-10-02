import { allPlayContents, getPlayContentsByCategory } from "@/play/registry";
import { getRecommendedContents } from "@/play/recommendation";
import { quizBySlug } from "@/play/quiz/registry";
const ov = (a:string[],b:string[])=>{const s=new Set(a);return b.filter(k=>s.has(k)).length};
for (const q of allPlayContents.filter(c=>c.category==="personality"||c.category==="knowledge")) {
  const quiz:any = (quizBySlug as any).get(q.slug);
  const links = (quiz?.meta.relatedLinks??[]).map((l:any)=>l.href.replace("/play/",""));
  const cand = getPlayContentsByCategory(q.category).filter(c=>c.slug!==q.slug);
  const newRel = cand.map((c,i)=>({c,i,o:ov(q.keywords,c.keywords)})).sort((a,b)=>b.o-a.o||a.i-b.i).slice(0,3).map(x=>x.c.slug);
  const rec = getRecommendedContents(q.slug).map(c=>c.slug);
  const dupNew = links.filter((l:string)=>newRel.includes(l)||rec.includes(l));
  console.log(q.slug, "links", links.join(","), "| dup with lists:", dupNew.join(","));
}
