import { open, close, settle, URL } from "./lib.mjs";
import fs from "node:fs";
const J = JSON.parse(fs.readFileSync(new globalThis.URL("./phr-all.json", import.meta.url), "utf8"));
const res = {};
for (const f of [16, 20, 24, 32]) {
  const o = await open({ width: 320, height: 800, font: f }); const p = o.page;
  await p.goto(URL, { waitUntil: "load" }); await settle(p, 500);
  for (const w of [320, 375, 1280]) {
    await p.setViewportSize({ width: w, height: 800 }); await p.waitForTimeout(100);
    const hist = {}; let worst = null;
    for (const words of Object.values(J.out)) {
      const r = await p.evaluate((words) => {
        const btns = [...document.querySelectorAll("[aria-label='言葉の格子'] button")];
        const out = [];
        btns.forEach((b, i) => { const mark = b.querySelector("span"); b.replaceChildren(mark); words[i].forEach((x, k) => { if (k) b.append(document.createElement("wbr")); b.append(document.createTextNode(x)); }); });
        const rw = parseFloat(getComputedStyle(btns[0]).borderLeftWidth);
        for (const b of btns) {
          const br = b.getBoundingClientRect(); const rg = document.createRange(); rg.selectNodeContents(b);
          let L = 1e9, R = -1e9; for (const t of [...b.childNodes].filter((n) => n.nodeType === 3)) { const q = document.createRange(); q.selectNodeContents(t); for (const rr of q.getClientRects()) { L = Math.min(L, rr.left); R = Math.max(R, rr.right); } }
          out.push({ w: b.textContent, gap: Math.min(L - br.left, br.right - R) - rw, rw });
        }
        return out;
      }, words);
      for (const c of r) { const k = Math.floor(c.gap); hist[k] = (hist[k] || 0) + 1; if (!worst || c.gap < worst.gap) worst = c; }
    }
    res[`${f}px@${w}`] = { worst, hist };
    console.log(f, w, JSON.stringify(worst), JSON.stringify(hist));
  }
  await close(o);
}
