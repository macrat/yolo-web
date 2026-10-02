import { chromium } from "/home/user/yolo-web/node_modules/playwright/index.mjs";
import fs from "node:fs";
const BASE = "http://localhost:3917";
const OUT = "/home/user/yolo-web/tmp/cycle-316/review-t4-15a";
const results = [];
async function ctxFor(scale, scheme, width, height) {
  const dir = `${OUT}/prof-${scale}-${Date.now()}`;
  fs.mkdirSync(`${dir}/Default`, { recursive: true });
  if (scale === 200) fs.writeFileSync(`${dir}/Default/Preferences`, JSON.stringify({ webkit: { webprefs: { default_font_size: 32 } } }));
  return chromium.launchPersistentContext(dir, { executablePath: "/opt/pw-browsers/chromium", viewport: { width, height }, colorScheme: scheme, timeout: 30000 });
}
const lengths = [0, 7, 1234, 123456, 1234567];
for (const scale of [100, 200]) for (const scheme of ["light", "dark"]) for (const [w, h] of [[320, 568], [375, 667], [1280, 800]]) {
  const ctx = await ctxFor(scale, scheme, w, h);
  const page = ctx.pages()[0] ?? (await ctx.newPage());
  page.setDefaultTimeout(20000);
  await page.goto(`${BASE}/tools/char-count`, { waitUntil: "load", timeout: 30000 });
  await page.evaluate(() => document.fonts.ready);
  for (const n of lengths) {
    const ta = page.getByRole("textbox", { name: "数えるテキスト" });
    await ta.fill(n === 0 ? "" : "あ".repeat(Math.min(n, 1234567)));
    await page.waitForTimeout(150);
    const m = await page.evaluate(() => {
      const root = getComputedStyle(document.documentElement).fontSize;
      const box = document.querySelector('section[aria-label], section[aria-labelledby]');
      const region = document.querySelector("p[data-step]").closest("section");
      const num = region.querySelector("p[data-step]");
      const nr = num.getBoundingClientRect(), br = region.getBoundingClientRect();
      const lineCount = (() => { const r = document.createRange(); r.selectNodeContents(num); return new Set([...r.getClientRects()].map(x => Math.round(x.top))).size; })();
      // frames: ancestors with border between textarea and body
      const ta = document.querySelector("textarea");
      const framed = []; let e = ta.parentElement; while (e && e !== document.body) { const cs = getComputedStyle(e); if (parseFloat(cs.borderTopWidth) > 0 && cs.borderTopStyle !== "none") framed.push(e.className); e = e.parentElement; }
      const inner = []; region.querySelectorAll("*").forEach(x => { const cs = getComputedStyle(x); if (parseFloat(cs.borderLeftWidth) > 0 && cs.borderLeftStyle !== "none") inner.push(x.tagName + "." + x.className + ":" + cs.borderLeftWidth); });
      const rows = [...region.querySelectorAll("tr")].map(tr => { const th = tr.querySelector("th"), td = tr.querySelector("td"); const lines = (el) => { const out = []; const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); let t; const map = new Map(); while ((t = walker.nextNode())) { for (let i = 0; i < t.length; i++) { const r = document.createRange(); r.setStart(t, i); r.setEnd(t, i + 1); const rc = r.getClientRects()[0]; if (!rc) continue; const k = Math.round(rc.top); map.set(k, (map.get(k) || "") + t.data[i]); } } return [...map.values()]; }; return { th: lines(th), td: lines(td), gap: Math.round(td.getBoundingClientRect().left - th.getBoundingClientRect().right), thR: Math.round(th.getBoundingClientRect().right), tdR: Math.round(td.getBoundingClientRect().right) }; });
      const tbl = region.querySelector("table").getBoundingClientRect();
      return { root, step: num.dataset.step, fs: getComputedStyle(num).fontSize, sw: num.scrollWidth, cw: num.clientWidth, numRight: Math.round(nr.right), boxRight: Math.round(br.right), lines: lineCount, text: num.textContent, docOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth, framedAroundInput: framed, innerBorders: inner, regionBorder: getComputedStyle(region).borderTopWidth, tableW: Math.round(tbl.width), tableRightOver: Math.round(tbl.right - br.right), rows, status: document.querySelector('[role=status]').textContent };
    });
    results.push({ scale, scheme, w, n, ...m });
    if ([0, 1234, 1234567].includes(n)) await page.screenshot({ path: `${OUT}/shots/cc-${w}-${scale}-${scheme}-${n}.png`, fullPage: false, clip: undefined }).catch(() => {});
    if (n === 1234) { await page.getByRole("region", { name: "数えた結果" }).screenshot({ path: `${OUT}/shots/box-${w}-${scale}-${scheme}.png` }); }
  }
  await ctx.close();
}
fs.writeFileSync(`${OUT}/measure.json`, JSON.stringify(results, null, 1));
console.log("done", results.length);
