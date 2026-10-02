import { chromium } from "playwright";
const [path, W, F] = [process.argv[2], +process.argv[3], +process.argv[4]];
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const ctx = await browser.newContext({ viewport: { width: W, height: 900 } });
const p = await ctx.newPage();
const cdp = await ctx.newCDPSession(p);
await cdp.send("Page.setFontSizes", { fontSizes: { standard: F, fixed: 13 * F / 16 } });
await p.goto("http://localhost:3371" + path);
await p.evaluate(() => document.fonts.ready.then(() => 0));
const out = await p.evaluate((needle) => {
  const a = [...document.querySelectorAll('[data-text-box="rows"] li')].find((li) => li.textContent.includes(needle));
  if (!a) return "none";
  a.scrollIntoView();
  const d = (e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return `${e.tagName}.${String(e.className).replace(/.*__/, "")} x=${r.left.toFixed(1)} r=${r.right.toFixed(1)} w=${r.width.toFixed(1)} sw=${e.scrollWidth} cw=${e.clientWidth} disp=${cs.display} minw=${cs.minWidth} ow=${cs.overflowWrap} wb=${cs.wordBreak}`; };
  return [d(a), ...[...a.querySelectorAll("*")].map(d)].join("\n") + "\nHTML: " + a.outerHTML.slice(0, 600);
}, process.argv[5]);
console.log(out);
if (process.argv[6]) await p.screenshot({ path: process.argv[6] });
await browser.close();
