import { chromium } from "playwright";
const BASE = "http://localhost:3473";
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const yojiInit = `(() => {
  const today = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
  localStorage.setItem("yoji-kimeru-first-visit", "1");
  localStorage.setItem("yoji-kimeru-history-intermediate", JSON.stringify({ [today]: { guesses: Array(6).fill("一石二鳥"), feedbacks: Array.from({ length: 6 }, () => ({ guess: "一石二鳥", charFeedbacks: ["absent", "present", "absent", "correct"] })), status: "lost", guessCount: 6 } }));
  window.open = () => null;
  delete Navigator.prototype.share;
})();`;
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const res = [];
for (const touch of [false, true]) {
  const ctx = await b.newContext({ viewport: { width: 375, height: 667 }, hasTouch: touch, isMobile: touch });
  await ctx.grantPermissions(["clipboard-read", "clipboard-write"], { origin: BASE });
  await ctx.addInitScript(yojiInit);
  const page = await ctx.newPage();
  const isOpen = () => page.evaluate(() => !!document.querySelector("dialog[open]"));
  const load = async () => { await page.goto(`${BASE}/play/yoji-kimeru`); await wait(2500); return isOpen(); };
  const dlgBox = async () => page.locator("dialog[open]").boundingBox();
  if (!touch) {
    for (const [name, key] of [["結果をコピー","Enter"],["結果をコピー","Space"],["LINE","Enter"],["X","Space"],["閉じる","Enter"]]) {
      const pre = await load();
      await page.locator("dialog[open]").getByRole("button", { name: new RegExp("^" + name) }).first().focus();
      await page.keyboard.press(key);
      await wait(400);
      res.push({ touch, check: `key ${name} ${key}`, pre, open: await isOpen(), status: await page.evaluate(() => document.querySelector("dialog[open] [role=status]")?.textContent ?? null) });
    }
    await load(); await page.mouse.click(5, 5); await wait(300);
    res.push({ touch, check: "backdrop click", open: await isOpen() });
    await load(); let bx = await dlgBox(); await page.mouse.click(bx.x + 4, bx.y + bx.height / 2); await wait(300);
    res.push({ touch, check: "padding click", open: await isOpen() });
    await load(); await page.keyboard.press("Escape"); await wait(300);
    res.push({ touch, check: "Esc", open: await isOpen() });
    // drag from text inside to backdrop
    await load(); bx = await dlgBox();
    const txt = await page.locator("dialog[open] p, dialog[open] h2").first().boundingBox();
    await page.mouse.move(txt.x + 5, txt.y + txt.height / 2); await page.mouse.down();
    await page.mouse.move(bx.x + bx.width / 2, bx.y + bx.height + 20, { steps: 5 });
    await page.mouse.move(3, 660, { steps: 5 }); await page.mouse.up(); await wait(300);
    res.push({ touch, check: "drag inside->backdrop (select text)", open: await isOpen(), sel: await page.evaluate(() => String(getSelection()).slice(0, 30)) });
    // drag from backdrop to inside
    await load(); bx = await dlgBox();
    await page.mouse.move(3, 3); await page.mouse.down();
    await page.mouse.move(bx.x + bx.width / 2, bx.y + bx.height / 2, { steps: 5 }); await page.mouse.up(); await wait(300);
    res.push({ touch, check: "drag backdrop->inside", open: await isOpen() });
    // drag within padding to outside
    await load(); bx = await dlgBox();
    await page.mouse.move(bx.x + 4, bx.y + bx.height / 2); await page.mouse.down();
    await page.mouse.move(2, bx.y + bx.height / 2, { steps: 5 }); await page.mouse.up(); await wait(300);
    res.push({ touch, check: "drag padding->backdrop", open: await isOpen() });
    // info about dialog layout
    await load();
    res.push({ touch, info: await page.evaluate(() => { const d = document.querySelector("dialog[open]"); const cs = getComputedStyle(d); return { padding: cs.padding, overflow: cs.overflowY, sh: d.scrollHeight, ch: d.clientHeight, rect: d.getBoundingClientRect().toJSON() }; }) });
    await page.screenshot({ path: "/home/user/yolo-web/tmp/cycle-316/rv-t4-4-3/img/yoji-dialog-375.png" });
  } else {
    await load(); await page.touchscreen.tap(5, 5); await wait(300);
    res.push({ touch, check: "tap backdrop", open: await isOpen() });
    await load(); const bx = await dlgBox(); await page.touchscreen.tap(bx.x + 4, bx.y + bx.height / 2); await wait(300);
    res.push({ touch, check: "tap padding", open: await isOpen() });
    await load(); const btn = await page.locator("dialog[open]").getByRole("button", { name: /^結果をコピー/ }).boundingBox();
    await page.touchscreen.tap(btn.x + btn.width / 2, btn.y + btn.height / 2); await wait(400);
    res.push({ touch, check: "tap copy", open: await isOpen(), status: await page.evaluate(() => document.querySelector("dialog[open] [role=status]")?.textContent ?? null) });
  }
  await ctx.close();
}
await b.close();
console.log(JSON.stringify(res, null, 1));
