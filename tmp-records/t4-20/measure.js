const L=require('./lib');const types=require('./types.json');
(async()=>{const b=await L.launch();
// headings from result pages
const hp=await b.newPage();const heads={};
for(const t of types){await hp.goto('http://localhost:3456/play/character-personality/result/'+t.id);heads[t.id]=await hp.$eval('h1',e=>e.innerHTML);}
const res={};
for(const [w,h] of [[375,667],[1280,800]]) for(const cs of ['light','dark']){
 const ctx=await b.newContext({viewport:{width:w,height:h},colorScheme:cs});const p=await ctx.newPage();
 await p.goto('http://localhost:3456/play/character-personality');await L.solve(p,()=>0);await p.waitForTimeout(600);
 const sy=await p.evaluate(()=>scrollY);
 const measure=()=>p.evaluate(()=>{const box=document.querySelector('section[tabindex="-1"]');box.scrollIntoView({block:'start',behavior:'instant'});
  const r=e=>{const x=e.getBoundingClientRect();return Math.round(x.top)+'〜'+Math.round(x.bottom)};
  const h2=box.querySelector('h2');const cap=box.querySelector('p');const body=box.querySelector('[class*=body]');
  const save=[...document.querySelectorAll('button')].find(b=>b.textContent==='画像を保存');
  const sh=document.querySelector('[class*=shareHeading]');
  // line breaks of h2
  const tn=[];const walk=n=>{for(const c of n.childNodes){if(c.nodeType==3)tn.push(c);else walk(c)}};walk(h2);
  let lines=[],cur='',lastTop=null;for(const t of tn)for(let i=0;i<t.length;i++){const rg=document.createRange();rg.setStart(t,i);rg.setEnd(t,i+1);const rc=rg.getClientRects()[0];if(!rc)continue;const top=Math.round(rc.top);if(lastTop!==null&&top>lastTop+4){lines.push(cur);cur=''}cur+=t.data[i];lastTop=top;}lines.push(cur);
  return {caption:r(cap),box:r(box),boxH:Math.round(box.getBoundingClientRect().height),h2:r(h2),body:r(body),shareHeading:r(sh),save:r(save),lines:lines.join('／'),saveBottom:Math.round(save.getBoundingClientRect().bottom),scrollY:scrollY};});
 const base=await measure();
 const per=[];
 for(const t of types){await p.evaluate(([hh,c,d])=>{const box=document.querySelector('section[tabindex="-1"]');box.querySelector('h2').innerHTML=hh;const ps=box.querySelectorAll('[class*=body] p');ps[0].textContent=c;ps[1].textContent=d;},[heads[t.id],t.catch,t.desc]);
  const m=await measure();per.push({id:t.id,...m});}
 res[w+cs]={arrivalScroll:sy,base,per};await ctx.close();}
require('fs').writeFileSync(__dirname+'/measure.json',JSON.stringify(res,null,1));await b.close();})();
