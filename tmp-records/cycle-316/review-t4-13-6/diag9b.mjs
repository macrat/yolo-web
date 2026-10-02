import { open, close, settle, URL, SEEDS } from "./lib.mjs";
const o = await open({ width: 320, height: 568, font: 32, storage: SEEDS.mid }); const p = o.page;
await p.goto(URL, { waitUntil: "load" }); await settle(p);
await p.getByRole("button", { name: "チェック" }).evaluate((b) => b.scrollIntoView({ block: "center" })); await p.waitForTimeout(300);
await p.addInitScript(() => { window.__h = []; const t0 = performance.now(); const tick = () => { const m = document.querySelector("main"); const st=document.querySelector("[role=status]"); window.__h.push([Math.round(performance.now()-t0), Math.round(scrollY), m ? Math.round(m.getBoundingClientRect().top + scrollY) : null, st?Math.round(st.getBoundingClientRect().top+scrollY)+"/"+Math.round(st.getBoundingClientRect().height):null, document.readyState]); if (performance.now()-t0<2500) requestAnimationFrame(tick); }; requestAnimationFrame(tick); });
await p.reload({ waitUntil: "load" }); await settle(p, 2000);
const h = await p.evaluate(() => window.__h);
let last=""; for (const r of h) { const k=r.slice(1).join(); if(k!==last){console.log(r.join(" "));last=k;} }
await close(o);
