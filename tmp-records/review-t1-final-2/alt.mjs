import { chromium } from "playwright";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
for (const fsz of [16,32]) for (const [w,h] of [[320,568],[360,640],[375,667],[1280,800]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  if (fsz!==16){const c=await ctx.newCDPSession(page);await c.send("Page.setFontSizes",{fontSizes:{standard:fsz}});}
  await page.goto("http://localhost:4741/play/character-personality", { waitUntil: "networkidle" });
  await page.addStyleTag({ content: "body > header nav{flex:1 1 0;min-width:0}" });
  const hb = await page.locator("header").first().boundingBox();
  const nav = await page.locator("body > header nav a").evaluateAll(as=>as.map(a=>{const r=a.getBoundingClientRect();return a.textContent+"@"+Math.round(r.left)+","+Math.round(r.top)+"-"+Math.round(r.right)}));
  const sb = await page.getByRole("button", { name: "はじめる" }).boundingBox();
  console.log(fsz,w,"alt header",Math.round(hb.height),"start bottom",Math.round(sb.y+sb.height),nav.join(" "));
  if (w===320&&fsz===16) await page.screenshot({path:"/home/user/yolo-web/tmp/review-t1-final-2/alt-320.png"});
  await ctx.close();
}
await browser.close();
