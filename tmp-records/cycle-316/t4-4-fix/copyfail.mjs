// クリップボードの API に拒まれる端末での写し方と、写せなかったときの知らせを確かめる。
import { chromium } from "playwright";
const BASE = "http://localhost:3447";
const OUT = "/home/user/yolo-web/tmp/cycle-316/t4-4-fix/copyfail";
import fs from "node:fs";
fs.mkdirSync(OUT, { recursive: true });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const results = [];
for (const mode of ["execCommand-ok", "all-fail"]) {
  const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
  const ctx = await b.newContext({ viewport: { width: 375, height: 667 } });
  await ctx.addInitScript(`(() => {
    window.__gtag = [];
    Object.defineProperty(window, "gtag", { get: () => (...a) => window.__gtag.push(JSON.parse(JSON.stringify(a))), set: () => {}, configurable: false });
    delete Navigator.prototype.share;
    Object.defineProperty(Navigator.prototype, "clipboard", { get: () => ({ writeText: () => Promise.reject(new Error("denied")) }), configurable: true });
    const real = Document.prototype.execCommand;
    window.__exec = [];
    Document.prototype.execCommand = function (c) {
      const sel = String(document.getSelection());
      const a = document.activeElement;
      window.__exec.push({ c, selected: a && a.tagName === "TEXTAREA" ? a.value.slice(a.selectionStart, a.selectionEnd) : sel });
      return ${mode === "all-fail" ? "false" : "real.apply(this, arguments)"};
    };
    const today = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
    localStorage.setItem("yoji-kimeru-first-visit", "1");
    localStorage.setItem("yoji-kimeru-history-intermediate", JSON.stringify({ [today]: { guesses: Array(6).fill("一石二鳥"), feedbacks: Array.from({ length: 6 }, () => ({ guess: "一石二鳥", charFeedbacks: ["absent", "present", "absent", "correct"] })), status: "lost", guessCount: 6 } }));
  })();`);
  const page = await ctx.newPage();
  for (const [name, url, button] of [["tool", "/tools/char-count", "URLをコピー"], ["yojiGame", "/play/yoji-kimeru", "結果をコピー"]]) {
    await page.goto(BASE + url);
    await wait(3000);
    const scope = name === "yojiGame" ? page.locator("dialog[open]") : page;
    const btn = scope.getByRole("button", { name: button, exact: true }).first();
    await btn.scrollIntoViewIfNeeded();
    await page.evaluate(() => { window.__gtag = []; window.__exec = []; });
    await btn.click();
    await wait(500);
    const status = await btn.evaluate((el) => el.closest("div").parentElement.querySelector('[role="status"]').textContent);
    const focused = await page.evaluate(() => document.activeElement?.textContent);
    const rec = await page.evaluate(() => ({ exec: window.__exec, gtag: window.__gtag.filter((a) => a[1] === "share"), textareas: document.querySelectorAll("textarea[aria-hidden]").length }));
    results.push({ mode, name, status, focused, ...rec });
    for (const w of [375, 1280]) {
      await page.setViewportSize({ width: w, height: w === 375 ? 667 : 800 });
      await btn.evaluate((el) => el.scrollIntoView({ block: "center" }));
      await wait(200);
      await page.screenshot({ path: `${OUT}/${name}-${mode}-${w}.png` });
    }
    await page.setViewportSize({ width: 375, height: 667 });
  }
  await b.close();
}
fs.writeFileSync(`${OUT}/record.json`, JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 1));
