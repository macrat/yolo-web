import { chromium } from "playwright";
import fs from "node:fs";
const B = "http://localhost:3371";
const OUT = "/home/user/yolo-web/tmp/cycle-316/rv35r3/";
const seed = fs.readFileSync("/home/user/yolo-web/tmp/cycle-316/rv35r3-urls.txt", "utf8").split("\n").filter(Boolean);
const extra = ["/dictionary/kanji", "/storybook", "/storybook/list/0", "/storybook/list/11", "/storybook/list/100", "/storybook/list/101", "/play", "/blog", "/blog/page/2"];
const OVERRIDE = `[class*="ItemList-module"][class$="__name"],[class*="ItemList-module"][class$="__reading"]{min-width:auto !important}`;

function measureFn() {
  const res = { sw: document.documentElement.scrollWidth, vw: innerWidth, rows: 0, bad: [], rects: [] };
  const lists = document.querySelectorAll('[data-text-box="rows"]');
  for (const list of lists) {
    const walls = [];
    for (let a = list; a && a !== document.body; a = a.parentElement) {
      const cs = getComputedStyle(a);
      const bl = parseFloat(cs.borderLeftWidth), br = parseFloat(cs.borderRightWidth);
      if (bl >= 3 && br >= 3) { const r = a.getBoundingClientRect(); walls.push({ l: r.left + bl, r: r.right - br, tag: a.tagName + "." + a.className.slice(0, 30) }); }
    }
    for (const li of list.children) {
      const rr = li.getBoundingClientRect();
      if (rr.width === 0 || li.getClientRects().length === 0 || li.closest("details:not([open])")) continue;
      res.rows++;
      const name = (li.querySelector("a")?.textContent || "").slice(0, 50);
      const check = (r, what) => {
        if (r.width === 0 && r.height === 0) return;
        if (r.right > rr.right + 0.5 || r.left < rr.left - 0.5) { res.bad.push({ name, what, why: "row", r: Math.round(r.right), lim: Math.round(rr.right) }); return; }
        for (const w of walls) if (r.right > w.r + 0.5 || r.left < w.l - 0.5) { res.bad.push({ name, what, why: w.tag, r: Math.round(r.right), lim: Math.round(w.r) }); return; }
      };
      if (rr.right > innerWidth + 0.5) res.bad.push({ name, what: "LI", why: "viewport" });
      for (const w of walls) if (rr.right > w.r + 0.5 || rr.left < w.l - 0.5) res.bad.push({ name, what: "LI", why: w.tag, r: rr.right, lim: w.r });
      const tw = document.createTreeWalker(li, NodeFilter.SHOW_TEXT);
      let n;
      while ((n = tw.nextNode())) {
        if (!n.textContent.trim()) continue;
        const rg = document.createRange(); rg.selectNodeContents(n);
        for (const r of rg.getClientRects()) check(r, "text:" + n.textContent.slice(0, 20));
      }
      for (const e of li.querySelectorAll("*")) {
        check(e.getBoundingClientRect(), e.tagName + "." + (e.className?.baseVal ?? e.className).toString().replace(/.*__/, ""));
        if (e.scrollWidth > e.clientWidth + 1 && getComputedStyle(e).display !== "inline") res.bad.push({ name, what: e.tagName, why: "scrollWidth", r: e.scrollWidth, lim: e.clientWidth });
      }
      res.rects.push([...li.querySelectorAll("*")].map((e) => { const r = e.getBoundingClientRect(); return [Math.round(r.x * 10), Math.round(r.y * 10), Math.round(r.width * 10), Math.round(r.height * 10)].join(","); }).join(";") + "|" + [rr.x, rr.y, rr.width, rr.height].map((v) => Math.round(v * 10)).join(","));
    }
  }
  return res;
}

const [widthArg, fontArg, mode] = process.argv.slice(2);
const W = +widthArg, F = +fontArg;
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const queue = [...new Set([...extra, ...seed])];
const seen = new Set(queue);
const results = {};
let idx = 0;
async function worker() {
  const ctx = await browser.newContext({ viewport: { width: W, height: 900 } });
  const p = await ctx.newPage();
  const cdp = await ctx.newCDPSession(p);
  await cdp.send("Page.enable");
  await cdp.send("Page.setFontSizes", { fontSizes: { standard: F, fixed: Math.round(F * 13 / 16) } });
  while (idx < queue.length) {
    const path = queue[idx++];
    try {
      const resp = await p.goto(B + path, { waitUntil: "load", timeout: 30000 });
      await p.evaluate(() => document.fonts.ready.then(() => 0));
      const rootFs = await p.evaluate(() => getComputedStyle(document.documentElement).fontSize);
      const links = await p.evaluate(() => [...document.querySelectorAll("a[href]")].map((a) => a.getAttribute("href")).filter((h) => h.startsWith("/") && /\/page\/\d+$/.test(h.split("?")[0])));
      for (const l of links) { const c = l.split("?")[0]; if (!seen.has(c)) { seen.add(c); queue.push(c); } }
      if (path === "/dictionary/kanji") {
        const ks = await p.evaluate(() => [...document.querySelectorAll("a[href]")].map((a) => a.getAttribute("href")).filter((h) => /^\/dictionary\/kanji\/(grade|radical|stroke|page)\//.test(h)));
        for (const l of ks) if (!seen.has(l)) { seen.add(l); queue.push(l); }
      }
      const m = await p.evaluate(measureFn);
      if (m.rows === 0) { results[path] = { status: resp?.status(), rootFs, rows: 0, sw: m.sw }; continue; }
      const r = { status: resp?.status(), rootFs, rows: m.rows, sw: m.sw, vw: m.vw, bad: m.bad };
      if (mode === "diff") {
        await p.addStyleTag({ content: OVERRIDE });
        await p.waitForTimeout(50);
        const m2 = await p.evaluate(measureFn);
        const changed = [];
        m.rects.forEach((x, i) => { if (x !== m2.rects[i]) changed.push(i); });
        r.changedRows = changed.length;
        r.oldBad = m2.bad.length;
        r.oldSw = m2.sw;
      }
      results[path] = r;
    } catch (e) { results[path] = { error: String(e).slice(0, 200) }; }
  }
  await ctx.close();
}
await Promise.all([worker(), worker(), worker(), worker(), worker(), worker()]);
await browser.close();
fs.writeFileSync(OUT + `fit-${W}-${F}-${mode || "fit"}.json`, JSON.stringify(results, null, 1));
const withRows = Object.entries(results).filter(([, v]) => v.rows > 0);
const bad = withRows.filter(([, v]) => v.bad.length);
const errs = Object.entries(results).filter(([, v]) => v.error || (v.status && v.status !== 200));
const roots = [...new Set(Object.values(results).map((v) => v.rootFs))];
console.log(`W=${W} F=${F} pages=${Object.keys(results).length} withRows=${withRows.length} rows=${withRows.reduce((s, [, v]) => s + v.rows, 0)} badPages=${bad.length} errs=${errs.length} roots=${roots} swOver=${Object.values(results).filter((v) => v.sw > W).length}`);
if (mode === "diff") console.log("changedPages", withRows.filter(([, v]) => v.changedRows).map(([k, v]) => k + ":" + v.changedRows + " oldBad=" + v.oldBad + " oldSw=" + v.oldSw).join("\n"));
for (const [k, v] of bad.slice(0, 20)) console.log(k, JSON.stringify(v.bad.slice(0, 4)));
for (const [k, v] of errs.slice(0, 10)) console.log("ERR", k, JSON.stringify(v).slice(0, 200));
