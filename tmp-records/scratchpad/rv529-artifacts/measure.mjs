import { chromium } from "playwright-core";
const exe = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const browser = await chromium.launch({ executablePath: exe });
const paths = process.argv.slice(2);
for (const path of paths) for (const [w, fs] of [[320,16],[360,16],[375,16],[390,16],[414,16],[768,16],[1280,16],[320,32],[375,32]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 800 } });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Page.enable");
  await cdp.send("Page.setFontSizes", { fontSizes: { standard: fs, fixed: 13 } });
  await page.goto("http://localhost:3329" + path, { waitUntil: "networkidle" });
  const r = await page.evaluate(async () => {
    const h = document.querySelector("h1");
    await document.fonts.ready;
    const cs = getComputedStyle(h);
    const main = getComputedStyle(document.documentElement).getPropertyValue("--text-heading-main");
    const lines = []; let top = null;
    const walker = document.createTreeWalker(h, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) for (let i = 0; i < n.data.length; i++) {
      const rg = document.createRange(); rg.setStart(n, i); rg.setEnd(n, i + 1);
      const rect = rg.getClientRects()[0]; if (!rect) continue;
      if (top === null || Math.abs(rect.top - top) > 2) { lines.push(""); top = rect.top; }
      lines[lines.length - 1] += n.data[i];
    }
    const zen = [...document.fonts].filter((f) => f.family.includes("Zen Antique")).map((f) => f.status).join(",");
    return { lines, fontSize: cs.fontSize, main, font: cs.fontFamily.slice(0, 40), wb: cs.wordBreak, lb: cs.lineBreak, ow: cs.overflowWrap, box: h.clientWidth, zen, html: h.innerHTML.replace(/ class="[^"]*"/g, ""), over: document.documentElement.scrollWidth > document.documentElement.clientWidth };
  });
  console.log(`${path} ${w} ${fs===16?"default":"200%"} size=${r.fontSize} main=${r.main} box=${r.box} wb=${r.wb} lb=${r.lb} ow=${r.ow} zen=${r.zen} overflow=${r.over} lines=[${r.lines.join(" / ")}] html=${r.html}`);
  await ctx.close();
}
await browser.close();
