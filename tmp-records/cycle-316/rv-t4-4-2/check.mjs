import { chromium } from "/home/user/yolo-web/node_modules/playwright/index.mjs";
import fs from "node:fs";
const BASE = "http://localhost:3461";
const OUT = "/home/user/yolo-web/tmp/cycle-316/rv-t4-4-2";
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const results = [];
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
for (const mode of ["reject-real-exec", "no-api-real-exec", "all-fail", "normal"]) {
  const ctx = await b.newContext({ viewport: { width: 375, height: 667 }, permissions: ["clipboard-read", "clipboard-write"] });
  await ctx.addInitScript(`(() => {
    window.__gtag = [];
    Object.defineProperty(window, "gtag", { get: () => (...a) => window.__gtag.push(JSON.parse(JSON.stringify(a))), set: () => {}, configurable: false });
    delete Navigator.prototype.share;
    window.__realRead = navigator.clipboard && navigator.clipboard.readText.bind(navigator.clipboard);
    ${mode === "reject-real-exec" || mode === "all-fail" ? `Object.defineProperty(Navigator.prototype, "clipboard", { get: () => ({ writeText: () => Promise.reject(new Error("denied")), readText: window.__realRead }), configurable: true });` : ""}
    ${mode === "no-api-real-exec" ? `Object.defineProperty(Navigator.prototype, "clipboard", { get: () => undefined, configurable: true });` : ""}
    ${mode === "all-fail" ? `Document.prototype.execCommand = function () { return false; };` : ""}
    window.__focusLog = [];
    document.addEventListener("focusin", (e) => window.__focusLog.push(e.target.tagName + ":" + (e.target.textContent||"").slice(0,10)), true);
    const today = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
    localStorage.setItem("yoji-kimeru-first-visit", "1");
    localStorage.setItem("yoji-kimeru-history-intermediate", JSON.stringify({ [today]: { guesses: Array(6).fill("一石二鳥"), feedbacks: Array.from({ length: 6 }, () => ({ guess: "一石二鳥", charFeedbacks: ["absent", "present", "absent", "correct"] })), status: "lost", guessCount: 6 } }));
  })();`);
  for (const [name, url, button] of [["tool", "/tools/char-count", "URLをコピー"], ["yojiGame", "/play/yoji-kimeru", "結果をコピー"]]) {
    const page = await ctx.newPage();
    await page.goto(BASE + url);
    await wait(2500);
    const scope = name === "yojiGame" ? page.locator("dialog[open]") : page;
    const btn = scope.getByRole("button", { name: button, exact: true }).first();
    await btn.scrollIntoViewIfNeeded();
    const scrollBefore = await page.evaluate(() => [scrollX, scrollY, document.querySelector("dialog[open]")?.scrollTop ?? null]);
    await page.evaluate(() => { window.__gtag = []; window.__focusLog = []; });
    await btn.click();
    await wait(400);
    const scrollAfter = await page.evaluate(() => [scrollX, scrollY, document.querySelector("dialog[open]")?.scrollTop ?? null]);
    const st = await page.evaluate(() => {
      const a = document.activeElement;
      return { active: a?.tagName + ":" + a?.textContent, focusVisible: a?.matches(":focus-visible"), dialogOpen: !!document.querySelector("dialog[open]"), textareas: document.querySelectorAll("textarea[aria-hidden]").length, gtag: window.__gtag.filter((x) => x[1] === "share"), focusLog: window.__focusLog, status: [...document.querySelectorAll('[role="status"]')].map((s) => s.textContent).filter(Boolean) };
    });
    let clip = null;
    try { clip = await page.evaluate(() => Promise.race([window.__realRead ? window.__realRead() : Promise.resolve("(no read)"), new Promise((r) => setTimeout(() => r("(timeout)"), 2000))])); } catch (e) { clip = "ERR " + e.message; }
    await page.mouse.move(0, 0);
    await page.screenshot({ path: `${OUT}/${name}-${mode}-375.png` });
    // keyboard path: focus button, press Enter
    await page.evaluate(() => { window.__focusLog = []; });
    await btn.focus();
    await page.keyboard.press("Enter");
    await wait(400);
    const kb = await page.evaluate(() => ({ active: document.activeElement?.textContent, fv: document.activeElement?.matches(":focus-visible") }));
    results.push({ mode, name, scrollBefore, scrollAfter, ...st, clip, kb });
    await page.close();
  }
  await ctx.close();
}
await b.close();
fs.writeFileSync(`${OUT}/record.json`, JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 1));
