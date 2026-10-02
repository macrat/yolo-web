const fs=require("fs");
const src=fs.readFileSync("simanalyze.js","utf8"); const mSrc=src.slice(src.indexOf("const NLS"),src.indexOf("const byKey")); eval(mSrc.replace("function m(","globalThis.m=function(").replace(/const (NLS|NLE|seg|kata) =/g,"globalThis.$1 ="));
const toLines=h=>{const c=[...h.text];const out=[];let s=0;for(const b of [...h.breaks,c.length]){out.push(c.slice(s,b).join(""));s=b;}return out.join("／");};
const cnt=(file,w,g="blog",tag="H1")=>{let n=0,hw=0,iw=0,kata=0,one=0;const ex=[];for(const r of require("./"+file)){if(r.g!==g||r.w!==w||!r.headings)continue;for(const h of r.headings){if(h.tag!==tag)continue;n++;const l=toLines(h).trim();const x=m(l);iw+=x.inWord;kata+=x.kataSplit;one+=x.oneChar;if(x.inWord)hw++;if(x.oneChar)ex.push(r.u+"  "+l)}}return {n,headingsWithInWord:hw,inWord:iw,kataSplit:kata,oneChar:one,ex}};
for(const [f,label] of [["data-before-16.json","94f531e"],["data-after-16.review.json","round1"],["data-after-16.json","round2"]]){const c=cnt(f,1280);console.log("blog h1 1280 default",label,JSON.stringify({...c,ex:undefined}))}
for(const [f,label] of [["data-before-32.json","94f531e"],["data-after-32.review.json","round1"],["data-after-32.json","round2"]]){const c=cnt(f,320);console.log("blog h1 320 200%",label,"oneChar lines",c.oneChar,"headings",c.ex.length);if(label==="round2")fs.writeFileSync("r2-onechar-320-32.txt",c.ex.join("\n"))}
// classify one-char lines in blog h1 at 320/200% (round2)
const cls={};const samples={};
for(const r of require("./data-after-32.json")){if(r.g!=="blog"||r.w!==320||!r.headings)continue;for(const h of r.headings){if(h.tag!=="H1")continue;
 const c=[...h.text];const opp=new Set(h.wbrAt);c.forEach((ch,i)=>{if(i>0&&(/\s/.test(c[i-1])||/[」』）)]/.test(c[i-1])))opp.add(i)});
 const bounds=[0,...h.breaks,c.length];
 for(let k=0;k<bounds.length-1;k++){const line=c.slice(bounds[k],bounds[k+1]).join("").trim();if([...line].length!==1)continue;
  const startOk=k===0||opp.has(bounds[k]);const endOk=k===bounds.length-2||opp.has(bounds[k+1]);
  const kind=startOk&&endOk?"phrase-level (both edges at break points)":!startOk&&!endOk?"forced on both sides":!startOk?"forced break before it (tail of an over-wide piece)":"forced break after it (head of an over-wide piece)";
  const sub=/[—―─-]/.test(line)?"dash":/\p{Script=Hiragana}/u.test(line)?"hiragana":/[\p{Script=Han}]/u.test(line)?"kanji":/[\p{Script=Katakana}ー]/u.test(line)?"katakana":"other";
  const key=kind+" / "+sub;cls[key]=(cls[key]||0)+1;(samples[key]??=[]).length<3&&samples[key].push(c.slice(bounds[Math.max(0,k-1)],bounds[Math.min(bounds.length-1,k+2)]).join("")+"  ("+r.u+")");}}}
console.log(cls);console.log(samples);
