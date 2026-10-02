import { open, close, settle, URL, BASE, SEEDS } from "./lib.mjs";
for (const [a,b] of [[[320,568],[568,320]],[[375,667],[667,375]]]) {
const o = await open({ width: a[0], height: a[1], font: 32, storage: SEEDS.won }); const p = o.page;
await p.goto(URL, { waitUntil: "load" }); await settle(p, 500);
await p.goto(BASE + "/play/kanji-kanaru", { waitUntil: "load" });
await p.goto(URL, { waitUntil: "load" }); await settle(p, 800);
await p.locator("#nakamawake-share").evaluate((e) => e.scrollIntoView({ block: "center" }));
const info = () => p.evaluate(() => { const s = document.querySelector("#nakamawake-share"); return { y: Math.round(scrollY), share: Math.round(s.getBoundingClientRect().top), h: document.documentElement.scrollHeight, grid: Math.round(document.querySelector("main h1").getBoundingClientRect().top) }; });
console.log(a, await info());
await p.setViewportSize({ width: b[0], height: b[1] }); await p.waitForTimeout(800);
console.log(b, await info());
const res = await p.evaluate(() => { const s = document.querySelector("#nakamawake-share"); const sec = [...document.querySelectorAll("main section, main h2")].map(e=>e.tagName+":"+(e.textContent||"").slice(0,15)+"@"+Math.round(e.getBoundingClientRect().top)); return sec.slice(0,8); });
console.log(res);
await close(o);}
