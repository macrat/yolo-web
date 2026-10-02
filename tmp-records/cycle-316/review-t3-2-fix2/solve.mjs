import { chromium } from "/home/user/yolo-web/tmp/wt-rv-t32fix2-a/node_modules/playwright/index.mjs";
const BASE = "http://localhost:3471";
const OUT = "/home/user/yolo-web/tmp/cycle-316/review-t3-2-fix2";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const res = {};
const combos = [[320, "light"], [320, "dark"], [375, "light"], [375, "dark"], [1280, "light"], [1280, "dark"]];
const slugs = process.argv[2] ? process.argv[2].split(",") : ["word-sense-personality", "traditional-color", "character-personality"];
for (const [w, scheme] of combos) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, colorScheme: scheme });
  const page = await ctx.newPage();
  page.setDefaultTimeout(8000);
  for (const slug of slugs) {
    const key = `${slug}-${w}-${scheme}`;
    await page.goto(`${BASE}/play/${slug}`, { waitUntil: "networkidle" });
    await page.locator("main button").filter({ hasText: "はじめる" }).first().click();
    let shotProgress = false;
    for (let i = 0; i < 60; i++) {
      const other = page.getByRole("heading", { name: /他のタイプ/ });
      if (await other.count()) break;
      const opts = page.locator("button[class*=choiceButton]");
      const n = await opts.count();
      if (n === 0) { await page.waitForTimeout(300); continue; }
      if (!shotProgress && i === 2) { await page.screenshot({ path: `${OUT}/progress-${key}.png` }); shotProgress = true; }
      await opts.nth(i % n).click();
      await page.waitForTimeout(600);
      const next = page.getByRole("button", { name: /次へ|結果を見る/ });
      if (await next.count()) { try { await next.first().click({ timeout: 1000 }); } catch {} }
    }
    const h = page.getByRole("heading", { name: /他のタイプ/ });
    if (!(await h.count())) { res[key] = "not solved"; continue; }
    const sec = h.locator("xpath=ancestor::section[1]");
    await sec.scrollIntoViewIfNeeded();
    const info = await page.evaluate(() => {
      const sec = [...document.querySelectorAll("section")].find((s) => /他のタイプ/.test(s.querySelector("h2,h3")?.textContent ?? ""));
      const heading = sec.querySelector("h2,h3");
      const rows = [...sec.querySelectorAll("li")].map((li) => {
        const a = li.querySelector("a");
        const cs = getComputedStyle(a);
        return { link: a.textContent, cur: a.getAttribute("aria-current"), fw: cs.fontWeight, td: cs.textDecorationLine, rest: li.textContent.replace(a.textContent, "|").trim() };
      });
      const resultH2 = [...document.querySelectorAll("h2")].map((x) => x.textContent.trim()).slice(0, 3);
      const share = [...document.querySelectorAll("a[href*='twitter.com'],a[href*='x.com'],a[href*='line.me']")].map((a) => decodeURIComponent(a.href)).slice(0, 2);
      return { heading: `${heading.tagName} ${getComputedStyle(heading).fontSize} ${heading.textContent}`, rows: rows.filter((r) => r.cur || rows.indexOf(r) < 2), title: document.title, resultH2, share, sw: document.documentElement.scrollWidth, vw: innerWidth };
    });
    info.aria = await sec.ariaSnapshot();
    res[key] = info;
    await sec.screenshot({ path: `${OUT}/solved-${key}.png` });
    await page.screenshot({ path: `${OUT}/solvedfull-${key}.png`, fullPage: true });
    // result page
    const cur = await page.evaluate(() => { const sec = [...document.querySelectorAll("section")].find((s) => /他のタイプ/.test(s.querySelector("h2,h3")?.textContent ?? "")); return sec.querySelector('a[aria-current="true"]')?.getAttribute("href"); });
    await page.goto(`${BASE}${cur}`, { waitUntil: "networkidle" });
    const rinfo = await page.evaluate(() => {
      const sec = [...document.querySelectorAll("section")].find((s) => /他のタイプ/.test(s.querySelector("h2,h3")?.textContent ?? ""));
      const a = sec?.querySelector("a[aria-current]");
      const cs = a && getComputedStyle(a);
      const share = [...document.querySelectorAll("a[href*='twitter.com'],a[href*='x.com'],a[href*='line.me']")].map((a) => decodeURIComponent(a.href)).slice(0, 1);
      return { h1: document.querySelector("h1")?.textContent, title: document.title, cur: a && { link: a.textContent, cur: a.getAttribute("aria-current"), fw: cs.fontWeight, td: cs.textDecorationLine, li: a.closest("li").textContent }, hasYours: /あなたのタイプ/.test(sec?.textContent ?? ""), share, sw: document.documentElement.scrollWidth };
    });
    res[key + "-resultpage"] = rinfo;
    await page.screenshot({ path: `${OUT}/resultfull-${key}.png`, fullPage: true });
    const rs = page.getByRole("heading", { name: /他のタイプ/ });
    if (await rs.count()) { await rs.locator("xpath=ancestor::section[1]").screenshot({ path: `${OUT}/result-others-${key}.png` }); }
  }
  await ctx.close();
}
await browser.close();
console.log(JSON.stringify(res, null, 1));
