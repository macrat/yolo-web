import { open, close, settle } from "./lib.mjs";
import fs from "node:fs";
const B2 = "http://127.0.0.1:" + fs.readFileSync(new URL("./port2", import.meta.url), "utf8").trim();
for (const [w, f, dark] of [[320,16,false],[320,24,true],[320,32,false],[375,16,true],[375,32,false],[1280,16,false],[1280,32,true]]) {
  const o = await open({ width: w, height: 900, font: f, dark }); const p = o.page;
  await p.goto(B2 + "/play/nakamawake", { waitUntil: "load" }); await settle(p, 800);
  const r = await p.evaluate(() => {
    const out = []; let minGap = 1e9;
    for (const b of document.querySelectorAll("[aria-label='言葉の格子'] button")) {
      const L = []; let lt = null; const tw = document.createTreeWalker(b, NodeFilter.SHOW_TEXT); let n; const br = b.getBoundingClientRect(); const cs = getComputedStyle(b);
      while ((n = tw.nextNode())) for (let i = 0; i < n.data.length; i++) { const r = document.createRange(); r.setStart(n, i); r.setEnd(n, i + 1); const rc = r.getBoundingClientRect(); minGap = Math.min(minGap, rc.left - br.left - parseFloat(cs.borderLeftWidth), br.right - parseFloat(cs.borderRightWidth) - rc.right); const tp = Math.round(rc.top); if (lt === null || Math.abs(tp - lt) > 3) { L.push(""); lt = tp; } L[L.length - 1] += n.data[i]; }
      out.push(L.join("/"));
    }
    const ph = document.querySelector("[aria-label='言葉の格子'] button span span span"); 
    return { cols: getComputedStyle(document.querySelector("[aria-label='言葉の格子'] button").parentElement).gridTemplateColumns.split(" ").length, minGap: Math.round(minGap*10)/10, ws: ph && getComputedStyle(ph).whiteSpace, names: [...document.querySelectorAll("[aria-label='言葉の格子'] button")].map(b=>b.textContent).slice(0,3), out };
  });
  console.log(w, f, dark ? "dark" : "light", JSON.stringify(r));
  await p.getByRole("group", { name: "言葉の格子" }).screenshot({ path: `shots/real34-${w}-${f}-${dark ? "dark" : "light"}.png` });
  await close(o);
}
