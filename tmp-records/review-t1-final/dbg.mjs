import { chromium } from "playwright";
const BASE = "http://localhost:4731";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const ctx = await browser.newContext({ viewport: { width: 375, height: 667 } });
const page = await ctx.newPage();
page.on("console", m => { if (m.type()==="error") console.log("CONSOLE", m.text().slice(0,200)); });
page.on("pageerror", e => console.log("PAGEERR", e.message.slice(0,200)));
await page.goto(BASE + "/play/character-personality", { waitUntil: "networkidle" });
await page.getByRole("button", { name: "はじめる" }).click();
for (let i=0;i<14;i++){
  const prog = await page.evaluate(()=>document.body.innerText.match(/\d+ \/ 12/)?.[0]);
  const ch = page.locator('[class*="QuestionCard-module"] button[class*="choice"]');
  const n = await ch.count();
  const cls = await ch.evaluateAll(a=>a.map(b=>b.className.split(" ").map(c=>c.split("__")[1]).join("+")+(b.disabled?"(dis)":"")));
  console.log(i, prog, n, cls.join(" "));
  if (!n) break;
  await ch.nth(0).click();
  await page.waitForTimeout(1500);
}
console.log(page.url());
await browser.close();
