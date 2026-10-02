import { chromium } from "playwright";
const B = "http://localhost:3196";
const out = "/home/user/yolo-web/tmp/cycle-316/rv36/";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const log = (...a) => console.log(...a);
async function mk(w, h, scheme = "light") {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, colorScheme: scheme });
  return { ctx, page: await ctx.newPage() };
}
const rowsInfo = (page, label) => page.evaluate((label) => [...document.querySelectorAll(`ul[aria-label="${label}"] > li`)].map((li) => li.innerText.split("\n").filter(Boolean).slice(0, 3).join("|")), label);
// 1. /tools at 1280: kinds, sorting, text filter, back/forward
{
  const { ctx, page } = await mk(1280, 800);
  await page.goto(B + "/tools", { waitUntil: "networkidle" });
  const all = await rowsInfo(page, "ツールの一覧");
  log("DEFAULT", all.length); all.forEach((r) => log("  ", r));
  await page.locator("label:has(input[type=radio])").filter({ hasText: /^データ$/ }).click();
  await page.waitForTimeout(200);
  log("KIND data url", page.url(), "status", await page.locator('p[tabindex="-1"]').innerText(), (await rowsInfo(page, "ツールの一覧")).length);
  await page.locator("label:has(input[type=radio])").filter({ hasText: /^新しい順$/ }).click();
  await page.waitForTimeout(200);
  log("SORT newest url", page.url(), (await rowsInfo(page, "ツールの一覧")).slice(0, 4));
  await page.locator("label:has(input[type=radio])").filter({ hasText: /^すべて$/ }).click();
  await page.waitForTimeout(200);
  const newest = await rowsInfo(page, "ツールの一覧");
  log("NEWEST all url", page.url()); newest.slice(0, 8).forEach((r) => log("  ", r));
  await page.getByRole("searchbox").fill("変換");
  await page.waitForTimeout(500);
  const f = await rowsInfo(page, "ツールの一覧");
  log("Q 変換 url", decodeURI(page.url()), await page.locator('p[tabindex="-1"]').innerText(), f.length); f.forEach((r) => log("  ", r));
  await page.getByRole("searchbox").fill("zzzz");
  await page.waitForTimeout(500);
  log("Q zzzz", await page.locator('main').innerText().then((t) => t.split("\n").filter((l) => l.includes("条件") || l.includes("外す")).join(" / ")));
  await page.screenshot({ path: out + "tools_1280_zero.png" });
  await page.getByRole("button", { name: "絞り込みを外す" }).click();
  await page.waitForTimeout(400);
  log("CLEARED url", page.url(), "focused", await page.evaluate(() => document.activeElement?.tagName + ":" + document.activeElement?.getAttribute("type")), (await rowsInfo(page, "ツールの一覧")).length);
  // go to a tool and back
  await page.locator("label:has(input[type=radio])").filter({ hasText: /^画像$/ }).click();
  await page.waitForTimeout(300);
  log("IMG url", page.url());
  await page.getByRole("link", { name: "QRコード生成" }).click();
  await page.waitForURL("**/tools/qr-code");
  log("NAV to", page.url());
  await page.goBack();
  await page.waitForTimeout(800);
  log("BACK url", page.url(), "checked", await page.evaluate(() => [...document.querySelectorAll('input[type=radio]:checked')].map((r) => r.closest("label").textContent).join(",")), (await rowsInfo(page, "ツールの一覧")));
  await page.goForward();
  await page.waitForURL("**/tools/qr-code");
  log("FWD url", page.url());
  await page.goBack();
  await page.waitForTimeout(800);
  log("BACK2 url", page.url(), (await rowsInfo(page, "ツールの一覧")).length, "title", await page.title());
  // direct URL with query
  await page.goto(B + "/tools?kind=color&sort=newest", { waitUntil: "networkidle" });
  log("DIRECT color newest", await rowsInfo(page, "ツールの一覧"), await page.evaluate(() => [...document.querySelectorAll('input[type=radio]:checked')].map((r) => r.closest("label").textContent).join(",")));
  await page.goto(B + "/tools?kind=bogus", { waitUntil: "networkidle" });
  log("DIRECT bogus kind", (await rowsInfo(page, "ツールの一覧")).length, page.url());
  await ctx.close();
}
// 2. /play at 1280
{
  const { ctx, page } = await mk(1280, 800);
  await page.goto(B + "/play", { waitUntil: "networkidle" });
  const all = await rowsInfo(page, "遊びの一覧");
  log("PLAY DEFAULT", all.length); all.forEach((r) => log("  ", r));
  log("PLAY kinds", await page.evaluate(() => [...document.querySelectorAll('[role=radiogroup], fieldset')].map((g) => g.innerText.replace(/\n/g, " "))));
  await page.locator("label:has(input[type=radio])").filter({ hasText: /^新しい順$/ }).click();
  await page.waitForTimeout(200);
  const nw = await rowsInfo(page, "遊びの一覧");
  log("PLAY NEWEST", page.url()); nw.forEach((r) => log("  ", r));
  await page.locator("label:has(input[type=radio])").filter({ hasText: /^パズル$/ }).click();
  await page.waitForTimeout(200);
  log("PLAY puzzle", await page.locator('p[tabindex="-1"]').innerText(), await rowsInfo(page, "遊びの一覧"));
  await ctx.close();
}
// 3. 375: toggle open, label reflects
for (const s of ["light", "dark"]) {
  const { ctx, page } = await mk(375, 667, s);
  await page.goto(B + "/tools", { waitUntil: "networkidle" });
  const btn = page.locator("button[aria-expanded]");
  await btn.click();
  await page.waitForTimeout(200);
  await page.locator("label:has(input[type=radio])").filter({ hasText: /^画像$/ }).click();
  await page.waitForTimeout(200);
  log("375 toggle", s, await btn.getAttribute("aria-expanded"), await btn.innerText());
  await page.screenshot({ path: `${out}tools_375_${s}_open.png`, fullPage: false });
  await page.screenshot({ path: `${out}tools_375_${s}_open_full.png`, fullPage: true });
  // keyboard focus ring on first row
  await page.keyboard.press("Tab");
  await ctx.close();
}
// 4. keyboard: tab through at 1280 and screenshot focus on a row + hover
{
  const { ctx, page } = await mk(1280, 800);
  await page.goto(B + "/tools", { waitUntil: "networkidle" });
  await page.locator('ul[aria-label="ツールの一覧"] a').first().focus();
  await page.keyboard.press("Tab");
  await page.waitForTimeout(100);
  await page.screenshot({ path: out + "tools_1280_focusrow.png" });
  const second = page.locator('ul[aria-label="ツールの一覧"] > li').nth(4);
  await second.hover();
  await page.waitForTimeout(200);
  await page.screenshot({ path: out + "tools_1280_hover.png" });
  // row hit area height
  log("ROW sizes", await page.evaluate(() => [...document.querySelectorAll('ul[aria-label="ツールの一覧"] > li')].slice(0, 3).map((li) => { const b = li.getBoundingClientRect(); return Math.round(b.width) + "x" + Math.round(b.height); })));
  // radios label row height
  log("RADIO rows", await page.evaluate(() => [...document.querySelectorAll('label:has(input[type=radio])')].map((l) => { const b = l.getBoundingClientRect(); return l.textContent + " " + Math.round(b.width) + "x" + Math.round(b.height); }).join(", ")));
  await ctx.close();
}
// 5. Related tools on tool pages
for (const slug of ["image-base64", "unix-timestamp", "base64", "age-calculator", "traditional-color-palette"]) {
  const { ctx, page } = await mk(1280, 800);
  await page.goto(B + "/tools/" + slug, { waitUntil: "networkidle" });
  const r = await page.evaluate(() => { const h = document.getElementById("related-tools"); if (!h) return null; const sec = h.closest("section") || h.parentElement; return [...sec.querySelectorAll("li")].map((li) => li.innerText.replace(/\n/g, " | ")); });
  log("RELATED", slug, JSON.stringify(r));
  if (slug === "image-base64") { await page.locator("#related-tools").scrollIntoViewIfNeeded(); await page.screenshot({ path: out + "related_1280.png" }); }
  await ctx.close();
}
{
  const { ctx, page } = await mk(375, 667, "dark");
  await page.goto(B + "/tools/image-base64", { waitUntil: "networkidle" });
  await page.locator("#related-tools").scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollBy(0, 150));
  await page.screenshot({ path: out + "related_375_dark.png" });
  await ctx.close();
}
await browser.close();
