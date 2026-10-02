import { chromium } from "playwright-core";
import { wordStartsOf, toGraphemes } from "/home/user/yolo-web/src/lib/word-starts.ts";
const exe = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const browser = await chromium.launch({ executablePath: exe });
const port = process.env.PORT;
for (const [w, fs] of [[320,16],[375,16],[320,32],[375,32]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 800 } });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Page.enable");
  await cdp.send("Page.setFontSizes", { fontSizes: { standard: fs, fixed: 13 } });
  await page.goto(`http://localhost:${port}/tools/email-validator`, { waitUntil: "networkidle" });
  const r = await page.evaluate(async () => {
    const h = document.querySelector("h1");
    await document.fonts.load('400 32px "Zen Antique"', h.textContent);
    const ok = document.fonts.check('400 32px "Zen Antique"', h.textContent);
    const cs = getComputedStyle(h);
    // code point positions of line starts, plus wbr positions
    const cps = []; let top = null; const breaks = []; const wbr = []; let cp = 0;
    const walker = document.createTreeWalker(h, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      if (n.nodeType === 1) { if (n.tagName === "WBR") wbr.push(cp); continue; }
      for (let i = 0; i < n.data.length; ) {
        const c = n.data.codePointAt(i); const len = c > 0xffff ? 2 : 1;
        const rg = document.createRange(); rg.setStart(n, i); rg.setEnd(n, i + len);
        const rect = rg.getClientRects()[0];
        if (rect) { if (top !== null && Math.abs(rect.top - top) > 2) breaks.push(cp); top = rect.top; }
        cp += 1; i += len;
      }
    }
    return { text: h.textContent, breaks, wbr, ok, fontSize: cs.fontSize, wb: cs.wordBreak, lb: cs.lineBreak, ow: cs.overflowWrap, over: h.scrollWidth > h.clientWidth || document.documentElement.scrollWidth > document.documentElement.clientWidth };
  });
  // convert code point positions to grapheme indices
  const g = toGraphemes(r.text); const cp2g = new Map(); let c = 0;
  g.forEach((x, i) => { cp2g.set(c, i); c += [...x].length; });
  const starts = wordStartsOf(r.text);
  const cls = r.breaks.map((b) => { const gi = cp2g.get(b); return r.wbr.includes(b) ? `${gi}:wbr` : starts.has(gi) ? `${gi}:word` : `${gi}:IN-WORD`; });
  const chars = [...r.text]; const lines = []; let s = 0; for (const b of [...r.breaks, chars.length]) { lines.push(chars.slice(s, b).join("")); s = b; }
  console.log(`${w} ${fs===16?"default":"200%"} size=${r.fontSize} wb=${r.wb} lb=${r.lb} ow=${r.ow} fontsOk=${r.ok} overflow=${r.over} lines=[${lines.join(" / ")}] breaks=${cls.join(",")} wordStarts=${[...starts]}`);
  await page.screenshot({ path: `shot-${w}-${fs}.png` }); await ctx.close();
}
await browser.close();
