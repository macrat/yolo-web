import { chromium } from "playwright";
const BASE = "http://localhost:3473";
const OUT = "/home/user/yolo-web/tmp/cycle-316/rv-t4-4-3/img";
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const res = [];
for (const [mode, scheme] of [["api-denied","light"],["all-fail","light"],["all-fail","dark"]]) {
  const ctx = await b.newContext({ viewport: { width: 375, height: 667 }, colorScheme: scheme });
  await ctx.grantPermissions(["clipboard-read", "clipboard-write"], { origin: BASE });
  await ctx.addInitScript(`(() => {
    delete Navigator.prototype.share; delete Navigator.prototype.canShare;
    window.__gtag = [];
    Object.defineProperty(window, "gtag", { get: () => (...a) => window.__gtag.push(JSON.parse(JSON.stringify(a))), set: () => {}, configurable: false });
    const real = Document.prototype.execCommand;
    Document.prototype.execCommand = function () { return ${mode === "all-fail" ? "false" : "real.apply(this, arguments)"}; };
    const orig = navigator.clipboard;
    Object.defineProperty(Navigator.prototype, "clipboard", { get: () => ({ writeText: () => Promise.reject(new Error("denied")), readText: () => orig.readText() }), configurable: true });
  })();`);
  const page = await ctx.newPage();
  await page.goto(`${BASE}/play/character-personality?ref=blazing-poet`);
  await page.getByRole("button", { name: "はじめる" }).click();
  for (let i = 0; i < 60; i++) {
    const next = page.getByRole("button", { name: "次へ" });
    if (await next.count()) await next.first().click();
    else { const c = page.locator('ul[data-text-box="rows"] li button'); if (!(await c.count())) break; await c.first().click(); }
    await wait(120);
  }
  await wait(1500);
  const share = page.getByRole("button", { name: "共有", exact: true });
  await share.focus();
  await page.keyboard.press("Enter");
  await wait(1500);
  const fuda = await page.evaluate(() => {
    const s = document.querySelector('[role=status][id]');
    const all = [...document.querySelectorAll("[role=status]")].map((e) => e.textContent);
    return { all, active: document.activeElement?.tagName + ":" + document.activeElement?.textContent?.trim().slice(0, 10), gtag: window.__gtag.filter((a) => a[1] === "share").map((a) => a[2]) };
  });
  const clip = mode === "api-denied" ? await page.evaluate(() => navigator.clipboard.readText()) : null;
  res.push({ mode, scheme, what: "fuda", ...fuda, clip });
  const fw = page.locator("text=この結果を札として持ち帰る").locator("..");
  await fw.scrollIntoViewIfNeeded();
  await fw.screenshot({ path: `${OUT}/fuda-${mode}-${scheme}.png` });
  const inv = page.getByRole("button", { name: "友達に診断を送る" });
  if (await inv.count()) {
    await inv.first().scrollIntoViewIfNeeded();
    await inv.first().click();
    await wait(800);
    const st = await inv.first().locator("xpath=..").locator("[role=status]").textContent();
    res.push({ mode, scheme, what: "invite", status: st, clip: mode === "api-denied" ? await page.evaluate(() => navigator.clipboard.readText()) : null, gtag: await page.evaluate(() => window.__gtag.filter((a) => a[1] === "share").map((a) => a[2].method + "/" + a[2].surface)) });
    await inv.first().locator("xpath=..").screenshot({ path: `${OUT}/invite-${mode}-${scheme}.png` });
  } else res.push({ mode, what: "invite", missing: true });
  await ctx.close();
}
await b.close();
console.log(JSON.stringify(res, null, 1));
