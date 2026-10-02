const fs=require("fs");
const src=fs.readFileSync("simanalyze.js","utf8"); const mSrc=src.slice(src.indexOf("const NLS"),src.indexOf("const byKey")); eval(mSrc.replace("function m(","globalThis.m=function(").replace(/const (NLS|NLE|seg|kata) =/g,"globalThis.$1 =").replace("…‥・","…‥—―─・"));
const toLines=h=>{const c=[...h.text];const out=[];let s=0;for(const b of [...h.breaks,c.length]){out.push(c.slice(s,b).join(""));s=b;}return out.join("／");};
const [,,file,w,tag]=process.argv;const B=require("../review-headings/data-before-16.json");const bm=new Map(B.map(r=>[r.u+"@"+r.w,r]));
for(const r of require(file)){if(r.g!=="blog"||r.w!==+w)continue;r.headings.forEach((h,i)=>{if(tag&&h.tag!==tag)return;const x=m(toLines(h).trim());if(x.oneChar||x.kinsoku){const bh=bm.get(r.u+"@"+r.w).headings.find(y=>y.text.replace(/\s/g,"")===h.text.replace(/\s/g,""));console.log(r.u,h.tag,JSON.stringify(x),"\n  A:",toLines(h),"\n  B:",bh&&toLines(bh),"\n  wbr",h.wbrAt.join(","))}})}
