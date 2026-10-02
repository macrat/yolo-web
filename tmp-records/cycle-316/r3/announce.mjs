import { chromium } from "playwright";
const BASE = "http://localhost:3263";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const out = {};
for (const width of [375, 1280]) {
  const page = await browser.newPage({ viewport: { width, height: 800 } });
  const r = {};
  const watch = async () => page.evaluate(() => {
    const s = document.querySelector('[role="status"]');
    window.__log = []; window.__t0 = performance.now();
    new MutationObserver(() => window.__log.push([Math.round(performance.now() - window.__t0), s.textContent])).observe(s, { childList: true, characterData: true, subtree: true });
    const p = s.previousElementSibling;
    window.__plog = [];
    new MutationObserver(() => window.__plog.push([Math.round(performance.now() - window.__t0), p.textContent])).observe(p, { childList: true, characterData: true, subtree: true });
  });
  const read = () => page.evaluate(() => ({ status: window.__log, line: window.__plog, now: document.querySelector('[role="status"]').textContent, focus: document.activeElement?.tagName + (document.activeElement?.getAttribute("tabindex") ?? "") }));
  // arrive
  for (const u of ["/storybook/list/101", "/storybook/list/101?q=%E4%B8%80", "/storybook/list/101/page/2"]) {
    await page.goto(BASE + u); await page.waitForTimeout(800);
    r["arrive " + u] = await page.evaluate(() => document.querySelector('[role="status"]').textContent);
  }
  // type
  await page.goto(BASE + "/storybook/list/101"); await page.waitForTimeout(800);
  await watch();
  const input = page.locator('input[type="search"]');
  await input.focus();
  await page.evaluate(() => { window.__t0 = performance.now(); });
  await page.keyboard.insertText("い"); await page.waitForTimeout(60); await page.keyboard.insertText("っ");
  await page.waitForTimeout(3000);
  r.typeAt3s = await read();
  r.tree3s = await page.locator("main").ariaSnapshot();
  await page.waitForTimeout(3000);
  r.typeAt6s = await read();
  r.tree6s = (await page.locator("main").ariaSnapshot()).split("\n").filter(l => /status|paragraph|件|語/.test(l)).slice(0, 6);
  r.tree3s = r.tree3s.split("\n").filter(l => /status|paragraph|件|語/.test(l)).slice(0, 6);
  // radio twice within 5s
  await page.goto(BASE + "/storybook/list/101"); await page.waitForTimeout(800);
  await watch();
  const radios = page.locator('input[type="radio"]');
  const n = await radios.count();
  r.radioCount = n;
  // click sort radio 'easy' then back to reading after 3s
  await page.evaluate(() => document.querySelector("input[value=easy]").click());
  await page.waitForTimeout(3000);
  await page.evaluate(() => document.querySelector("input[value=reading]").click());
  await page.waitForTimeout(6000);
  r.sortTwice = await read();
  // page next with Enter
  await page.goto(BASE + "/storybook/list/101?sort=easy"); await page.waitForTimeout(800);
  await watch();
  const next = page.getByRole("button", { name: /次へ/ }).or(page.getByRole("link", { name: /次へ/ })).first();
  await next.focus(); await page.keyboard.press("Enter"); await page.waitForTimeout(1500);
  r.nextEnter = await read();
  r.nextEnterTop = await page.evaluate(() => document.querySelector('[role="status"]').previousElementSibling.getBoundingClientRect().top);
  out[width] = r;
  await page.close();
}
console.log(JSON.stringify(out, null, 1));
await browser.close();
