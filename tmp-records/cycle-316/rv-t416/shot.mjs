import { chromium } from "/home/user/yolo-web/node_modules/playwright/index.mjs";
const out = "/home/user/yolo-web/tmp/cycle-316/rv-t416";
const url = "http://localhost:3461/tools/unix-timestamp";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const log = [];
async function run(name, width, big, reduced, dark) {
  const ctx = await browser.newContext({ viewport: { width, height: 800 }, reducedMotion: reduced ? "reduce" : "no-preference", colorScheme: dark ? "dark" : "light" });
  const page = await ctx.newPage();
  page.setDefaultTimeout(10000);
  await page.goto(url, { waitUntil: "networkidle", timeout: 20000 });
  if (big) {
    const cdp = await ctx.newCDPSession(page);
    await cdp.send("Page.setFontSizes", { fontSizes: { standard: 32, fixed: 32 } });
  }
  const bar = page.locator("code").first().locator("..");
  await bar.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await bar.screenshot({ path: `${out}/${name}-bar-initial.png` });
  await page.screenshot({ path: `${out}/${name}-initial.png` });
  const aria = await bar.ariaSnapshot();
  const info = await page.evaluate(() => {
    const code = document.querySelector("code");
    const bar = code.parentElement;
    const br = bar.getBoundingClientRect();
    return {
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      bar: { w: Math.round(br.width), h: Math.round(br.height) },
      label: bar.firstElementChild.getBoundingClientRect().toJSON(),
      code: code.getBoundingClientRect().toJSON(),
      buttons: [...bar.querySelectorAll("button")].map((b) => { const r = b.getBoundingClientRect(); const cs = getComputedStyle(b); return { t: b.textContent, name: b.getAttribute("aria-label"), h: Math.round(r.height), w: Math.round(r.width), x: Math.round(r.x), y: Math.round(r.y), deco: cs.textDecorationLine, pressed: b.getAttribute("aria-pressed") }; }),
    };
  });
  log.push({ name, aria, info });
  await ctx.close();
}
await run("w320", 320, false);
await run("w375", 375, false);
await run("w1280", 1280, false);
await run("w320-font200", 320, true);
await run("w375-font200", 375, true);
await run("w1280-font200", 1280, true);
await run("w375-reduced", 375, false, true);
await run("w375-dark", 375, false, false, true);
console.log(JSON.stringify(log, null, 1));
await browser.close();
