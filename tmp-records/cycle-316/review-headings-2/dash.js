const toL=h=>{const c=[...h.text];const out=[];let s=0;for(const b of [...h.breaks,c.length]){out.push(c.slice(s,b).join(""));s=b;}return out;};
for(const [lab,f] of [["before16","./data-before-16.json"],["after16","./data-after-16.json"],["before32","./data-before-32.json"],["after32","./data-after-32.json"]]){let n=0,only=0;const ex=[];
for(const r of require(f)){for(const h of r.headings||[]){const L=toL(h);L.forEach((l,i)=>{const t=l.trim();if(i>0&&/^(--|[—―─])/.test(t)){n++;if(/^(--|[—―─]+)$/.test(t))only++;if(lab.startsWith("after16"))ex.push(r.w+" "+r.u+" "+h.tag+": "+L.join("／"))}})}}
console.log(lab,"dash-at-line-start",n,"dash-only-lines",only);ex.forEach(e=>console.log("  ",e))}
