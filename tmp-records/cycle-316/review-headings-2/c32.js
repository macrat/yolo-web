const cls={};const samples={};
for(const [lab,f] of [["before","../review-headings/data-before-32.json"],["after","./data-after-32.json"]]){const cls={};const samples={};
for(const r of require(f)){if(!r.headings)continue;for(const h of r.headings){
 const c=[...h.text];const opp=new Set(h.wbrAt);c.forEach((ch,i)=>{if(i>0&&(/\s/.test(c[i-1])||/[」』）)]/.test(c[i-1])))opp.add(i)});
 const bounds=[0,...h.breaks,c.length];
 for(let k=0;k<bounds.length-1;k++){const line=c.slice(bounds[k],bounds[k+1]).join("").trim();if([...line].length!==1)continue;
  const startOk=k===0||opp.has(bounds[k]);const endOk=k===bounds.length-2||opp.has(bounds[k+1]);
  const kind=startOk&&endOk?"phrase-level":"forced";const key=r.g+" "+r.w+" "+kind;cls[key]=(cls[key]||0)+1;if(kind==="phrase-level"&&lab==="after")(samples[key]??=[]).length<4&&samples[key].push(c.slice(bounds[Math.max(0,k-1)],bounds[Math.min(bounds.length-1,k+2)]).join("")+" ("+r.u+" "+h.tag+")");}}}
console.log(lab,JSON.stringify(cls));if(lab==="after")console.log(samples)}
