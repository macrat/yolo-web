import { chromium } from "playwright";
const out = "/home/user/yolo-web/tmp/cycle-316/rv-t4-17";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
for (const scheme of ["light", "dark"]) {
  const p = await (await b.newContext({ viewport: { width: 375, height: 800 }, colorScheme: scheme })).newPage();
  await p.goto(`http://localhost:3481/blog/character-counting-guide`, { waitUntil: "networkidle" }); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(400);
  // focus the first scrolling table via keyboard
  await p.evaluate(() => { const t = document.querySelector("article .table-scroll[data-scrolls]"); const prev = [...document.querySelectorAll("a,button,[tabindex]")]; t.scrollIntoView({block:"center"}); });
  // tab until table focused
  await p.evaluate(() => { const t = document.querySelector("article .table-scroll[data-scrolls]"); const all=[...document.querySelectorAll("a[href],button,[tabindex='0'],summary")]; const i = all.indexOf(t); all[i-1]?.focus(); });
  await p.keyboard.press("Shift+Tab"); await p.evaluate(() => document.querySelector("article .table-scroll[data-scrolls]").focus()); await p.evaluate(() => { const t = document.querySelector("article .table-scroll[data-scrolls]"); window.scrollBy(0, t.getBoundingClientRect().top - 60); });
  const info = await p.evaluate(() => { const a = document.activeElement; const r = a.getBoundingClientRect(); return { cls: a.className, tag: a.tagName, fv: a.matches(":focus-visible"), top: r.top, h: r.height }; });
  console.log(scheme, JSON.stringify(info));
  await p.screenshot({ path: `${out}/focus-table-${scheme}.png`, clip: { x: 0, y: Math.max(0, info.top - 40), width: 375, height: 220 } });
  // scroll it by keyboard
  await p.keyboard.press("ArrowRight"); await p.keyboard.press("ArrowRight"); await p.waitForTimeout(200);
  console.log("scrollLeft", await p.evaluate(() => document.activeElement.scrollLeft));
  await p.screenshot({ path: `${out}/focus-table-scrolled-${scheme}.png`, clip: { x: 0, y: Math.max(0, info.top - 40), width: 375, height: 220 } });
  // pre
  await p.goto(`http://localhost:3481/blog/sql-cheatsheet`, { waitUntil: "networkidle" }); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(400);
  const ok = await p.evaluate(() => { const t = document.querySelector("article pre[tabindex='0']"); if (!t) return false; const all=[...document.querySelectorAll("a[href],button,[tabindex='0'],summary")]; const i = all.indexOf(t); all[i-1]?.focus(); return true; });
  if (ok) { await p.keyboard.press("Tab"); const r = await p.evaluate(() => { const a = document.activeElement; const r = a.getBoundingClientRect(); return { tag: a.tagName, top: r.top, h: r.height, label: a.getAttribute("aria-label") }; });
    console.log("pre", JSON.stringify(r)); await p.screenshot({ path: `${out}/focus-pre-${scheme}.png`, clip: { x: 0, y: Math.max(0, r.top - 30), width: 375, height: Math.min(r.h + 60, 400) } }); }
}
await b.close();
