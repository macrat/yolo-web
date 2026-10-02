const L=require('./lib');const B='http://localhost:3456';
const solveAny=async p=>{await p.click('text=はじめる');for(let i=0;i<80;i++){if(await p.evaluate(()=>document.body.innerText.includes('もう一度')))break;
 const bs=p.locator('main button:not([aria-label*="シェア"]):visible');const texts=await bs.allTextContents();let k=texts.findIndex(t=>/次/.test(t));if(k<0)k=0;await bs.nth(k).click();await p.waitForTimeout(150);}await p.waitForTimeout(700);};
const surfaces=[
 ['cp-solved','/play/character-personality',async p=>{await solveAny(p)},false],
 ['cp-result','/play/character-personality/result/blazing-poet',null,true],
 ['kanji-level-solved','/play/kanji-level',async p=>{await solveAny(p)},false],
 ['fortune-daily','/play/daily',null,true],
 ['tool-bmi','/tools/bmi-calculator',async p=>{const ins=p.locator('main input');const n=await ins.count();const v=['170','65'];for(let i=0;i<Math.min(n,2);i++)await ins.nth(i).fill(v[i]);await p.click('text=計算する');await p.waitForTimeout(400)},true],
 ['game-irodori','/play/irodori',null,true],['game-kanji-kanaru','/play/kanji-kanaru',null,true],['game-nakamawake','/play/nakamawake',null,true],['game-yoji-kimeru','/play/yoji-kimeru',null,true],
 ['blog','/blog/does-personality-quiz-see-your-answers',null,false]];
(async()=>{const b=await L.launch();const only=process.argv[2];
for(const [name,u,act,full] of surfaces){if(only&&name!==only)continue;for(const [w,h] of [[375,667],[1280,800]])for(const cs of ['light','dark']){
 const ctx=await b.newContext({viewport:{width:w,height:h},colorScheme:cs});const p=await ctx.newPage();
 try{await p.goto(B+u,{waitUntil:'networkidle'});if(act)await act(p);await p.waitForTimeout(400);
 const f=`${__dirname}/${name}-${w}-${cs}.png`;await p.screenshot({path:f,fullPage:full});
 const ov=await p.evaluate(()=>document.documentElement.scrollWidth-innerWidth);console.log(name,w,cs,'hscroll',ov);}catch(e){console.log(name,w,cs,'ERR',e.message.split('\n')[0])}
 await ctx.close();}}
await b.close();})();
