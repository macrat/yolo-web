import { chromium } from "playwright";
import { readFileSync } from "node:fs";
const out = "/home/user/yolo-web/tmp/cycle-316/rv-t4-17";
const md = readFileSync("/home/user/yolo-web/tmp/cycle-316/t4-17/after-measure/preview-input.md", "utf8") + "\n\n<div class=\"table-scroll\" tabindex=\"0\" onclick=\"alert(1)\">raw</div>\n\n<span class=\"code-comment\">x</span><wbr onmouseover=alert(1)>y\n";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
for (const [w, font, scheme] of [[375, 0, "light"], [1280, 0, "light"], [1280, 0, "dark"], [375, 0, "dark"], [320, 32, "light"]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: 900 }, colorScheme: scheme });
  const p = await ctx.newPage();
  if (font) { const cdp = await ctx.newCDPSession(p); await cdp.send("Page.setFontSizes", { fontSizes: { standard: font, fixed: font } }); }
  let dialog = false; p.on("dialog", async (d) => { dialog = true; await d.dismiss(); });
  await p.goto(`http://localhost:3481/tools/markdown-preview`, { waitUntil: "networkidle" });
  await p.getByLabel("Markdown入力").fill(md);
  await p.waitForTimeout(800);
  const info = await p.evaluate(() => { const pv = document.querySelector("[data-testid='markdown-preview']"); return { docOver: document.documentElement.scrollWidth - innerWidth, tables: [...pv.querySelectorAll(".table-scroll")].map(t => [t.scrollWidth - t.clientWidth, t.hasAttribute("data-scrolls"), t.getAttribute("tabindex")]), raw: pv.innerHTML.slice(-260) }; });
  console.log(w, font, scheme, dialog, JSON.stringify(info));
  const pv = p.locator("[data-testid='markdown-preview']"); await pv.scrollIntoViewIfNeeded();
  await pv.screenshot({ path: `${out}/pv-${w}-${font}-${scheme}.png` });
  await ctx.close();
}
await b.close();
