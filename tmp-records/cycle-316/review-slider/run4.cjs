const { chromium } = require("playwright");
(async () => {
  const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
  const dir = __dirname;
  for (const mode of ["light", "dark"]) {
    const p = await b.newPage({ viewport: { width: 375, height: 400 }, deviceScaleFactor: 4 });
    await p.goto("file://" + dir + "/a.html");
    if (mode === "dark") await p.evaluate(() => document.documentElement.classList.add("dark"));
    await p.evaluate(() => { const e = document.getElementById("h"); e.value = 120; e.dispatchEvent(new Event("input")); e.focus(); });
    await p.keyboard.press("ArrowRight");
    const r = await p.evaluate(() => { const x = document.getElementById("h").getBoundingClientRect(); return { x: x.x, y: x.y, w: x.width }; });
    await p.screenshot({ path: `${dir}/zoom-focus-${mode}.png`, clip: { x: r.x, y: r.y - 2, width: 150, height: 48 } });
    await p.close();
  }
  await b.close();
})();
