import { chromium } from "playwright";
const B = "http://localhost:3351";
const out = "/home/user/yolo-web/tmp/cycle-316/rv35";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const ctx = await browser.newContext({ viewport: { width: 375, height: 667 } });
const p = await ctx.newPage();
const errs = []; p.on("console", m => { if (m.type() === "error") errs.push(m.text().slice(0,150)); }); p.on("pageerror", e => errs.push("PE " + e.message));
const info = () => p.evaluate(() => ({ url: decodeURI(location.pathname + location.search), status: document.querySelector("main p[tabindex='-1']")?.textContent, first: document.querySelector("main ul[aria-label] > li a")?.textContent?.slice(0,20), rows: document.querySelectorAll("main ul[aria-label] > li").length, q: document.querySelector("main input[type=search]")?.value, sortLabel: [...document.querySelectorAll("main button[aria-expanded]")].map(b=>b.textContent).join("|"), title: document.title, active: document.activeElement?.tagName + ":" + (document.activeElement?.textContent||"").slice(0,15), scrollY: Math.round(scrollY) }));
await p.goto(B + "/blog", { waitUntil: "networkidle" });
console.log("start", JSON.stringify(await info()));
await p.locator("input[type=search]").pressSequentially("Next", { delay: 50 }); await p.waitForTimeout(600);
console.log("q=Next", JSON.stringify(await info()));
await p.locator("input[type=search]").fill("ＪＳＯＮ"); await p.waitForTimeout(600);
console.log("q=ＪＳＯＮ", JSON.stringify(await info()));
await p.locator("input[type=search]").fill("しっぱい"); await p.waitForTimeout(600);
console.log("q=しっぱい", JSON.stringify(await info()));
await p.locator("input[type=search]").fill("失敗と学び"); await p.waitForTimeout(600);
console.log("q=失敗と学び(tag)", JSON.stringify(await info()));
await p.locator("input[type=search]").fill("開発ノート"); await p.waitForTimeout(600);
console.log("q=開発ノート(category)", JSON.stringify(await info()));
await p.locator("input[type=search]").fill("zzzzqq"); await p.waitForTimeout(600);
console.log("q=zzz", JSON.stringify(await info()));
await p.getByRole("button", { name: "絞り込みを外す" }).click(); await p.waitForTimeout(500);
console.log("cleared", JSON.stringify(await info()));
// sort oldest
await p.locator("button[aria-expanded]").click();
await p.getByText("古い順").click(); await p.waitForTimeout(400);
console.log("oldest", JSON.stringify(await info()));
await p.screenshot({ path: `${out}/oldest-375.png` });
// page 2 via button mode
await p.getByRole("button", { name: /次/ }).first().click().catch(e=>console.log("nextbtn err", e.message.slice(0,80)));
await p.waitForTimeout(500);
console.log("oldest p2", JSON.stringify(await info()));
// open article then back
const href = await p.locator("main ul[aria-label] > li a").first().getAttribute("href");
await p.locator("main ul[aria-label] > li a").first().click(); await p.waitForURL("**" + href); await p.waitForTimeout(500);
console.log("article", decodeURI(p.url()));
await p.goBack(); await p.waitForTimeout(1000);
console.log("back", JSON.stringify(await info()));
await p.goBack(); await p.waitForTimeout(800);
console.log("back2", JSON.stringify(await info()));
await p.goForward(); await p.waitForTimeout(800);
console.log("fwd", JSON.stringify(await info()));
// search then article then back
await p.goto(B + "/blog", { waitUntil: "networkidle" });
await p.locator("input[type=search]").fill("Playwright"); await p.waitForTimeout(600);
await p.locator("main ul[aria-label] > li a").first().click(); await p.waitForTimeout(1200);
await p.goBack(); await p.waitForTimeout(1000);
console.log("search back", JSON.stringify(await info()));
// link mode pagination
await p.goto(B + "/blog", { waitUntil: "networkidle" });
await p.getByRole("link", { name: /次/ }).first().click(); await p.waitForTimeout(1200);
console.log("link next", JSON.stringify(await info()));
await p.screenshot({ path: `${out}/link-next-375.png` });
await p.goBack(); await p.waitForTimeout(1000);
console.log("link back", JSON.stringify(await info()));
// page2 then filter
await p.goto(B + "/blog/page/2", { waitUntil: "networkidle" });
await p.locator("input[type=search]").fill("SEO"); await p.waitForTimeout(700);
console.log("p2 filter", JSON.stringify(await info()));
// direct URL with query
await p.goto(B + "/blog?sort=oldest&page=2", { waitUntil: "networkidle" }); await p.waitForTimeout(500);
console.log("direct query", JSON.stringify(await info()));
// category from index keeps? 
await p.goto(B + "/blog/tag/Next.js", { waitUntil: "networkidle" });
console.log("tag Next.js", JSON.stringify(await info()));
await p.goto(B + "/blog/category/japanese-culture", { waitUntil: "networkidle" });
console.log("small cat", JSON.stringify(await info()), await p.locator("main input[type=search]").count());
console.log("errors", JSON.stringify(errs));
await browser.close();
