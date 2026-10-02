import { chromium } from "/home/user/wt-review-5673f1a/node_modules/playwright/index.mjs";
const B = "http://localhost:3461";
const OUT = "/home/user/yolo-web/tmp/cycle-316/review-t3-2-fix";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const page = await browser.newPage({ viewport: { width: 375, height: 900 } });
page.setDefaultTimeout(8000);
const rows = () => page.evaluate(() => {
  const lists = [...document.querySelectorAll("main ul[role=list], main ol[role=list]")];
  const l = lists[lists.length - 1];
  return [...l.querySelectorAll(":scope > li")].map((li) => li.innerText.replace(/\n/g, " | ")).slice(0, 4).concat([`count=${l.children.length}`]);
});
for (const p of ["/storybook/list/101", "/storybook/list/101/page/2", "/storybook/list/101/page/3", "/storybook/list/11", "/storybook/list/100"]) {
  await page.goto(B + p, { waitUntil: "networkidle" });
  console.log(p, JSON.stringify(await rows()));
}
// filter by kind on 11
await page.goto(B + "/storybook/list/11", { waitUntil: "networkidle" });
const acc = page.locator("summary, button[aria-expanded]");
for (let i = 0; i < await acc.count(); i++) { try { const a = acc.nth(i); if ((await a.getAttribute("aria-expanded")) === "false") await a.click(); } catch {} }
const radios = page.getByRole("radio");
console.log("radios", await radios.allTextContents(), await page.locator("label").allTextContents());
const radio = page.getByRole("radio").nth(1);
await radio.check({ force: true }); await page.waitForTimeout(500);
console.log("after kind filter", page.url(), JSON.stringify(await rows()));
await page.screenshot({ path: `${OUT}/kind-11-filtered-375.png`, fullPage: true });
// name filter on 101 to few items
await page.goto(B + "/storybook/list/101", { waitUntil: "networkidle" });
await page.getByRole("searchbox").or(page.getByRole("textbox")).first().fill("一");
await page.waitForTimeout(1200);
console.log("after name filter", page.url(), JSON.stringify(await rows()));
// button-mode paging: filtered then page
await page.goto(B + "/storybook/list/101?sort=easy", { waitUntil: "networkidle" });
console.log("sort easy p1", JSON.stringify(await rows()));
const nextBtn = page.getByRole("button", { name: /3/ });
if (await nextBtn.count()) { await nextBtn.first().click(); await page.waitForTimeout(700); console.log("sort easy p3", page.url(), JSON.stringify(await rows())); }
await browser.close();
