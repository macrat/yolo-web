import { chromium } from "playwright";
const cases = [["character-counting-guide",2],["how-we-built-10-tools",0],["cron-parser-guide",4],["japanese-traditional-colors-dictionary",0],["tool-reliability-improvements",1],["nextjs-directory-architecture",2],["nextjs-directory-architecture",5],["series-navigation-ui",1],["content-trust-levels",5],["adsense-content-quality-audit-methodology",1],["memo-system-rise-and-fall",6],["cron-cheatsheet",1],["cron-cheatsheet",3],["markdown-cheatsheet",2],["markdown-cheatsheet",6]];
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const p = await (await b.newContext({ viewport: { width: 375, height: 800 } })).newPage();
for (const [slug, i] of cases) {
  await p.goto(`http://localhost:3481/blog/${slug}`, { waitUntil: "networkidle" }); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
  const r = await p.evaluate((i) => {
    const t = document.querySelectorAll("article .table-scroll")[i]; const fr = t.getBoundingClientRect();
    let maxRight = 0, widest = "";
    const w = document.createTreeWalker(t, NodeFilter.SHOW_TEXT); let n;
    while ((n = w.nextNode())) { const rg = document.createRange(); rg.selectNodeContents(n); for (const rc of rg.getClientRects()) if (rc.right > maxRight) { maxRight = rc.right; widest = n.textContent.slice(0, 40); } }
    const lastTd = t.querySelector("tr > :last-child"); 
    return { over: t.scrollWidth - t.clientWidth, textRightBeyondFrame: Math.round((maxRight - fr.right) * 10) / 10, lastPadR: getComputedStyle(lastTd).paddingRight, widest };
  }, i);
  console.log(slug, i, JSON.stringify(r));
}
await b.close();
