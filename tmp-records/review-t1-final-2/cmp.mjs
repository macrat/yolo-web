import { chromium } from "playwright";
const OUT="/home/user/yolo-web/tmp/review-t1-final-2";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
for (const [tag, BASE] of [["before","http://localhost:4742"],["after","http://localhost:4741"]])
for (const [w,h] of [[320,568],[360,640],[375,667],[390,844]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, colorScheme: "light" });
  const page = await ctx.newPage();
  await page.goto(BASE + "/play/character-personality", { waitUntil: "networkidle" });
  const hb = await page.locator("header").first().boundingBox();
  const sb = await page.getByRole("button", { name: "はじめる" }).boundingBox();
  await page.getByRole("button", { name: "はじめる" }).click();
  await page.waitForTimeout(400);
  const boxes = await page.locator('[class*="QuestionCard-module"] button[class*="choice"]').evaluateAll(bs=>bs.map(b=>Math.round(b.getBoundingClientRect().bottom)));
  console.log(tag, w, h, "header", Math.round(hb.height), "start top/bottom", Math.round(sb.y), Math.round(sb.y+sb.height), "choices bottoms", JSON.stringify(boxes), "scrollY", await page.evaluate(()=>scrollY));
  await page.screenshot({ path: `${OUT}/cmp-${tag}-${w}.png` });
  await ctx.close();
}
await browser.close();
