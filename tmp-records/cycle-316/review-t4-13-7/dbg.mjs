import { open, close, settle, URL, SEEDS } from "./lib.mjs";
const [w,h,f,seed]=[+process.argv[2],+process.argv[3],+process.argv[4],process.argv[5]];
const o = await open({ width: w, height: h, font: f, storage: SEEDS[seed] }); const p = o.page;
await p.goto(URL, { waitUntil: "load" }); await settle(p, 1500);
console.log(JSON.stringify(await p.evaluate(() => window.__pos)));
console.log(JSON.stringify(await p.evaluate(() => window.__cls)));
console.log(await p.evaluate(() => [...document.querySelectorAll("main details")].map(d=>d.querySelector("summary")?.textContent.slice(0,20)+"@"+Math.round(d.getBoundingClientRect().top))));
await close(o);
