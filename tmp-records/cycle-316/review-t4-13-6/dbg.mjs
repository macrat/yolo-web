import { open, close, settle, URL, SEEDS } from "./lib.mjs";
const o = await open({ width: 375, height: 667, font: 16, storage: SEEDS.won }); const p = o.page;
await p.goto(URL, { waitUntil: "load" }); await settle(p, 1500);
console.log(JSON.stringify(await p.evaluate(() => window.__pos.slice(0, 12))));
console.log(await p.evaluate(() => [document.getElementById("nakamawake-saved-layout")?.textContent, Object.keys(localStorage)]));
console.log(await p.evaluate(() => [...document.querySelectorAll("main details")].map(d=>d.textContent.slice(0,30)+"@"+Math.round(d.getBoundingClientRect().top))));
await close(o);
