import { chromium } from "playwright";
const B = "http://localhost:3187";
const out = "/home/user/yolo-web/tmp/cycle-316/rv34";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const log = (...a) => console.log(...a);
const focusInfo = (page) => page.evaluate(() => {
  const s = document.querySelector('[role="status"]');
  const r = s?.getBoundingClientRect();
  return { active: document.activeElement?.getAttribute("role") || document.activeElement?.tagName + ":" + (document.activeElement?.textContent||"").slice(0,20), statusTop: r && Math.round(r.top), statusText: s?.textContent, url: location.pathname + location.search, title: document.title, scrollY: Math.round(scrollY) };
});

// 1. 375: toggle and kind
{
  const ctx = await browser.newContext({ viewport: { width: 375, height: 667 } });
  const page = await ctx.newPage();
  await page.goto(B + "/storybook/list/11", { waitUntil: "networkidle" });
  const t = page.locator("button[aria-expanded]");
  log("1 toggle:", await t.getAttribute("aria-expanded"), await t.textContent(), "regionVisible", await page.locator('fieldset').first().isVisible());
  const tb = await t.boundingBox(); log("toggle box", JSON.stringify(tb));
  await t.click();
  log("after open", await t.getAttribute("aria-expanded"), await page.locator('fieldset').first().isVisible());
  await page.locator("label", { hasText: "努力" }).click();
  await page.waitForTimeout(100);
  log("kind:", JSON.stringify(await focusInfo(page)), "label:", await t.textContent());
  await page.locator("label", { hasText: "自然" }).click(); await page.waitForTimeout(100);
  log("kind 自然:", JSON.stringify(await focusInfo(page)));
  const clr = page.getByRole("button", { name: "絞り込みを外す" });
  log("clear visible", await clr.isVisible(), JSON.stringify(await clr.boundingBox()));
  await page.screenshot({ path: out + "/i_11_375_zero.png" });
  await clr.click(); await page.waitForTimeout(100);
  log("after clear:", JSON.stringify(await focusInfo(page)), "focus on", await page.evaluate(()=>document.activeElement?.outerHTML.slice(0,80)));
  // radio tap sizes
  const sizes = await page.evaluate(() => [...document.querySelectorAll("label")].map(l => { const r = l.getBoundingClientRect(); return `${l.textContent.trim()}:${Math.round(r.left)},${Math.round(r.width)}x${Math.round(r.height)}`; }));
  log("labels", sizes.join(" | "));
  await ctx.close();
}
// 2. typing on page 2 of 101, no refetch, title
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  const reqs = [];
  page.on("request", r => { if (r.resourceType() === "fetch" || r.resourceType() === "document") reqs.push(r.method()+" "+r.url()); });
  await page.goto(B + "/storybook/list/101/page/2", { waitUntil: "networkidle" });
  reqs.length = 0;
  await page.evaluate(() => { window.__marker = 1; });
  const input = page.getByRole("searchbox");
  await input.pressSequentially("いち", { delay: 50 });
  log("2 immediately:", JSON.stringify(await focusInfo(page)));
  await page.waitForTimeout(500);
  log("2 after 500ms:", JSON.stringify(await focusInfo(page)), "marker", await page.evaluate(() => window.__marker), "reqs", JSON.stringify(reqs));
  const rows = await page.locator('ul[aria-label="四字熟語の一覧"] > li a').allTextContents();
  log("rows", rows.slice(0,6).join(","), rows.length);
  // clear via fill
  await input.fill(""); await page.waitForTimeout(500);
  log("2 cleared:", JSON.stringify(await focusInfo(page)), "firstRow", (await page.locator('ul[aria-label="四字熟語の一覧"] > li a').first().textContent()), "reqs", JSON.stringify(reqs));
  // sort change on page 2
  await page.goto(B + "/storybook/list/101/page/2", { waitUntil: "networkidle" });
  reqs.length = 0;
  await page.locator("label", { hasText: "やさしい順" }).click(); await page.waitForTimeout(200);
  log("3 sort:", JSON.stringify(await focusInfo(page)), "reqs", JSON.stringify(reqs));
  const pag = page.getByRole("navigation", { name: "ページナビゲーション" });
  log("pag html buttons", await pag.locator("button").count());
  await pag.getByRole("button", { name: /次へ/ }).click(); await page.waitForTimeout(300);
  log("3 page button next:", JSON.stringify(await focusInfo(page)), "history", await page.evaluate(()=>history.length));
  await page.screenshot({ path: out + "/i_101_1280_btnpage2.png" });
  await page.goBack(); await page.waitForTimeout(300);
  log("3 back:", JSON.stringify(await focusInfo(page)));
  await page.goForward(); await page.waitForTimeout(300);
  log("3 forward:", JSON.stringify(await focusInfo(page)));
  // sort back to default -> should go to base path
  await page.locator("label", { hasText: "読みの五十音順" }).click(); await page.waitForTimeout(200);
  log("3 sort default:", JSON.stringify(await focusInfo(page)));
  await ctx.close();
}
// 4. link mode keyboard
{
  const ctx = await browser.newContext({ viewport: { width: 375, height: 667 } });
  const page = await ctx.newPage();
  await page.goto(B + "/storybook/list/101", { waitUntil: "networkidle" });
  log("4 direct load:", JSON.stringify(await focusInfo(page)));
  const next = page.getByRole("link", { name: /次へ/ });
  await next.focus(); await page.keyboard.press("Enter");
  await page.waitForURL("**/page/2"); await page.waitForTimeout(500);
  log("4 after link next:", JSON.stringify(await focusInfo(page)));
  const fv = await page.evaluate(() => { const s = document.activeElement; const cs = getComputedStyle(s); return [s.matches(":focus-visible"), cs.outlineStyle, cs.outlineWidth, cs.boxShadow]; });
  log("focus visible on status", JSON.stringify(fv));
  await page.screenshot({ path: out + "/i_101_375_linkpage2.png" });
  await page.getByRole("link", { name: "ページ3" }).click();
  await page.waitForURL("**/page/3"); await page.waitForTimeout(500);
  log("4 click page3:", JSON.stringify(await focusInfo(page)));
  await page.goBack(); await page.waitForTimeout(500);
  log("4 back to 2:", JSON.stringify(await focusInfo(page)));
  // go to other page and come back via link
  await page.getByRole("link", { name: "辞典" }).first().click(); await page.waitForTimeout(800);
  await page.goBack(); await page.waitForTimeout(800);
  log("4 back from other:", JSON.stringify(await focusInfo(page)));
  await ctx.close();
}
// 5. arrival with query
{
  const ctx = await browser.newContext({ viewport: { width: 375, height: 667 } });
  const page = await ctx.newPage();
  await page.goto(B + "/storybook/list/101?q=%E4%B8%80&sort=easy&page=2", { waitUntil: "networkidle" });
  log("5 query arrival:", JSON.stringify(await focusInfo(page)), "input", await page.getByRole("searchbox").inputValue(), "toggle", await page.locator("button[aria-expanded]").textContent());
  await page.goto(B + "/storybook/list/101?page=99", { waitUntil: "networkidle" });
  log("5 page=99:", JSON.stringify(await focusInfo(page)));
  await page.goto(B + "/storybook/list/101?q=zzzz", { waitUntil: "networkidle" });
  log("5 nomatch:", JSON.stringify(await focusInfo(page)), "pagination", await page.getByRole("navigation", {name:"ページナビゲーション"}).count());
  await ctx.close();
}
await browser.close();
