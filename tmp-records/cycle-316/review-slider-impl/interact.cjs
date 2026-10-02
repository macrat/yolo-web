const { open, measure, setVal, BASE, DIR } = require("./lib.cjs");
(async () => {
  const { page, close } = await open({ width: 375 });
  await page.goto(BASE + "/play/irodori", { waitUntil: "load" }); await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(500);
  const val = (i) => page.evaluate((i) => document.querySelectorAll('input[type="range"]')[i].value, i);
  const status = () => page.evaluate(() => document.querySelector('[style*="--slider-fixed"] [role="status"]').textContent);
  const active = () => page.evaluate(() => { const a = document.activeElement; return a.tagName + (a.getAttribute("aria-label") ? ":" + a.getAttribute("aria-label") : a.id ? "#" + a.id : ""); });
  const hue = page.locator('input[type="range"]').nth(0);
  // (k) aria
  console.log("ARIA\n" + (await page.locator('[style*="--slider-fixed"]').ariaSnapshot()));
  // touch-action + tabindex
  console.log("buttons", JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('[style*="--slider-fixed"] button')].map((b) => [b.getAttribute("aria-label"), getComputedStyle(b).touchAction, b.tabIndex, b.getAttribute("aria-disabled")]))));
  // (f) keys
  await hue.focus(); await page.keyboard.press("Home"); const k = [await val(0)];
  for (const key of ["ArrowRight", "ArrowUp", "PageUp", "ArrowLeft", "PageDown", "End"]) { await page.keyboard.press(key); k.push(key + "=" + (await val(0))); }
  console.log("keys", k.join(" "), "status after keys:", JSON.stringify(await status()));
  // Tab order
  await page.keyboard.press("Home"); const tabs = [];
  for (let i = 0; i < 4; i++) { await page.keyboard.press("Tab"); tabs.push(await active()); }
  console.log("tab order from hue:", tabs.join(" | "));
  // (g) taps with touch on saturation row, focus on body first
  await page.evaluate(() => document.activeElement.blur());
  await setVal(page, 1, 50); await page.waitForTimeout(100);
  const incS = page.getByRole("button", { name: "彩度を1増やす" }); const decS = page.getByRole("button", { name: "彩度を1減らす" });
  await incS.tap(); console.log("tap + ->", await val(1), "status", JSON.stringify(await status()), "active", await active());
  for (let i = 0; i < 5; i++) await incS.tap({ delay: 0 });
  console.log("5 fast taps ->", await val(1), "status", JSON.stringify(await status()));
  // fast double-tap via raw touch events
  const bb = await incS.boundingBox(); const cx = bb.x + bb.width / 2, cy = bb.y + bb.height / 2;
  const before = await val(1); const t0 = Date.now();
  for (let i = 0; i < 6; i++) await page.touchscreen.tap(cx, cy);
  console.log("6 raw taps in", Date.now() - t0, "ms:", before, "->", await val(1), "zoom", await page.evaluate(() => visualViewport.scale));
  // mouse click after focusing slider keeps focus; announcements suppressed
  const sat = page.locator('input[type="range"]').nth(1); await sat.focus();
  await incS.click(); console.log("click + with slider focused ->", await val(1), "active", await active(), "status", JSON.stringify(await status()));
  await page.keyboard.press("ArrowRight"); console.log("arrow after click ->", await val(1));
  // edge disable: go to 99 then +
  await setVal(page, 1, 99); await page.evaluate(() => document.activeElement.blur()); await page.waitForTimeout(50);
  await incS.focus(); // SR-like focus on the button
  await incS.click(); console.log("to max:", await val(1), "aria-disabled", await incS.getAttribute("aria-disabled"), "active", await active(), "status", JSON.stringify(await status()));
  await incS.click({ force: true }); await page.touchscreen.tap((await incS.boundingBox()).x+22,(await incS.boundingBox()).y+22); console.log("press disabled:", await val(1), "status", JSON.stringify(await status()), "active", await active());
  await page.evaluate(() => { const b = document.activeElement; b.blur(); b.focus({ focusVisible: true }); });
  await page.keyboard.press("Shift"); // make focus-visible heuristics keyboard
  await page.waitForTimeout(100);
  const incBox = await incS.boundingBox();
  await page.screenshot({ path: `${DIR}/shots/disabled-focus-375.png`, clip: { x: incBox.x - 60, y: incBox.y - 20, width: 130, height: 84 } });
  console.log("disabled focus: focus-visible", await incS.evaluate((b) => b.matches(":focus-visible")), "after inset", await incS.evaluate((b) => getComputedStyle(b, "::after").inset), "outline", await incS.evaluate((b) => getComputedStyle(b).outlineStyle + " " + getComputedStyle(b).boxShadow));
  // hue 0 / 360 focus ring & thumb screenshot
  await setVal(page, 0, 0); await hue.focus(); await page.keyboard.press("ArrowLeft");
  const hb = await hue.boundingBox();
  await page.screenshot({ path: `${DIR}/shots/focus-hue0-375.png`, clip: { x: hb.x - 60, y: hb.y - 8, width: hb.width + 160, height: 60 } });
  await page.keyboard.press("End");
  await page.screenshot({ path: `${DIR}/shots/focus-hue360-375.png`, clip: { x: hb.x - 60, y: hb.y - 8, width: hb.width + 160, height: 60 } });
  // hover
  await page.evaluate(() => document.activeElement.blur());
  await close();
  // hover on desktop
  const d = await open({ width: 1280, touch: false });
  await d.page.goto(BASE + "/play/irodori", { waitUntil: "load" }); await d.page.evaluate(() => document.fonts.ready);
  const h2 = d.page.locator('input[type="range"]').nth(0); await h2.hover(); const hb2 = await h2.boundingBox();
  await d.page.screenshot({ path: `${DIR}/shots/hover-hue-1280.png`, clip: { x: hb2.x - 60, y: hb2.y - 8, width: hb2.width + 200, height: 60 } });
  const ib = d.page.getByRole("button", { name: "色相を1増やす" }); await ib.hover();
  await d.page.screenshot({ path: `${DIR}/shots/hover-inc-1280.png`, clip: { x: hb2.x + hb2.width - 60, y: hb2.y - 8, width: 200, height: 60 } });
  console.log("hover inc style", await ib.evaluate((b) => getComputedStyle(b).boxShadow + " | " + getComputedStyle(b).outline));
  // mouse click on +: focus stays on body/elsewhere
  await ib.click(); console.log("desktop click + active:", await d.page.evaluate(() => document.activeElement.tagName));
  await d.close();
})();
