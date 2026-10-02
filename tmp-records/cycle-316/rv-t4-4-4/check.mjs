import { chromium } from "playwright";
const BASE = "http://localhost:3494";
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const init = `(() => {
  const today = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);
  localStorage.setItem("yoji-kimeru-first-visit", "1");
  localStorage.setItem("yoji-kimeru-history-intermediate", JSON.stringify({ [today]: { guesses: Array(6).fill("一石二鳥"), feedbacks: Array.from({ length: 6 }, () => ({ guess: "一石二鳥", charFeedbacks: ["absent", "present", "absent", "correct"] })), status: "lost", guessCount: 6 } }));
  window.open = () => null;
})();`;
const res = [];
for (const [w, h] of [[375, 667], [1280, 800]]) {
  const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
  const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: true });
  await ctx.addInitScript(init);
  const page = await ctx.newPage();
  const isOpen = () => page.evaluate(() => !!document.querySelector("dialog[open]"));
  const fresh = async () => { await page.goto(`${BASE}/play/yoji-kimeru`); await wait(2500); return page.locator("dialog[open]").boundingBox(); };
  const out = (c, v) => res.push(`${w} ${c}: open=${v}`);
  let box = await fresh();
  const bg = [Math.max(2, box.x - 8), Math.max(2, box.y - 8)];
  // drag in->out then back in, release inside
  const t = await page.locator("dialog[open] p").first().boundingBox();
  await page.mouse.move(t.x + 5, t.y + 5); await page.mouse.down();
  await page.mouse.move(...bg, { steps: 6 }); await page.mouse.move(t.x + 30, t.y + 5, { steps: 6 }); await page.mouse.up(); await wait(200);
  out("drag in->out->in", await isOpen());
  // then a normal backdrop click must still close
  await page.mouse.click(...bg); await wait(200);
  out("after that, click backdrop", await isOpen());
  // drag within backdrop
  box = await fresh();
  await page.mouse.move(...bg); await page.mouse.down(); await page.mouse.move(bg[0] + 1, bg[1] + 200, { steps: 5 }); await page.mouse.up(); await wait(200);
  out("drag backdrop->backdrop", await isOpen());
  // backdrop->inside then backdrop click
  box = await fresh();
  await page.mouse.move(...bg); await page.mouse.down(); await page.mouse.move(box.x + 50, box.y + 50, { steps: 5 }); await page.mouse.up(); await wait(200);
  out("drag backdrop->inside", await isOpen());
  await page.mouse.click(...bg); await wait(200);
  out("then click backdrop", await isOpen());
  // right-click on backdrop then keyboard enter on button
  box = await fresh();
  await page.mouse.click(...bg, { button: "right" }); await page.keyboard.press("Escape").catch(()=>{}); await wait(200);
  res.push(`${w} right-click backdrop(+Esc for menu): open=${await isOpen()}`);
  // touch swipe from text to backdrop (CDP touch)
  box = await fresh();
  const cdp = await ctx.newCDPSession(page);
  const tp = await page.locator("dialog[open] p").first().boundingBox();
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: tp.x + 5, y: tp.y + 5 }] });
  for (let i = 1; i <= 8; i++) await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: tp.x + 5 + (bg[0] - tp.x) * i / 8, y: tp.y + 5 + (bg[1] - tp.y) * i / 8 }] });
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] }); await wait(300);
  out("touch swipe text->backdrop", await isOpen());
  // close button
  box = await fresh();
  await page.locator("dialog[open]").getByRole("button", { name: /閉じる/ }).first().click(); await wait(200);
  out("閉じる button", await isOpen());
  // scroll inside dialog with wheel then click backdrop
  box = await fresh();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await page.mouse.wheel(0, 300); await wait(200);
  await page.mouse.click(...bg); await wait(200);
  out("wheel inside then click backdrop", await isOpen());
  // stats/how-to dialogs: open 遊び方 and click backdrop
  box = await fresh();
  await page.keyboard.press("Escape"); await wait(200);
  const help = page.getByRole("button", { name: /遊び方/ }).first();
  if (await help.count()) { await help.click(); await wait(400); const bb = await page.locator("dialog[open]").boundingBox();
    out("遊び方 opened", await isOpen()); await page.mouse.click(Math.max(2, bb.x - 8), Math.max(2, bb.y - 8)); await wait(200); out("遊び方 backdrop click", await isOpen()); }
  await b.close();
}
console.log(res.join("\n"));
