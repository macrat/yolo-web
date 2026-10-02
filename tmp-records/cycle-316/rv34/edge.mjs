import { chromium } from "playwright";
const B = "http://localhost:3187";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const p = await ctx.newPage();
const errs = []; p.on("console", m => { if (m.type() === "error" || m.type()==="warning") errs.push(m.text().slice(0,150)); }); p.on("pageerror", e => errs.push("PE " + e.message));
const info = () => p.evaluate(() => ({ url: location.pathname + location.search, status: document.querySelector('[role=status]').textContent, first: document.querySelector('ul[aria-label] > li a')?.textContent, title: document.title, active: document.activeElement?.getAttribute("role") }));
await p.goto(B + "/storybook/list/101/page/3", { waitUntil: "networkidle" });
await p.locator("input[type=search]").fill("一"); await p.waitForTimeout(500);
console.log("typed", JSON.stringify(await info()));
await p.locator("input[type=search]").fill(""); await p.waitForTimeout(500);
console.log("cleared", JSON.stringify(await info()));
await p.getByRole("link", { name: "ページ3", exact: true }).click(); await p.waitForTimeout(1000);
console.log("to page3 link", JSON.stringify(await info()));
await p.getByRole("link", { name: "ページ2", exact: true }).click(); await p.waitForTimeout(1000);
console.log("to page2 link", JSON.stringify(await info()));
await p.goBack(); await p.waitForTimeout(800);
console.log("back", JSON.stringify(await info()));
await p.goBack(); await p.waitForTimeout(800);
console.log("back2", JSON.stringify(await info()));
// keyboard: tab order around controls
await p.goto(B + "/storybook/list/11", { waitUntil: "networkidle" });
await p.locator("input[type=search]").focus();
const order = [];
for (let i = 0; i < 6; i++) { await p.keyboard.press("Tab"); order.push(await p.evaluate(() => { const a = document.activeElement; return a.tagName + ":" + (a.getAttribute("aria-label") || a.closest("label")?.textContent || a.textContent).trim().slice(0, 15); })); }
console.log("tab order 1280", order.join(" > "));
// keyboard clear button
await p.goto(B + "/storybook/list/11?q=zzz", { waitUntil: "networkidle" });
await p.getByRole("button", { name: "絞り込みを外す" }).focus(); await p.keyboard.press("Enter"); await p.waitForTimeout(200);
console.log("after kbd clear focus:", await p.evaluate(() => document.activeElement.tagName), JSON.stringify(await info()));
console.log("errors", JSON.stringify(errs));
await browser.close();
