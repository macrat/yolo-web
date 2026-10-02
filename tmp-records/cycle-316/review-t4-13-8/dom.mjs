import { open, close, settle, BASE } from "./lib.mjs";
const o = await open({ width: 375, height: 667 }); const p = o.page;
for (const g of ["kanji-kanaru", "irodori", "nakamawake"]) {
await p.goto(`${BASE}/play/${g}`, { waitUntil: "load" }); await settle(p, 800);
console.log(g, await p.evaluate(() => { const lg = document.querySelector("main ul[class*=legend]") ; const d = (e, n=0) => e ? e.tagName + "." + (e.className+"").slice(0,40) : "null"; let s = "legend:" + d(lg) + " parent:" + d(lg?.parentElement) + " parentNext:" + d(lg?.parentElement?.nextElementSibling); const h1 = document.querySelector("main h1"); s += " | h1 parent:" + d(h1.parentElement) + " sibs:" + [...h1.parentElement.parentElement.children].map(c=>d(c)).join(","); return s; }));
}
await close(o);
