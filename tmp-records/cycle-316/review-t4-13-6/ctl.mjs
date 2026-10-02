import { open, close, settle, URL } from "./lib.mjs";
for (const [w,h,f,d] of [[375,667,16,true],[1280,800,32,false]]) {
const o = await open({ width: w, height: h, font: f, dark: d }); const p = o.page;
await p.goto(URL, { waitUntil: "load" }); await settle(p, 600);
const c = p.getByRole("button", { name: "チェック" }); await c.evaluate(e=>e.scrollIntoView({block:"center"}));
await p.screenshot({ path: `shots/ctl-${w}-${f}-${d?"d":"l"}.png` }); await close(o);}
