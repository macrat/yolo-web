const fs=require("fs");
const src=fs.readFileSync("simanalyze.js","utf8"); const mSrc=src.slice(src.indexOf("const NLS"),src.indexOf("const byKey")); eval(mSrc.replace("function m(","globalThis.m=function(").replace(/const (NLS|NLE|seg|kata) =/g,"globalThis.$1 =").replace("…‥・","…‥—―─・"));
const toLines=h=>{const c=[...h.text];const out=[];let s=0;for(const b of [...h.breaks,c.length]){out.push(c.slice(s,b).join(""));s=b;}return out.join("／");};
const [,,bf,af]=process.argv;const B=require(bf);const bm=new Map(B.map(r=>[r.u+"@"+r.w,r]));const n={};
for(const r of require(af)){const b=bm.get(r.u+"@"+r.w);if(!b)continue;for(const h of r.headings){const bh=b.headings.find(y=>y.tag===h.tag&&y.text.replace(/\s/g,"")===h.text.replace(/\s/g,""));if(!bh)continue;const a=m(toLines(h).trim()),o=m(toLines(bh).trim());
for(const k of ["oneChar","kinsoku","inWord"])if(a[k]>o[k]){n[k]=(n[k]||0)+1;console.log(k,r.w,r.u,h.tag,"\n  A:",toLines(h),"\n  B:",toLines(bh))}}}
console.log(n);
