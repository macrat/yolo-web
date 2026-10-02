const { chromium } = require("playwright");
(async () => {
  const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
  const dir = __dirname;
  const ctx = await b.newContext({ viewport: { width: 320, height: 600 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
  const p = await ctx.newPage();
  await p.goto("file://" + dir + "/a.html");
  const r = await p.evaluate(() => { const x = document.getElementById("s2").getBoundingClientRect(); return { x: x.x, w: x.width, y: x.y, h: x.height }; });
  const val = () => p.evaluate(() => document.getElementById("s2").value);
  const reset = () => p.evaluate(() => { const e = document.getElementById("s2"); e.value = 50; });
  console.log("rect", r);
  for (const [name, x, y] of [["track 1/4", r.x + 8 + (r.w - 16) * 0.25, r.y + 22], ["above track (y+4)", r.x + 8 + (r.w - 16) * 0.25, r.y + 4], ["below track (y+40)", r.x + 8 + (r.w - 16) * 0.75, r.y + 40], ["left pad (x+3)", r.x + 3, r.y + 22], ["right pad", r.x + r.w - 3, r.y + 22]]) {
    await reset(); await p.touchscreen.tap(x, y); console.log(name, "->", await val());
  }
  // mouse click focus-visible
  const ctx2 = await b.newContext({ viewport: { width: 320, height: 600 } });
  const q = await ctx2.newPage(); await q.goto("file://" + dir + "/a.html");
  await q.mouse.click(r.x + 30, r.y + 22);
  console.log("mouse click focus-visible:", await q.evaluate(() => document.activeElement.id + " " + document.activeElement.matches(":focus-visible")));
  await q.keyboard.press("ArrowRight");
  console.log("after key focus-visible:", await q.evaluate(() => document.activeElement.matches(":focus-visible")));
  // CDP touch: start on slider, move vertically
  const cdp = await ctx.newCDPSession(p);
  await reset();
  const sx = r.x + 8 + (r.w - 16) * 0.2, sy = r.y + 22;
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: sx, y: sy }] });
  console.log("after touchStart value", await val());
  for (let i = 1; i <= 5; i++) await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: sx, y: sy - i * 20 }] });
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  console.log("after vertical swipe value", await val(), "scrollY", await p.evaluate(() => scrollY));
  // focus ring screenshot
  await q.evaluate(() => document.documentElement.classList.remove("dark"));
  await q.evaluate(() => { const e = document.getElementById("s2"); e.value = 100; e.dispatchEvent(new Event("input")); document.getElementById("h").focus(); });
  await q.keyboard.press("ArrowLeft"); await q.keyboard.press("ArrowRight");
  await q.setViewportSize({ width: 320, height: 600 });
  await q.screenshot({ path: dir + "/focus-light.png", clip: { x: 40, y: 8, width: 280, height: 150 } });
  await q.evaluate(() => document.documentElement.classList.add("dark"));
  await q.screenshot({ path: dir + "/focus-dark.png", clip: { x: 40, y: 8, width: 280, height: 150 } });
  await q.hover("#l"); await q.screenshot({ path: dir + "/hover-dark.png", clip: { x: 40, y: 8, width: 280, height: 150 } });
  await b.close();
})();
