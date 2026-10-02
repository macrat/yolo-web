const { chromium } = require("playwright");
(async () => {
  const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
  const p = await b.newPage({ viewport: { width: 320, height: 200 }, deviceScaleFactor: 3 });
  await p.goto("file://" + __dirname + "/c.html");
  await p.screenshot({ path: __dirname + "/c-320.png", clip: { x: 40, y: 10, width: 200, height: 60 } });
  await b.close();
})();
