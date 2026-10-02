import { chromium } from "playwright";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
for (const p of ["/play/character-personality","/play/character-personality/result/blazing-strategist","/tools/char-count","/dictionary/kanji/"+encodeURIComponent("哀"),"/blog/sql-cheatsheet"]) {
 const page = await (await browser.newContext({ viewport: { width: 375, height: 667 } })).newPage();
 let n=0, bytes=0;
 page.on("response", async r => { if (r.url().endsWith(".woff2")) { n++; try { bytes += (await r.body()).length; } catch {} } });
 await page.goto("http://localhost:4731"+p, { waitUntil: "networkidle" }); await page.waitForTimeout(500);
 console.log(p, n, Math.round(bytes/1024)+"KiB");
 await page.context().close();
}
await browser.close();
