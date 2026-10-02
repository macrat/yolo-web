const fs=require("fs");
const src=fs.readFileSync("simanalyze.js","utf8"); const mSrc=src.slice(src.indexOf("const NLS"),src.indexOf("const byKey")); eval(mSrc.replace("function m(","globalThis.m=function(").replace(/const (NLS|NLE|seg|kata) =/g,"globalThis.$1 ="));
const toLines=h=>{const c=[...h.text];const out=[];let s=0;for(const b of [...h.breaks,c.length]){out.push(c.slice(s,b).join(""));s=b;}return out.join("／");};
for (const fsz of ["16","32"]) {
 const B=require(`./data-before-${fsz}.json`),A=require(`./data-after-${fsz}.json`);const bm=new Map(B.map(r=>[r.u+"@"+r.w,r]));
 const agg={};const ex=[];
 for(const a of A){const b=bm.get(a.u+"@"+a.w);if(!b)continue;
  a.headings.forEach(h=>{const bh=b.headings.find(x=>x.tag===h.tag&&x.text.replace(/\s/g,"")===h.text.replace(/\s/g,""));if(!bh)return;
   const la=toLines(h).trim(),lb=toLines(bh).trim(); const ma=m(la),mb=m(lb);
   const sa=ma.oneChar+ma.kinsoku+ma.inWord+ma.kataSplit, sb=mb.oneChar+mb.kinsoku+mb.inWord+mb.kataSplit;
   const k=`${a.g} ${a.w}`;const g=(agg[k]??={same:0,better:0,worse:0,kataB:0,kataA:0});g.kataB+=mb.kataSplit;g.kataA+=ma.kataSplit;
   if(la===lb)g.same++;else if(sa<sb)g.better++;else if(sa>sb){g.worse++;ex.push(`${k} ${a.u} ${h.tag}\n  A: ${la}\n  B: ${lb}`);}else g.same++;});}
 console.log("size",fsz);for(const[k,v]of Object.entries(agg))if(v.better||v.worse||v.kataA||v.kataB)console.log(" ",k,JSON.stringify(v));
 fs.writeFileSync(`cmp-worse-${fsz}.txt`,ex.join("\n"));console.log(" worse total",ex.length);
}
