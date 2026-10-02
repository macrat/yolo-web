import { allPlayContents, PLAY_FEATURED_ITEMS } from "@/play/registry";
import { getPlayRecommendationsForDictionary } from "@/play/recommendation";
const ov=(a:string[],b:string[])=>{const s=new Set(a);return b.filter(k=>s.has(k)).length};
for (const [d,tags] of [["kanji",["漢字"]],["yoji",["四字熟語"]],["colors",["伝統色","色"]]] as const){
 const sc=allPlayContents.map(c=>({s:c.slug,o:ov([...tags],c.keywords)})).filter(x=>x.o>0).sort((a,b)=>b.o-a.o);
 console.log(d,"now:",getPlayRecommendationsForDictionary(d).map(c=>c.slug).join(","),"| scored:",sc.map(x=>x.s+"("+x.o+")").join(","));
}
console.log("featured:",PLAY_FEATURED_ITEMS.map(x=>x.slug).join(","));
