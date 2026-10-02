const { chromium } = require("playwright");
(async () => {
  const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
  const p = await b.newPage();
  await p.setContent('<input type="range" style="width:100%;accent-color:#000">');
  console.log(await p.evaluate(() => { const e = document.querySelector("input"); const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return { h: r.height, m: cs.marginTop + " " + cs.marginBottom }; }));
  await b.close();
})();
