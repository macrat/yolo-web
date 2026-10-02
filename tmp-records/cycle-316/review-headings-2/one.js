const toLines=h=>{const c=[...h.text];const out=[];let s=0;for(const b of [...h.breaks,c.length]){out.push(c.slice(s,b).join(""));s=b;}return out.join("／");};
const [,,re]=process.argv;const R=new RegExp(re);
for(const [lab,f] of [["B16","./data-before-16.json"],["R1","../review-headings/data-after-16.review.json"],["A16","./data-after-16.json"],["B32","./data-before-32.json"],["A32","./data-after-32.json"]])for(const r of require(f)){if(!R.test(r.u))continue;const h=r.headings.find(h=>h.tag==="H1");if(h)console.log(lab,r.w,toLines(h),"wbr",h.wbrAt.join(","))}
