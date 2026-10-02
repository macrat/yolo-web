// node copybtn.mjs <base> <width> — base64 の CopyButton を、クリップボードの API を拒ませて押す
import { chromium } from "/home/user/yolo-web/node_modules/playwright/index.mjs";
const [BASE, W] = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const out = { w: +W, errors: [] };
try {
  const ctx = await browser.newContext({ viewport: { width: +W, height: +W < 700 ? 568 : 800 } });
  await ctx.route(/google|doubleclick|adsbygoogle/, (r) => r.abort());
  await ctx.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: () => Promise.reject(new Error("denied")) } });
    window.__copied = [];
    document.addEventListener("copy", () => { const a = document.activeElement; window.__copied.push({ text: a && "value" in a ? a.value.slice(a.selectionStart, a.selectionEnd) : String(getSelection()), parent: a?.parentElement?.tagName }); }, true);
  });
  const p = await ctx.newPage(); p.setDefaultTimeout(10000);
  p.on("console", (m) => { if (m.type() === "error") out.errors.push(m.text().slice(0, 150)); });
  p.on("pageerror", (e) => out.errors.push("pageerror " + String(e).slice(0, 150)));
  await p.goto(`${BASE}/tools/base64`, { waitUntil: "load" }); await p.waitForTimeout(1500);
  await p.locator("main textarea").first().fill("こんにちは");
  await p.waitForTimeout(500);
  const btn = p.locator("main button", { hasText: /コピー/ }).first();
  out.label0 = (await btn.textContent()).trim();
  await btn.focus(); await p.keyboard.press("Enter"); await p.waitForTimeout(500);
  out.label1 = (await btn.textContent()).trim();
  out.focus = await p.evaluate(() => document.activeElement?.textContent?.trim());
  out.copied = await p.evaluate(() => window.__copied);
  await ctx.close();
} catch (e) { out.fatal = String(e).slice(0, 300); } finally { await browser.close(); }
console.log(JSON.stringify(out));
