// §12 check from the frontend-design skill: compare layout rects with Web fonts blocked vs loaded.
// States: none (all /__f/ fonts blocked), zen (only heading font), all (everything loaded).
// usage: node rects.mjs <base> <path>...
import { chromium } from "/home/user/yolo-web/node_modules/playwright/index.mjs";
const [, , base, ...paths] = process.argv;
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--no-sandbox"] });
async function snap(p, allow) {
  const ctx = await browser.newContext({ viewport: { width: 412, height: 823 }, deviceScaleFactor: 1.75, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  await page.route("**/__f/**", (r) => (allow(r.request().url()) ? r.continue() : r.abort()));
  await page.goto(base + encodeURI(p), { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1500);
  const r = await page.evaluate(() => {
    const out = [];
    const els = document.querySelectorAll("main h1,main h2,main h3,main p,main li,main dt,main dd,main td,main th,main label,main button,main a,main figcaption,main blockquote,footer,main section");
    els.forEach((e, i) => { const b = e.getBoundingClientRect(); out.push([e.tagName, Math.round(b.top + scrollY), Math.round(b.height), Math.round(b.width)]); });
    return { docH: document.documentElement.scrollHeight, els: out };
  });
  await ctx.close();
  return r;
}
function diff(a, b) {
  let moved = 0, resized = 0, maxDy = 0, hMoved = 0, pResized = 0, n = Math.min(a.els.length, b.els.length);
  for (let i = 0; i < n; i++) {
    const [t, y1, h1] = a.els[i], [, y2, h2] = b.els[i];
    if (Math.abs(y2 - y1) > 1) { moved++; maxDy = Math.max(maxDy, Math.abs(y2 - y1)); }
    if (Math.abs(h2 - h1) > 1) { resized++; if (/^(P|LI|DD|TD)$/.test(t)) pResized++; if (/^H[1-3]$/.test(t)) hMoved++; }
  }
  return { els: n, moved, resized, paraResized: pResized, headResized: hMoved, maxDy, docH: [a.docH, b.docH] };
}
for (const p of paths) {
  const none = await snap(p, () => false);
  const zen = await snap(p, (u) => /\/__f\/zen-/.test(u));
  const zy = await snap(p, (u) => /\/__f\/(zen-|yolos-)/.test(u));
  const all = await snap(p, () => true);
  console.log(JSON.stringify({ path: p, "none→zen(heading swap)": diff(none, zen), "zen→zen+latin": diff(zen, zy), "zen+latin→all(BIZ swap)": diff(zy, all), "none→all": diff(none, all) }));
}
await browser.close();
