const L=require('./lib');(async()=>{const b=await L.launch();const p=await b.newPage({viewport:{width:375,height:667}});
await p.goto('http://localhost:3456/play/character-personality');await L.solve(p,()=>0);await p.waitForTimeout(500);
console.log(await p.evaluate(()=>scrollY));
console.log(await p.evaluate(()=>document.querySelector('main').innerHTML.replace(/class="[^"]*"/g,m=>m).slice(0,7000)));await b.close();})();
