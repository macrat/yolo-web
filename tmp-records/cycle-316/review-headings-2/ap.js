const fs=require("fs");
const src=fs.readFileSync("simanalyze.js","utf8"); const mSrc=src.slice(src.indexOf("const NLS"),src.indexOf("const byKey")); eval(mSrc.replace("function m(","globalThis.m=function(").replace(/const (NLS|NLE|seg|kata) =/g,"globalThis.$1 =").replace("…‥・","…‥—―─・"));
const toLines=h=>{const c=[...h.text];const out=[];let s=0;for(const b of [...h.breaks,c.length]){out.push(c.slice(s,b).join(""));s=b;}return out.join("／");};
const C=require("./data-chromium-16-blog.json"),A=require("./data-after-16.json");const cm=new Map(C.map(r=>[r.u+"@"+r.w,r]));
const w=+process.argv[2];let s={n:0,same:0,better:0,worse:0,eq:0};const T={c:{one:0,kin:0,iw:0,kata:0,lines:0},a:{one:0,kin:0,iw:0,kata:0,lines:0}};const ex=[];
for(const a of A){if(a.g!=="blog"||a.w!==w)continue;const c=cm.get(a.u+"@"+a.w);const h=a.headings.find(h=>h.tag==="H1"),ch=c.headings.find(h=>h.tag==="H1");s.n++;
const la=toLines(h).trim(),lc=toLines(ch).trim();const ma=m(la),mc=m(lc);
for(const [k,mm] of [["a",ma],["c",mc]]){T[k].one+=mm.oneChar;T[k].kin+=mm.kinsoku;T[k].iw+=mm.inWord;T[k].kata+=mm.kataSplit;T[k].lines+=mm.lines}
const sa=ma.oneChar+ma.kinsoku+ma.inWord+ma.kataSplit,sc=mc.oneChar+mc.kinsoku+mc.inWord+mc.kataSplit;
if(la===lc)s.same++;else if(sa<sc){s.better++;ex.push("[better] "+a.u+"\n  A: "+la+"\n  C: "+lc)}else if(sa>sc){s.worse++;ex.push("[WORSE] "+a.u+"\n  A: "+la+"\n  C: "+lc)}else{s.eq++;ex.push("[eq] "+a.u+"\n  A: "+la+"\n  C: "+lc)}}
console.log(w,JSON.stringify(s),JSON.stringify(T));fs.writeFileSync("ap-"+w+".txt",ex.join("\n"));
