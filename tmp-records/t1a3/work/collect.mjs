// Collect characters per region (chrome = header/footer/skip link; page = everything else) and role
// (zen = heading/mincho family, biz400/biz700 = gothic). Hidden text is included (M6). ASCII is excluded
// (it is drawn by the shared Latin face). Monospace (code) and input fields (device gothic) are excluded.
import { chromium } from "/home/user/yolo-web/node_modules/playwright/index.mjs";
import fs from "node:fs";
const base = "http://localhost:3000";
const urls = fs.readFileSync(process.argv[2], "utf8").split("\n").filter(Boolean);
const out = {};
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--no-sandbox"] });
const ctx = await b.newContext({ viewport: { width: 412, height: 823 }, isMobile: true, hasTouch: true });
const p = await ctx.newPage();
for (const u of urls) {
  await p.goto(base + encodeURI(u), { waitUntil: "load" });
  await p.waitForTimeout(800);
  out[u] = await p.evaluate(() => {
    const res = { chrome: {}, page: {} };
    const add = (region, role, t) => { for (const c of t) { if (c.codePointAt(0) < 0x80) continue; res[region][role] = (res[region][role] || new Set()); res[region][role].add(c); } };
    const roleOf = (cs) => {
      const f = cs.fontFamily;
      const first = f.split(",")[0].trim().replace(/["']/g, "");
      if (/Menlo|Consolas|monospace|Courier/i.test(first)) return null;
      const w = parseInt(cs.fontWeight, 10) >= 600 ? 700 : 400;
      if (/Noto Serif JP|mincho|Mincho/i.test(f)) return "zen";
      return "biz" + w;
    };
    const regionOf = (el) => (el.closest("main") ? "page" : el.closest("header,footer,a[class*=skipLink]") ? "chrome" : "other");
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = w.nextNode())) {
      const el = n.parentElement;
      if (!el || ["SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE"].includes(el.tagName)) continue;
      if (el.closest("input,textarea,select")) continue;
      const t = n.data.replace(/\s+/g, "");
      if (!t) continue;
      const r = roleOf(getComputedStyle(el));
      if (r) add(regionOf(el), r, t);
    }
    for (const el of document.body.querySelectorAll("*")) {
      if (el.closest("input,textarea")) continue;
      for (const ps of ["::before", "::after"]) {
        const cs = getComputedStyle(el, ps);
        const c = cs.content;
        if (c && c.startsWith('"')) {
          const t = c.slice(1, -1).replace(/\\[0-9a-fA-F]+ ?/g, (m) => String.fromCodePoint(parseInt(m.slice(1), 16)));
          const r = roleOf(cs);
          if (r) add(regionOf(el), r, t);
        }
      }
    }
    for (const g of Object.values(res)) for (const k of Object.keys(g)) g[k] = [...g[k]].sort().join("");
    return res;
  });
  const o = out[u];
  console.log(u, JSON.stringify(Object.fromEntries(Object.entries(o).map(([r, g]) => [r, Object.fromEntries(Object.entries(g).map(([k, v]) => [k, v.length]))]))));
}
fs.writeFileSync(process.argv[3], JSON.stringify(out));
await b.close();
