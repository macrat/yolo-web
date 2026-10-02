import { chromium } from "/home/user/yolo-web/node_modules/playwright/index.mjs";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium", timeout: 30000 });
const page = await b.newPage({ viewport: { width: 375, height: 667 } });
page.setDefaultTimeout(15000);
await page.goto("http://localhost:3917/tools/char-count", { waitUntil: "load" });
const ta = page.getByRole("textbox", { name: "数えるテキスト" });
const read = () => page.evaluate(() => { const r = document.querySelector("p[data-step]").closest("section"); return { main: r.querySelector("p[data-step]").textContent, rows: [...r.querySelectorAll("tr")].map(t => t.querySelector("th").textContent + "=" + t.querySelector("td").textContent).join(" "), status: document.querySelector("[role=status]").textContent, len: document.querySelector("textarea").value.length }; });
const cases = { emoji: "😀", zwj: "👨‍👩‍👧", flag: "🇯🇵", skin: "👍🏽", nfd: "が", nfc: "が", crlf: "a\r\nb", lf: "a\nb", cr: "a\rb", fwspace: "あ　い", tab: "a\tb", trailingNL: "a\n", paras: "a\n\n\nb\n \nc" };
for (const [k, v] of Object.entries(cases)) { await ta.fill(v); await page.waitForTimeout(80); console.log(k, JSON.stringify(await read())); }
// paste CRLF via clipboard event (insertText)
await ta.fill(""); await ta.focus(); await page.keyboard.insertText("x\r\ny"); await page.waitForTimeout(80); console.log("insertText-crlf", JSON.stringify(await read()));
// typing live + CLS
await ta.fill("");
await page.evaluate(() => { window.__ls = []; new PerformanceObserver(l => { for (const e of l.getEntries()) window.__ls.push({ v: e.value, r: e.hadRecentInput }); }).observe({ type: "layout-shift", buffered: true }); });
await ta.focus();
await page.keyboard.type("こんにちは世界 hello 😀\n2行目", { delay: 20 });
await page.waitForTimeout(300);
console.log("typed", JSON.stringify(await read()));
console.log("shifts", JSON.stringify(await page.evaluate(() => window.__ls)));
await b.close();
