import { chromium } from "playwright";
import { readFileSync, writeFileSync } from "node:fs";
const dir = "/home/user/yolo-web/tmp/cycle-316/rv-t4-17";
const slugs = readFileSync(`${dir}/slugs.txt`, "utf8").trim().split("\n");
const base = process.argv[2]; const label = process.argv[3];
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const configs = [[320, 0], [320, 32], [375, 0], [1280, 0], [1280, 32]];
const R = {};
for (const [w, font] of configs) {
  const ctx = await b.newContext({ viewport: { width: w, height: 800 } });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  if (font) await cdp.send("Page.setFontSizes", { fontSizes: { standard: font, fixed: font } });
  await page.addInitScript(() => { window.__cls = 0; new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: "layout-shift", buffered: true }); });
  for (const slug of slugs) {
    const resp = await page.goto(`${base}/blog/${slug}`, { waitUntil: "networkidle" });
    if (!resp || resp.status() !== 200) { R[`${slug} ${w} ${font}`] = { status: resp?.status() }; continue; }
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(400);
    R[`${slug} ${w} ${font}`] = await page.evaluate(() => {
      const prose = document.querySelector("article [class*='prose']") || document.querySelector("[class*='prose']");
      const pr = prose.getBoundingClientRect();
      const tables = [...prose.querySelectorAll(".table-scroll")].map((t) => {
        const cells = [...t.querySelectorAll("th,td")];
        let oneCharLines = [];
        for (const c of cells) {
          const txt = c.textContent.trim(); if ([...txt].length < 2) continue;
          const walker = document.createTreeWalker(c, NodeFilter.SHOW_TEXT);
          const lines = new Map();
          let n;
          while ((n = walker.nextNode())) {
            const s = n.textContent; let i = 0;
            for (const ch of s) { const r = document.createRange(); r.setStart(n, i); r.setEnd(n, i + ch.length); i += ch.length; const rect = r.getBoundingClientRect(); if (!rect.width || /\s/.test(ch)) continue; const k = Math.round(rect.top); lines.set(k, (lines.get(k) || "") + ch); }
          }
          if (lines.size > 1) for (const v of lines.values()) if ([...v].length === 1) oneCharLines.push(txt.slice(0, 30) + " → [" + v + "]");
        }
        return { over: t.scrollWidth - t.clientWidth, scrolls: t.hasAttribute("data-scrolls"), tab: t.getAttribute("tabindex"), w: Math.round(t.getBoundingClientRect().width), left: Math.round(t.getBoundingClientRect().left), cols: t.querySelector("tr")?.children.length, oneCharLines: oneCharLines.slice(0, 6) };
      });
      const pres = [...prose.querySelectorAll("pre")].map((p) => ({ over: p.scrollWidth - p.clientWidth, tab: p.getAttribute("tabindex"), w: Math.round(p.getBoundingClientRect().width) }));
      const p0 = prose.querySelector(":scope > p"); 
      const alerts = [...prose.querySelectorAll(".markdown-alert")].map((a) => ({ w: Math.round(a.getBoundingClientRect().width), title: a.querySelector(".markdown-alert-title")?.textContent, svg: a.querySelectorAll("svg").length }));
      // elements poking out of the prose column (excluding inside scrollers)
      const out = [];
      for (const e of prose.querySelectorAll("*")) { if (e.closest(".table-scroll,pre,.mermaid")) continue; const r = e.getBoundingClientRect(); if (r.width && r.right > pr.right + 1) out.push(e.tagName + "." + (e.className?.baseVal ?? e.className) + " " + Math.round(r.right - pr.right)); }
      return { docOver: document.documentElement.scrollWidth - innerWidth, proseW: Math.round(pr.width), pW: p0 ? Math.round(p0.getBoundingClientRect().width) : null, tables, pres, alerts, out: out.slice(0, 5), cls: +window.__cls.toFixed(4), mermaid: prose.querySelectorAll(".mermaid").length };
    });
  }
  await ctx.close();
}
writeFileSync(`${dir}/metrics-${label}.json`, JSON.stringify(R, null, 1));
await b.close(); console.log("done", label);
