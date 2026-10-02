const r=require('./measure.json');const L=require('./lib');const types=require('./types.json');
(async()=>{const b=await L.launch();const p=await b.newPage();const bad=[];
for(const t of types){await p.goto('http://localhost:3456/play/character-personality/result/'+t.id);const ph=await p.$eval('h1',e=>e.innerHTML.split(/<wbr\/?>/));
 const bounds=new Set();let s=0;for(const x of ph){s+=x.replace(/<[^>]+>/g,'').length;bounds.add(s)}
 for(const k of ['375light','1280light']){const x=r[k].per.find(y=>y.id===t.id);let s2=0;const ls=x.lines.split('／');for(const l of ls.slice(0,-1)){s2+=l.length;if(!bounds.has(s2))bad.push(k+' '+t.id+' '+x.lines)}
  if(ls.some(l=>l.length===1))bad.push('1char '+k+' '+t.id)}
 if(t.id==='dreaming-canvas')console.log(ph.join('|'));}
console.log(bad);await b.close();})();
