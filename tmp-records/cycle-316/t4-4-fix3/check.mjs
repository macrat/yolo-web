// T4-4 の3巡目の直し: ダイアログの閉じ方（ドラッグの終わり・背景・余白・Esc・キーボード・タッチ）と、招待の共有シートを閉じた回。
import { chromium } from "playwright";
import fs from "node:fs";
const BASE = "http://localhost:3447";
const OUT = "/home/user/yolo-web/tmp/cycle-316/t4-4-fix3";
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const results = [];
const yojiInit = `(() => {
  const today = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
  localStorage.setItem("yoji-kimeru-first-visit", "1");
  localStorage.setItem("yoji-kimeru-history-intermediate", JSON.stringify({ [today]: { guesses: Array(6).fill("一石二鳥"), feedbacks: Array.from({ length: 6 }, () => ({ guess: "一石二鳥", charFeedbacks: ["absent", "present", "absent", "correct"] })), status: "lost", guessCount: 6 } }));
  window.open = () => null;
  delete Navigator.prototype.share;
})();`;

for (const [w, h] of [[375, 667], [1280, 800]]) {
  const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
  const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: true });
  await ctx.addInitScript(yojiInit);
  const page = await ctx.newPage();
  const isOpen = () => page.evaluate(() => !!document.querySelector("dialog[open]"));
  const fresh = async () => { await page.goto(`${BASE}/play/yoji-kimeru`); await wait(3000); return page.locator("dialog[open]").boundingBox(); };
  const out = (x) => results.push({ width: w, ...x });

  // 中の文から背景へドラッグして離す
  let box = await fresh();
  const text = await page.locator("dialog[open]").getByText("戦うたびに勝つこと").boundingBox();
  await page.mouse.move(text.x + 5, text.y + text.height / 2);
  await page.mouse.down();
  await page.mouse.move(text.x + 40, text.y + 5, { steps: 5 });
  await page.mouse.move(Math.max(2, box.x - 10), Math.max(2, box.y - 10), { steps: 8 });
  await page.mouse.up();
  await wait(300);
  out({ check: "drag text -> backdrop", open: await isOpen() });
  // 余白から背景へ
  box = await fresh();
  await page.mouse.move(box.x + 6, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(Math.max(2, box.x - 10), box.y + box.height / 2, { steps: 5 });
  await page.mouse.up();
  await wait(300);
  out({ check: "drag padding -> backdrop", open: await isOpen() });
  // 背景から中へ
  box = await fresh();
  await page.mouse.move(Math.max(2, box.x - 10), Math.max(2, box.y - 10));
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2, box.y + 60, { steps: 5 });
  await page.mouse.up();
  await wait(300);
  out({ check: "drag backdrop -> inside", open: await isOpen() });
  // 余白を押す
  box = await fresh();
  await page.mouse.click(box.x + 6, box.y + box.height / 2);
  await wait(300);
  out({ check: "click padding", open: await isOpen() });
  // 背景を押す
  await page.mouse.click(Math.max(2, box.x - 10), Math.max(2, box.y - 10));
  await wait(300);
  out({ check: "click backdrop", open: await isOpen() });
  // タッチで背景・中
  box = await fresh();
  await page.touchscreen.tap(box.x + box.width / 2, box.y + 60);
  await wait(300);
  out({ check: "tap inside", open: await isOpen() });
  await page.touchscreen.tap(Math.max(2, box.x - 10), Math.max(2, box.y - 10));
  await wait(300);
  out({ check: "tap backdrop", open: await isOpen() });
  // キーボード
  for (const [name, key] of [["結果をコピー", "Enter"], ["LINE でシェア", "Space"]]) {
    await fresh();
    await page.locator("dialog[open]").getByRole("button", { name: new RegExp("^" + name) }).focus();
    await page.keyboard.press(key);
    await wait(400);
    out({ check: `keyboard ${key} on ${name}`, open: await isOpen() });
  }
  // Esc
  await fresh();
  await page.keyboard.press("Escape");
  await wait(300);
  out({ check: "Escape", open: await isOpen() });
  await b.close();
}

// 招待: 共有シートを閉じた回・ほかの理由で拒まれた回・共有シートの無い端末
for (const mode of ["AbortError", "NotAllowedError", "no-share"]) {
  const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
  const ctx = await b.newContext({ viewport: { width: 375, height: 667 } });
  await ctx.grantPermissions(["clipboard-read", "clipboard-write"], { origin: BASE });
  await ctx.addInitScript(`(() => {
    window.__gtag = [];
    Object.defineProperty(window, "gtag", { get: () => (...a) => window.__gtag.push(JSON.parse(JSON.stringify(a))), set: () => {}, configurable: false });
    ${mode === "no-share" ? "delete Navigator.prototype.share;" : `Navigator.prototype.share = () => Promise.reject(new DOMException("x", "${mode}"));`}
  })();`);
  const page = await ctx.newPage();
  await page.goto(`${BASE}/play/character-personality/result/blazing-poet`);
  await wait(2000);
  const btn = page.getByRole("button", { name: "友達に診断を送る" });
  await btn.scrollIntoViewIfNeeded();
  await btn.click();
  await wait(500);
  const status = await btn.evaluate((el) => el.parentElement.querySelector("[role=status]").textContent);
  const clip = await page.evaluate(() => navigator.clipboard.readText().catch(() => null));
  const gtag = await page.evaluate(() => window.__gtag.filter((a) => a[1] === "share").map((a) => a[2]));
  results.push({ check: `invite ${mode}`, status, clipboardStart: clip?.slice(0, 30) ?? null, gtag });
  await page.screenshot({ path: `${OUT}/invite-${mode}-375.png` });
  await b.close();
}
fs.writeFileSync(`${OUT}/record.json`, JSON.stringify(results, null, 2));
for (const r of results) console.log(JSON.stringify(r));
