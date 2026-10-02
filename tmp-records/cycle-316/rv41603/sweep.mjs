import { chromium } from "/home/user/yolo-web/node_modules/playwright/index.mjs";
import { readFileSync, writeFileSync } from "node:fs";
const urls = readFileSync("/home/user/yolo-web/tmp/rv41603-pick.txt","utf8").trim().split("\n");
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const out = [];
function measure() {
  const btns = [...document.querySelectorAll("button")].filter(e => /Button-module/.test(e.className) || getComputedStyle(e).overflowWrap === "anywhere");
  return { n: btns.length, doc: document.documentElement.scrollHeight, docW: document.documentElement.scrollWidth - document.documentElement.clientWidth, b: btns.map(e => { const r = e.getBoundingClientRect(); const rg=document.createRange(); rg.selectNodeContents(e); const lines=new Set([...rg.getClientRects()].filter(x=>x.width>0).map(x=>Math.round(x.top))).size; return [e.textContent.trim().slice(0,30), +r.left.toFixed(1), +(r.top+scrollY).toFixed(1), +r.width.toFixed(1), +r.height.toFixed(1), lines]; }) };
}
for (const w of [320, 375]) for (const f of [16, 32]) {
  const ctx = await b.newContext({ viewport: { width: w, height: 800 } });
  const p = await ctx.newPage();
  const cdp = await ctx.newCDPSession(p);
  for (const u of urls) {
    try {
      await cdp.send("Page.setFontSizes", { fontSizes: { standard: f, fixed: f } });
      await p.goto("http://localhost:3591" + u, { waitUntil: "load", timeout: 30000 });
      await p.waitForTimeout(400);
      await cdp.send("Page.setFontSizes", { fontSizes: { standard: f, fixed: f } });
      await p.waitForTimeout(100);
      const a = await p.evaluate(measure);
      await p.addStyleTag({ content: "button{overflow-wrap:normal !important}" });
      await p.waitForTimeout(50);
      const c = await p.evaluate(measure);
      const diffs = [];
      a.b.forEach((x, i) => { const y = c.b[i]; if (!y) return; if (x.slice(1).some((v, j) => Math.abs(v - y[j+1]) > 0.5)) diffs.push({ now: x, without: y }); });
      if (diffs.length || a.doc !== c.doc || a.docW !== c.docW) out.push({ u, w, f, doc: [a.doc, c.doc], docW: [a.docW, c.docW], diffs });
    } catch (e) { out.push({ u, w, f, err: String(e).slice(0, 100) }); }
  }
  await ctx.close();
}
await b.close();
writeFileSync("/home/user/yolo-web/tmp/cycle-316/rv41603/sweep.json", JSON.stringify(out, null, 1));
console.log(out.length);
