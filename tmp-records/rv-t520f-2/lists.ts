import { allPlayContents, getPlayContentsByCategory, playContentBySlug } from "@/play/registry";
import { getRecommendedContents, getResultNextContents } from "@/play/recommendation";
import { toPlayListItems } from "@/play/listItems";
const quizzes = allPlayContents.filter(c => c.category !== "game" && c.category !== "fortune");
let dupCross=0, totCross=0, sameIn=0;
const out:any = {};
for (const q of quizzes) {
  const next = getResultNextContents(q.slug).map(c=>c.slug);
  const rel = getPlayContentsByCategory(q.category).filter(c=>c.slug!==q.slug).slice(0,3).map(c=>c.slug);
  const rec = getRecommendedContents(q.slug).map(c=>c.slug);
  const cand = getPlayContentsByCategory(q.category).filter(c=>c.slug!==q.slug);
  const ov = (a:string[],b:string[])=>{const s=new Set(a);return b.filter(k=>s.has(k)).length};
  const sorted = cand.map((c,i)=>({c,i,o:ov(q.keywords,c.keywords)})).sort((a,b)=>b.o-a.o||a.i-b.i).slice(0,3).map(x=>x.c.slug+"("+x.o+")");
  next.slice(1).forEach(s=>{totCross++; if(rec.includes(s)) dupCross++;});
  if (rel.includes(next[0])) sameIn++;
  out[q.slug]={cat:q.category,next,rel,rec,newRel:sorted};
}
console.log(JSON.stringify(out,null,1));
console.log({n:quizzes.length,dupCross,totCross,sameIn});
console.log(allPlayContents.map(c=>c.slug+":"+c.category).join(" "));
console.log(JSON.stringify(toPlayListItems([playContentBySlug.get("kanji-kanaru")!]),null,1));
