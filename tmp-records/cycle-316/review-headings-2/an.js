const fs=require("fs");
const src=fs.readFileSync("simanalyze.js","utf8"); const mSrc=src.slice(src.indexOf("const NLS"),src.indexOf("const byKey")); eval(mSrc.replace("function m(","globalThis.m=function(").replace(/const (NLS|NLE|seg|kata) =/g,"globalThis.$1 =").replace("…‥・","…‥—―─・"));
const toLines=h=>{const c=[...h.text];const out=[];let s=0;for(const b of [...h.breaks,c.length]){out.push(c.slice(s,b).join(""));s=b;}return out.join("／");};
const [,,bf,af,tagOnly]=process.argv;
const B=require(bf),A=require(af);const bm=new Map(B.map(r=>[r.u+"@"+r.w,r]));
const agg={};const ex=[];
for(const a of A){const b=bm.get(a.u+"@"+a.w);if(!b||!a.headings||!b.headings)continue;
 a.headings.forEach(h=>{if(tagOnly&&h.tag!==tagOnly)return;const norm=s=>s.replace(/\s/g,"");const bh=b.headings.find(x=>x.tag===h.tag&&norm(x.text)===norm(h.text));const k=`${a.g} ${a.w}`;const g=(agg[k]??={n:0,unmatched:0,same:0,better:0,worse:0,oneB:0,oneA:0,kinB:0,kinA:0,iwB:0,iwA:0,ovB:0,ovA:0});g.n++;if(!bh){g.unmatched++;return;}
  const la=toLines(h).trim(),lb=toLines(bh).trim(); const ma=m(la),mb=m(lb);
  g.oneB+=mb.oneChar;g.oneA+=ma.oneChar;g.kinB+=mb.kinsoku;g.kinA+=ma.kinsoku;g.iwB+=mb.inWord;g.iwA+=ma.inWord;g.ovB+=bh.overflow?1:0;g.ovA+=h.overflow?1:0;
  const sa=ma.oneChar+ma.kinsoku+ma.inWord+ma.kataSplit+(h.overflow?5:0), sb=mb.oneChar+mb.kinsoku+mb.inWord+mb.kataSplit+(bh.overflow?5:0);
  if(la===lb)g.same++;else if(sa<sb)g.better++;else if(sa>sb){g.worse++;ex.push(`${k} ${a.u} ${h.tag}\n  A: ${la}  ${JSON.stringify(ma)}\n  B: ${lb}  ${JSON.stringify(mb)}\n  wbr: ${h.wbrAt}`);}else g.same++;});}
for(const[k,v]of Object.entries(agg))console.log(k,JSON.stringify(v));
console.log("WORSE",ex.length);console.log(ex.join("\n"));
