import { allPlayContents, getPlayContentsByCategory, playContentBySlug } from "@/play/registry";
import { quizBySlug } from "@/play/quiz/registry";
const ov=(a:string[],b:string[])=>{const s=new Set(a);return b.filter(k=>s.has(k)).length};
const CATS=["fortune","personality","knowledge","game"] as const;
function rec(slug:string, exclude:Set<string>){const cur=playContentBySlug.get(slug)!;const out:string[]=[];
 for(const cat of CATS){ if(cat===cur.category) continue; const cands=getPlayContentsByCategory(cat).filter(c=>!exclude.has(c.slug)); if(!cands.length) continue;
  let best=cands[0],bo=ov(cur.keywords,cands[0].keywords); for(const c of cands.slice(1)){const o=ov(cur.keywords,c.keywords); if(o>bo){best=c;bo=o}} out.push(best.slug);} return out;}
let total=0,hidden=0,noblock=0,affected=0;
for(const q of allPlayContents.filter(c=>c.category==="personality"||c.category==="knowledge")){
 const quiz:any=(quizBySlug as any).get(q.slug);
 const links:string[]=(quiz?.meta.relatedLinks??[]).map((l:any)=>l.href);
 const resTargets=new Set<string>((quiz.results as any[]).map(r=>r.recommendationLink).filter((h:any)=>h&&h.startsWith("/play/")).map((h:string)=>h.replace("/play/","").replace(/\/$/,"")));
 const cand=getPlayContentsByCategory(q.category).filter(c=>c.slug!==q.slug);
 const same=cand.map((c,i)=>({c,i,o:ov(q.keywords,c.keywords)})).sort((a,b)=>b.o-a.o||a.i-b.i).slice(0,3).map(x=>x.c.slug);
 const r0=rec(q.slug,new Set()); const r=rec(q.slug,resTargets);
 const onPage=new Set([...same,...r].map(s=>"/play/"+s));
 const hid=links.filter(l=>onPage.has(l.replace(/\/$/,"")));
 total+=links.length; hidden+=hid.length; if(hid.length) affected++; if(links.length&&hid.length===links.length) noblock++;
 console.log(q.slug,"| links:",links.join(","),"| same:",same.join(","),"| rec(before):",r0.join(","),"| rec(excl):",r.join(","),"| resTargets:",[...resTargets].join(","),"| hidden:",hid.length);
}
console.log({total,hidden,affected,noblock});
