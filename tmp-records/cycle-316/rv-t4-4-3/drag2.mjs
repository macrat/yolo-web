import { chromium } from "playwright";
const BASE = "http://localhost:3473";
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const yojiInit = `(() => {
  const today = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
  localStorage.setItem("yoji-kimeru-first-visit", "1");
  localStorage.setItem("yoji-kimeru-history-intermediate", JSON.stringify({ [today]: { guesses: Array(6).fill("一石二鳥"), feedbacks: Array.from({ length: 6 }, () => ({ guess: "一石二鳥", charFeedbacks: ["absent", "present", "absent", "correct"] })), status: "lost", guessCount: 6 } }));
  window.__ev = [];
  for (const t of ["mousedown","mouseup","click"]) document.addEventListener(t, (e) => window.__ev.push(t + ":" + e.target.tagName), true);
})();`;
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const ctx = await b.newContext({ viewport: { width: 1280, height: 720 } });
await ctx.addInitScript(yojiInit);
const page = await ctx.newPage();
const isOpen = () => page.evaluate(() => !!document.querySelector("dialog[open]"));
await page.goto(`${BASE}/play/yoji-kimeru`); await wait(2500);
const r = await page.evaluate(() => { const d = document.querySelector("dialog[open]"); return { rect: d.getBoundingClientRect().toJSON(), sw: d.offsetWidth - d.clientWidth, sh: d.scrollHeight, ch: d.clientHeight }; });
console.log(r);
// drag the scrollbar thumb (right edge) downward and release outside the dialog
const x = r.rect.right - Math.max(r.sw, 1) / 2 - 1;
await page.mouse.move(x, r.rect.top + 30); await page.mouse.down();
await page.mouse.move(x + 60, r.rect.top + 200, { steps: 8 }); await page.mouse.up(); await wait(300);
console.log("scrollbar drag release outside:", await isOpen(), await page.evaluate(() => window.__ev.slice(-3)));
// text selection drag
await page.goto(`${BASE}/play/yoji-kimeru`); await wait(2500);
const t = await page.locator("dialog[open] p").first().boundingBox();
await page.mouse.move(t.x + 2, t.y + t.height / 2); await page.mouse.down();
await page.mouse.move(r.rect.right + 80, t.y + t.height / 2, { steps: 8 }); await page.mouse.up(); await wait(300);
console.log("text drag release outside:", await isOpen(), await page.evaluate(() => window.__ev.slice(-3)));
// can the result be reopened?
const btns = await page.getByRole("button").allInnerTexts();
console.log("page buttons after close:", btns);
await b.close();
