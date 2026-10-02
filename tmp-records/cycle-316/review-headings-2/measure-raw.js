const { chromium } = require("/home/user/yolo-web/node_modules/playwright");
const fs = require("fs"), path = require("path"), os = require("os");
const [,, port, label, fontSize, onlyGroup] = process.argv;
const urls = JSON.parse(fs.readFileSync(path.join(__dirname, "urls.json"))).filter(o => !onlyGroup || o.g === onlyGroup);
const widths = [320, 375, 1280];
const withTimeout = (p, ms) => Promise.race([p, new Promise(r => setTimeout(() => r("__timeout"), ms))]);
function inPage() {
  const out = [];
  const root = parseFloat(getComputedStyle(document.documentElement).fontSize);
  for (const h of document.querySelectorAll("h1,h2,h3,h4,h5,h6")) {
    if (!h.getClientRects().length) continue;
    const cs = getComputedStyle(h);
    if (cs.visibility === "hidden") continue;
    const hasWbr = !!h.querySelector("wbr");
    const wbCS = cs.wordBreak;
    const chars = []; const wbrAt = []; let spans = h.querySelectorAll("span").length;
    const walk = n => { for (const c of n.childNodes) { if (c.nodeType === 3) { for (let i = 0; i < c.data.length; ) { const cp = c.data.codePointAt(i); const len = cp > 0xffff ? 2 : 1; chars.push({ node: c, i, len, ch: c.data.substr(i, len) }); i += len; } } else if (c.nodeName === "WBR") wbrAt.push(chars.length); else walk(c); } };
    walk(h);
    const tops = chars.map(({ node, i, len, ch }) => { if (/\s/.test(ch)) return null; const r = document.createRange(); r.setStart(node, i); r.setEnd(node, i + len); const rs = r.getClientRects(); return rs.length ? rs[0].top : null; });
    const lines = []; let cur = null, lastTop = null;
    chars.forEach((c, k) => { const t = tops[k]; if (t === null) { if (cur) cur.push(k); return; } if (lastTop === null || t > lastTop + 4) { cur = [k]; lines.push(cur); lastTop = t; } else { cur.push(k); lastTop = Math.max(lastTop, t); } });
    const text = chars.map(c => c.ch).join("");
    const breaks = lines.slice(1).map(l => l[0]);
    out.push({ tag: h.tagName, text, wbrAt, breaks, spans, overflow: h.scrollWidth > h.clientWidth + 1, font: cs.fontFamily.slice(0, 30), fs: parseFloat(cs.fontSize), width: h.clientWidth });
  }
  return { root, fontsOk: document.fonts.check("16px 'Zen Antique'") || [...document.fonts].some(f => /Zen Antique/i.test(f.family) && f.status === "loaded"), headings: out };
}
(async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "pwprof-"));
  if (fontSize !== "16") { fs.mkdirSync(path.join(dir, "Default")); fs.writeFileSync(path.join(dir, "Default/Preferences"), JSON.stringify({ webkit: { webprefs: { default_font_size: +fontSize } } })); }
  const ctx = await chromium.launchPersistentContext(dir, { executablePath: "/opt/pw-browsers/chromium", headless: true, viewport: { width: 375, height: 800 } });
  const results = [];
  const queue = urls.flatMap(o => widths.map(w => ({ ...o, w })));
  const worker = async () => {
    const page = await ctx.newPage();
    while (queue.length) {
      const job = queue.shift();
      try {
        await page.setViewportSize({ width: job.w, height: 800 });
        await withTimeout(page.goto(`http://localhost:${port}${job.u}`, { waitUntil: "load", timeout: 30000 }), 35000);
        await withTimeout(page.evaluate(() => document.fonts.ready.then(() => 1)), 8000);
        await page.waitForTimeout(300);
        const r = await withTimeout(page.evaluate(inPage), 15000);
        if (r === "__timeout") throw new Error("eval timeout");
        results.push({ ...job, ...r });
      } catch (e) { results.push({ ...job, error: String(e).slice(0, 200) }); }
    }
    await page.close();
  };
  await Promise.all([worker(), worker(), worker()]);
  await ctx.close();
  fs.writeFileSync(path.join(__dirname, `data-${label}-${fontSize}${onlyGroup ? "-" + onlyGroup : ""}.json`), JSON.stringify(results));
  const errs = results.filter(r => r.error).length; const roots = [...new Set(results.map(r => r.root))];
  console.log(label, fontSize, "jobs", results.length, "errors", errs, "roots", roots, "fontsNotOk", results.filter(r => r.fontsOk === false).length);
})();
