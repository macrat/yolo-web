const { chromium } = require("/home/user/yolo-web/node_modules/playwright");
const fs = require("fs"), path = require("path");
const base = JSON.parse(fs.readFileSync(path.join(__dirname, "base.json")));
const urls = JSON.parse(fs.readFileSync(path.join(__dirname, "urls.json"))).filter(o => ["blog","result","quiz","misc","game","tool"].includes(o.g));
const withTimeout = (p, ms) => Promise.race([p, new Promise(r => setTimeout(() => r("__timeout"), ms))]);
function lay(h) {
  const chars = []; const walk = n => { for (const c of n.childNodes) { if (c.nodeType === 3) for (let i = 0; i < c.data.length;) { const cp = c.data.codePointAt(i); const len = cp > 0xffff ? 2 : 1; chars.push({ node: c, i, len, ch: c.data.substr(i, len) }); i += len; } else walk(c); } }; walk(h);
  const lines = []; let cur = null, last = null;
  chars.forEach(({ node, i, len, ch }) => { let t = null; if (!/\s/.test(ch)) { const r = document.createRange(); r.setStart(node, i); r.setEnd(node, i + len); const rs = r.getClientRects(); t = rs.length ? rs[0].top : null; } if (t === null) { if (cur) cur.push(ch); return; } if (last === null || t > last + 4) { cur = [ch]; lines.push(cur); last = t; } else { cur.push(ch); } });
  return lines.map(l => l.join("")).join("／");
}
(async () => {
  const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
  const page = await browser.newPage();
  const out = [];
  for (const w of [320, 375, 1280]) for (const o of urls) {
    await page.setViewportSize({ width: w, height: 800 });
    const r = await withTimeout(page.goto(`http://localhost:${process.argv[2]}${o.u}`, { waitUntil: "load", timeout: 30000 }).catch(e => "err"), 35000);
    if (r === "__timeout" || r === "err") continue;
    await withTimeout(page.evaluate(() => document.fonts.ready.then(() => 1)), 8000);
    const res = await withTimeout(page.evaluate(({ base, layS }) => {
      const lay = eval("(" + layS + ")"); const res = [];
      for (const h of document.querySelectorAll("h1,h2,h3")) {
        if (!h.querySelector("wbr") || !h.getClientRects().length) continue;
        const t = h.textContent.trim(); const b = base[t]; if (!b) continue;
        const actual = lay(h); const saved = h.innerHTML;
        h.innerHTML = ""; b.forEach((p, i) => { if (i) h.appendChild(document.createElement("wbr")); h.appendChild(document.createTextNode(p)); });
        const baseLay = lay(h); h.innerHTML = saved;
        res.push({ tag: h.tagName, actual, baseLay });
      }
      return res;
    }, { base, layS: lay.toString() }), 15000);
    if (Array.isArray(res)) res.forEach(x => out.push({ g: o.g, u: o.u, w, ...x }));
  }
  await browser.close();
  fs.writeFileSync(path.join(__dirname, "sim.json"), JSON.stringify(out));
  console.log(out.length, out.filter(x => x.actual !== x.baseLay).length);
})();
