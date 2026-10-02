const { chromium } = require("/home/user/yolo-web/node_modules/playwright");
const fs = require("fs");
const path = require("path");
const BASE = "http://localhost:3961";
const DIR = __dirname;
let n = 0;
async function open({ width, height, font = 16, theme = "light", touch = true, blockFonts = false, storage }) {
  const ud = path.join(DIR, "profile-" + process.pid + "-" + n++);
  fs.mkdirSync(path.join(ud, "Default"), { recursive: true });
  fs.writeFileSync(path.join(ud, "Default", "Preferences"), JSON.stringify({ webkit: { webprefs: { default_font_size: font } } }));
  const ctx = await chromium.launchPersistentContext(ud, {
    executablePath: "/opt/pw-browsers/chromium",
    viewport: { width, height: height ?? (width >= 1000 ? 800 : 667) },
    deviceScaleFactor: 1,
    hasTouch: touch,
    isMobile: touch && width < 1000,
    colorScheme: theme,
    timeout: 30000,
  });
  ctx.setDefaultTimeout(15000);
  if (blockFonts) await ctx.route(/\.(woff2?|ttf|otf)(\?|$)/, (r) => r.abort());
  const page = ctx.pages()[0] || (await ctx.newPage());
  if (storage) await page.addInitScript((s) => { for (const [k, v] of Object.entries(s)) localStorage.setItem(k, v); }, storage);
  await page.addInitScript(() => {
    window.__cls = 0; window.__shifts = [];
    new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) { window.__cls += e.value; window.__shifts.push({ v: e.value, t: e.startTime, src: e.sources.map((s) => s.node && (s.node.className || s.node.nodeName)) }); } }).observe({ type: "layout-shift", buffered: true });
  });
  const close = async () => { await ctx.close(); fs.rmSync(ud, { recursive: true, force: true }); };
  return { ctx, page, close };
}
// measure the slider group
async function measure(page) {
  return page.evaluate(() => {
    const r = (el) => { const b = el.getBoundingClientRect(); return { x: +b.x.toFixed(2), y: +b.y.toFixed(2), w: +b.width.toFixed(2), h: +b.height.toFixed(2), r: +b.right.toFixed(2), b: +b.bottom.toFixed(2) }; };
    const inputs = [...document.querySelectorAll('input[type="range"]')];
    const rows = inputs.map((inp) => {
      const row = inp.parentElement;
      const label = row.querySelector("label");
      const dec = row.querySelector('button[aria-label*="減らす"],button[aria-label*="下げる"]');
      const inc = row.querySelector('button[aria-label*="増やす"],button[aria-label*="上げる"]');
      const val = row.querySelector(':scope > span[aria-hidden="true"]');
      const ir = r(inp);
      return { label: r(label), input: ir, trackX: +(ir.x + 8).toFixed(2), trackW: +(ir.w - 16).toFixed(2), dec: r(dec), inc: r(inc), val: r(val), valText: val.lastElementChild.textContent, twoRow: ir.y >= r(label).b - 1 };
    });
    const container = inputs[0].closest('[style*="--slider-fixed"]');
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const decide = [...document.querySelectorAll("button")].find((b) => b.textContent.trim() === "決定");
    return { rem, fixed: container.style.getPropertyValue("--slider-fixed"), containerW: +container.getBoundingClientRect().width.toFixed(2), slidersW: +container.firstElementChild.getBoundingClientRect().width.toFixed(2), rows, decideBottom: decide ? +decide.getBoundingClientRect().bottom.toFixed(2) : null, scrollW: document.documentElement.scrollWidth, fonts: document.fonts.status, cls: window.__cls };
  });
}
async function setVal(page, idx, v) {
  await page.evaluate(([i, v]) => {
    const inp = document.querySelectorAll('input[type="range"]')[i];
    const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
    set.call(inp, String(v)); inp.dispatchEvent(new Event("input", { bubbles: true }));
  }, [idx, v]);
}
module.exports = { open, measure, setVal, BASE, DIR };
