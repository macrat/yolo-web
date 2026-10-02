import { chromium } from "playwright";
const B = "http://localhost:3196", out = "/home/user/yolo-web/tmp/cycle-316/rv36/";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
for (const [p, w] of [["/tools", 320], ["/play", 320]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 667 } });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page); await cdp.send("Page.enable"); await cdp.send("Page.setFontSizes", { fontSizes: { standard: 32, fixed: 26 } });
  await page.goto(B + p, { waitUntil: "networkidle" });
  await page.locator("button[aria-expanded]").click();
  await page.waitForTimeout(200);
  const r = await page.evaluate(() => {
    const cont = [...document.querySelectorAll("body *")].find((el) => { const cs = getComputedStyle(el); return cs.borderLeftWidth === "3px" && cs.borderRightWidth === "3px" && el.getBoundingClientRect().height > 500; });
    const cr = cont.getBoundingClientRect(); const L = cr.left + 3, R = cr.right - 3; const bad = [];
    for (const el of document.querySelectorAll("main *")) { const b = el.getBoundingClientRect(); if (!b.width || !b.height) continue; const cs = getComputedStyle(el); if (cs.position === "absolute" && b.width <= 1) continue;
      if (b.left < L - 0.5 || b.right > R + 0.5) bad.push("EL " + el.tagName + " " + Math.round(b.left) + "-" + Math.round(b.right));
      for (const n of el.childNodes) if (n.nodeType === 3 && n.textContent.trim()) { const rg = document.createRange(); rg.selectNodeContents(n); for (const rb of rg.getClientRects()) if (rb.left < L - 0.5 || rb.right > R + 0.5) bad.push("TX " + n.textContent.trim().slice(0, 10)); } }
    return { sw: document.documentElement.scrollWidth, bad: bad.slice(0, 10) };
  });
  console.log(p, w, "200% open", JSON.stringify(r));
  await page.screenshot({ path: `${out}${p.slice(1)}_${w}_200_open.png` });
  await page.evaluate(() => document.querySelector("main ul > li").scrollIntoView({ block: "start" }));
  await page.screenshot({ path: `${out}${p.slice(1)}_${w}_200_rows.png` });
  await ctx.close();
}
await browser.close();
