import { allPlayContents, getPlayContentsByCategory } from "@/play/registry";
import { getRecommendedContents, getResultNextContents } from "@/play/recommendation";
const ov = (a:string[],b:string[])=>{const s=new Set(a);return b.filter(k=>s.has(k)).length};
const rows:string[]=[];
for (const q of allPlayContents.filter(c=>c.category==="personality"||c.category==="knowledge")) {
  const next = getResultNextContents(q.slug).map(c=>c.slug);
  const rel = getPlayContentsByCategory(q.category).filter(c=>c.slug!==q.slug).slice(0,3).map(c=>c.slug);
  const rec = getRecommendedContents(q.slug).map(c=>c.slug);
  const cand = getPlayContentsByCategory(q.category).filter(c=>c.slug!==q.slug);
  const newRel = cand.map((c,i)=>({c,i,o:ov(q.keywords,c.keywords)})).sort((a,b)=>b.o-a.o||a.i-b.i).slice(0,3).map(x=>x.c.slug);
  const a=(x:string[])=>`[${x.map(s=>`'${s}'`).join(",")}]`;
  rows.push(`STRUCT('${q.slug}' AS slug, ${a(next)} AS nxt, ${a(rel)} AS rel, ${a(rec)} AS rec, ${a(newRel)} AS newrel)`);
}
console.log(rows.join(",\n"));
