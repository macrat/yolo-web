import { chromium } from "playwright";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
for (const path of ["/blog", "/blog/page/2"]) for (const F of [16, 32]) for (const W of [320, 360, 375, 414, 768, 1024, 1280]) for (const safari of [false, true]) {
  const ctx = await browser.newContext({ viewport: { width: W, height: 900 } });
  const p = await ctx.newPage();
  const cdp = await ctx.newCDPSession(p);
  await cdp.send("Page.setFontSizes", { fontSizes: { standard: F, fixed: 13 * F / 16 } });
  await p.goto("http://localhost:3371" + path);
  if (safari) await p.addStyleTag({ content: "h1,h2,h3,h4,h5,h6{word-break:normal}" });
  await p.evaluate(() => document.fonts.ready.then(() => 0));
  await p.waitForTimeout(100);
  const r = await p.evaluate(() => {
    const h = document.querySelector("h1");
    const lines = [];
    let last = null;
    const tw = document.createTreeWalker(h, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = tw.nextNode())) for (let i = 0; i < n.length; i++) {
      const rg = document.createRange(); rg.setStart(n, i); rg.setEnd(n, i + 1);
      const rc = rg.getClientRects()[0]; if (!rc) continue;
      if (last === null || rc.top > last + 5) { lines.push(""); last = rc.top; }
      lines[lines.length - 1] += n.data[i];
    }
    const hr = h.getBoundingClientRect();
    return { lines: lines.join("／"), wb: getComputedStyle(h).wordBreak, fs: getComputedStyle(h).fontSize, right: Math.round(hr.right), sw: h.scrollWidth, cw: h.clientWidth, html: h.innerHTML, font: getComputedStyle(h).fontFamily.slice(0, 40), docSw: document.documentElement.scrollWidth };
  });
  console.log(path, F, W, safari ? "safari" : "chrome", r.lines, r.wb, r.fs, `sw=${r.sw}/${r.cw}`, `doc=${r.docSw}`, r.html);
  await ctx.close();
}
await browser.close();
