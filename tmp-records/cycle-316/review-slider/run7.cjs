const { chromium } = require("playwright");
(async () => {
  const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
  for (const mode of ["light", "dark"]) for (const v of [0, 100]) {
    const p = await b.newPage({ viewport: { width: 320, height: 200 }, deviceScaleFactor: 3 });
    await p.goto("file://" + __dirname + "/a.html");
    await p.evaluate(([m, v]) => { if (m === "dark") document.documentElement.classList.add("dark"); const e = document.getElementById("l"); e.value = v; e.dispatchEvent(new Event("input")); }, [mode, v]);
    const r = await p.evaluate(() => { const x = document.getElementById("l").getBoundingClientRect(); return { x: x.x, y: x.y, w: x.width }; });
    await p.screenshot({ path: `${__dirname}/l-${mode}-${v}.png`, clip: { x: v ? r.x + r.w - 60 : r.x, y: r.y, width: 60, height: 44 } });
    await p.close();
  }
  await b.close();
})();
