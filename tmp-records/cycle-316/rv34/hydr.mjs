import { chromium } from "playwright";
const B = "http://localhost:3187";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
// CLS: no-JS vs JS position of list
for (const w of [375, 1280]) {
  const r = [];
  for (const js of [false, true]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 800 }, javaScriptEnabled: js });
    const p = await ctx.newPage();
    await p.goto(B + "/storybook/list/101", { waitUntil: "networkidle" });
    await p.waitForTimeout(300);
    r.push(await p.evaluate(() => { const u = document.querySelector('ul[aria-label]'); const i = document.querySelector('input[type=search]'); const t = document.querySelector('button[aria-expanded]'); return [Math.round(u.getBoundingClientRect().top), Math.round(i.getBoundingClientRect().top), t ? getComputedStyle(t).display : null]; }));
    await ctx.close();
  }
  console.log("CLS", w, JSON.stringify(r));
}
// typed before hydration
{
  const ctx = await browser.newContext({ viewport: { width: 375, height: 667 } });
  const p = await ctx.newPage();
  let release; const gate = new Promise(r => release = r);
  await p.route("**/_next/static/chunks/**", async (route) => { await Promise.race([gate, new Promise(r => setTimeout(r, 15000))]); await route.continue(); });
  await p.goto(B + "/storybook/list/101", { waitUntil: "domcontentloaded" });
  await p.locator("input[type=search]").pressSequentially("一", { delay: 30 });
  const before = await p.evaluate(() => [document.querySelector("input[type=search]").value, document.querySelector('[role=status]').textContent]);
  release();
  await p.waitForLoadState("networkidle"); await p.waitForTimeout(800);
  const after = await p.evaluate(() => [document.querySelector("input[type=search]").value, document.querySelector('[role=status]').textContent, location.search]);
  console.log("typed before", JSON.stringify(before), "after", JSON.stringify(after));
  await ctx.close();
}
// live region mutation count while typing
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const p = await ctx.newPage();
  await p.goto(B + "/storybook/list/101", { waitUntil: "networkidle" });
  await p.evaluate(() => { window.__m = []; new MutationObserver(() => window.__m.push(document.querySelector('[role=status]').textContent)).observe(document.querySelector('[role=status]'), { childList: true, characterData: true, subtree: true }); });
  await p.locator("input[type=search]").pressSequentially("ichi", { delay: 80 });
  await p.waitForTimeout(400);
  console.log("status mutations typing 'ichi':", JSON.stringify(await p.evaluate(() => window.__m)));
  await p.locator("input[type=search]").fill("");
  await p.waitForTimeout(400);
  // page button
  await p.locator("label", { hasText: "やさしい順" }).click(); await p.waitForTimeout(200);
  await p.evaluate(() => { window.__m = []; });
  await p.getByRole("button", { name: /次へ/ }).click(); await p.waitForTimeout(300);
  console.log("status mutations on button page:", JSON.stringify(await p.evaluate(() => window.__m)), await p.evaluate(()=>document.activeElement.getAttribute("role")));
  await ctx.close();
}
await browser.close();
