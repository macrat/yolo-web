// T4-4 の2巡目の直し: ダイアログのキーボード操作、道具のコピーの代わりの写し方、失敗の知らせの画像。
import { chromium } from "playwright";
import fs from "node:fs";
const BASE = "http://localhost:3447";
const OUT = "/home/user/yolo-web/tmp/cycle-316/t4-4-fix2/check";
fs.mkdirSync(OUT, { recursive: true });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const results = [];

const yojiInit = `(() => {
  const today = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
  localStorage.setItem("yoji-kimeru-first-visit", "1");
  localStorage.setItem("yoji-kimeru-history-intermediate", JSON.stringify({ [today]: { guesses: Array(6).fill("一石二鳥"), feedbacks: Array.from({ length: 6 }, () => ({ guess: "一石二鳥", charFeedbacks: ["absent", "present", "absent", "correct"] })), status: "lost", guessCount: 6 } }));
  window.__opened = [];
  window.open = (u) => { window.__opened.push(String(u)); return null; };
  window.__gtag = [];
  Object.defineProperty(window, "gtag", { get: () => (...a) => window.__gtag.push(JSON.parse(JSON.stringify(a))), set: () => {}, configurable: false });
})();`;

// 1. キーボードで押してもダイアログが閉じない・背景と Esc では閉じる
{
  const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
  const ctx = await b.newContext({ viewport: { width: 375, height: 667 } });
  await ctx.grantPermissions(["clipboard-read", "clipboard-write"], { origin: BASE });
  await ctx.addInitScript(yojiInit + "delete Navigator.prototype.share;");
  const page = await ctx.newPage();
  const isOpen = () => page.evaluate(() => !!document.querySelector("dialog[open]"));
  for (const [button, key] of [["結果をコピー", "Enter"], ["結果をコピー", " "], ["LINE でシェア", "Enter"], ["X でシェア", " "], ["閉じる", "Enter"]]) {
    await page.goto(`${BASE}/play/yoji-kimeru`);
    await wait(3000);
    const before = await isOpen();
    const loc = page.locator("dialog[open]").getByRole("button", { name: new RegExp("^" + button) });
    await loc.focus();
    await page.keyboard.press(key === " " ? "Space" : key);
    await wait(500);
    const rec = await page.evaluate(() => ({
      open: !!document.querySelector("dialog[open]"),
      focused: document.activeElement?.textContent?.trim().slice(0, 20),
      status: document.querySelector("dialog[open] [role=status]")?.textContent ?? null,
      opened: window.__opened.length,
      gtag: window.__gtag.filter((a) => a[1] === "share").map((a) => a[2].method),
    }));
    const clip = button === "結果をコピー" ? await page.evaluate(() => navigator.clipboard.readText()) : undefined;
    results.push({ check: "keyboard", button, key: key === " " ? "Space" : key, before, ...rec, clipboardStart: clip?.slice(0, 20) });
  }
  // 背景を押すと閉じる
  await page.goto(`${BASE}/play/yoji-kimeru`);
  await wait(3000);
  await page.mouse.click(5, 5);
  await wait(300);
  results.push({ check: "backdrop-click", open: await isOpen() });
  // ダイアログの余白を押しても閉じない
  await page.goto(`${BASE}/play/yoji-kimeru`);
  await wait(3000);
  const box = await page.locator("dialog[open]").boundingBox();
  await page.mouse.click(box.x + 6, box.y + box.height / 2);
  await wait(300);
  results.push({ check: "padding-click", open: await isOpen() });
  // Esc で閉じる
  await page.keyboard.press("Escape");
  await wait(300);
  results.push({ check: "escape", open: await isOpen() });
  await b.close();
}

