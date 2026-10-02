import { chromium } from "/home/user/yolo-web/node_modules/playwright/index.mjs";
const BASE = "http://localhost:3461";
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
for (const mode of ["normal", "no-api"]) {
const ctx = await b.newContext({ viewport: { width: 375, height: 667 }, permissions: ["clipboard-read", "clipboard-write"] });
await ctx.addInitScript(`(() => {
  delete Navigator.prototype.share;
  ${mode === "no-api" ? `Object.defineProperty(Navigator.prototype, "clipboard", { get: () => undefined, configurable: true });` : ""}
  window.__focusLog = [];
  document.addEventListener("focusin", (e) => window.__focusLog.push(e.target.tagName + "." + e.target.className + ":" + (e.target.textContent||"").slice(0,10)), true);
  const today = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
  localStorage.setItem("yoji-kimeru-first-visit", "1");
  localStorage.setItem("yoji-kimeru-history-intermediate", JSON.stringify({ [today]: { guesses: Array(6).fill("一石二鳥"), feedbacks: Array.from({ length: 6 }, () => ({ guess: "一石二鳥", charFeedbacks: ["absent", "present", "absent", "correct"] })), status: "lost", guessCount: 6 } }));
})();`);
const page = await ctx.newPage();
await page.goto(BASE + "/play/yoji-kimeru");
await wait(2500);
const btn = page.locator("dialog[open]").getByRole("button", { name: "結果をコピー", exact: true });
await btn.focus();
console.log(mode, "before", await page.evaluate(() => [document.activeElement.textContent, document.activeElement.matches(":focus-visible")]));
await page.evaluate(() => { window.__focusLog = []; });
await page.keyboard.press("Enter");
await wait(400);
console.log(mode, "after", await page.evaluate(() => ({ a: document.activeElement.tagName + ":" + document.activeElement.textContent.slice(0,30), fv: document.activeElement.matches(":focus-visible"), dlg: !!document.querySelector("dialog[open]"), log: window.__focusLog, st: [...document.querySelectorAll("dialog [role=status]")].map(s=>s.textContent) })));
await ctx.close();
}
await b.close();