// 2. 道具の結果のコピー: API に拒まれても写せる（代わりの写し方）／どちらも失敗
for (const mode of ["api-ok", "api-denied", "all-fail"]) {
  const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
  const ctx = await b.newContext({ viewport: { width: 375, height: 667 } });
  await ctx.grantPermissions(["clipboard-read", "clipboard-write"], { origin: BASE });
  await ctx.addInitScript(`(() => {
    window.__exec = [];
    const real = Document.prototype.execCommand;
    Document.prototype.execCommand = function (c) {
      const a = document.activeElement;
      window.__exec.push(a && a.tagName === "TEXTAREA" ? a.value.slice(a.selectionStart, a.selectionEnd) : "");
      return ${mode === "all-fail" ? "false" : "real.apply(this, arguments)"};
    };
    ${mode === "api-ok" ? "" : `const orig = navigator.clipboard; Object.defineProperty(Navigator.prototype, "clipboard", { get: () => ({ writeText: () => Promise.reject(new Error("denied")), readText: () => orig.readText() }), configurable: true });`}
  })();`);
  const page = await ctx.newPage();
  await page.goto(`${BASE}/tools/fullwidth-converter`);
  await wait(1500);
  await page.locator("textarea").first().fill("ABC123");
  await wait(500);
  // 押すと名前が変わるので、名前でなく並びの位置で同じボタンを指す
  const btn = page.locator("main button", { hasText: /^コピー$/ }).first();
  const index = await btn.evaluate((el) => [...document.querySelectorAll("main button")].indexOf(el));
  const same = page.locator("main button").nth(index);
  await same.click();
  await wait(400);
  const label = await same.textContent();
  const rec = await page.evaluate(() => ({ exec: window.__exec }));
  const clip = await page.evaluate(() => navigator.clipboard.readText ? navigator.clipboard.readText().catch(() => null) : null);
  results.push({ check: "tool-copy", mode, buttonLabel: label, execSelected: rec.exec, clipboard: clip, textareasLeft: await page.locator("textarea[aria-hidden]").count() });
  await page.screenshot({ path: `${OUT}/tool-${mode}-375.png` });
  await b.close();
}

// 3. 共有の失敗の知らせ（375・1280 のライトとダーク）と、伝統色の詳細のコピー
{
  const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
  const ctx = await b.newContext({ viewport: { width: 375, height: 667 } });
  await ctx.addInitScript(yojiInit + `
    delete Navigator.prototype.share;
    Object.defineProperty(Navigator.prototype, "clipboard", { get: () => ({ writeText: () => Promise.reject(new Error("denied")) }), configurable: true });
    Document.prototype.execCommand = () => false;`);
  const page = await ctx.newPage();
  for (const [name, url, scope] of [["yojiGame", "/play/yoji-kimeru", "dialog[open]"], ["tool", "/tools/char-count", "main"]]) {
    await page.goto(BASE + url);
    await wait(3000);
    const btn = page.locator(scope).getByRole("button", { name: /^(結果をコピー|URLをコピー)$/ }).first();
    await btn.click();
    await wait(300);
    const lines = await btn.evaluate((el) => {
      const st = el.closest("div").parentElement.querySelector("[role=status]");
      const tops = [...st.querySelectorAll("span")].map((s) => [s.textContent, Math.round(s.getBoundingClientRect().top), s.getClientRects().length]);
      return { text: st.textContent, spans: tops };
    });
    results.push({ check: "fail-message", name, ...lines });
    for (const w of [375, 1280]) {
      await page.setViewportSize({ width: w, height: w === 375 ? 667 : 800 });
      for (const scheme of ["light", "dark"]) {
        await page.emulateMedia({ colorScheme: scheme });
        await btn.evaluate((el) => el.scrollIntoView({ block: "center" }));
        await wait(200);
        await page.screenshot({ path: `${OUT}/fail-${name}-${w}-${scheme}.png` });
      }
    }
    await page.setViewportSize({ width: 375, height: 667 });
    await page.emulateMedia({ colorScheme: "light" });
  }
  // 伝統色の詳細
  await page.goto(`${BASE}/dictionary/colors/toki`);
  await wait(1500);
  const cbtn = page.getByRole("button", { name: /をコピー$/ }).first();
  await cbtn.click();
  await wait(300);
  results.push({ check: "color-detail-all-fail", label: await cbtn.textContent() });
  await cbtn.evaluate((el) => el.scrollIntoView({ block: "center" }));
  await page.screenshot({ path: `${OUT}/color-detail-all-fail-375.png` });
  await b.close();
}
{
  const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
  const ctx = await b.newContext({ viewport: { width: 375, height: 667 } });
  await ctx.grantPermissions(["clipboard-read", "clipboard-write"], { origin: BASE });
  await ctx.addInitScript(`const o = navigator.clipboard; Object.defineProperty(Navigator.prototype, "clipboard", { get: () => ({ writeText: () => Promise.reject(new Error("denied")), readText: () => o.readText() }), configurable: true });`);
  const page = await ctx.newPage();
  await page.goto(`${BASE}/dictionary/colors/toki`);
  await wait(1500);
  const cbtn = page.getByRole("button", { name: /をコピー$/ }).first();
  await cbtn.click();
  await wait(300);
  results.push({ check: "color-detail-api-denied", label: await cbtn.textContent(), clipboard: await page.evaluate(() => navigator.clipboard.readText()) });
  await b.close();
}
fs.writeFileSync(`${OUT}/record.json`, JSON.stringify(results, null, 2));
for (const r of results) console.log(JSON.stringify(r));
