const { chromium } = require("playwright");
(async () => {
  const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
  const dir = __dirname;
  for (const f of ["a", "b"]) {
    const p = await b.newPage({ viewport: { width: 320, height: 600 }, deviceScaleFactor: 2 });
    await p.goto("file://" + dir + "/" + f + ".html");
    const r = await p.evaluate(() => { const e = document.getElementById("h"); const x = e.getBoundingClientRect(); const cs = getComputedStyle(e); return { x: x.x, w: x.width, y: x.y, h: x.height, pad: cs.paddingLeft, bs: cs.boxSizing, doc: document.documentElement.scrollWidth, pw: (()=>{const q=document.getElementById('pw').getBoundingClientRect();return [q.x,q.width,q.right]})() }; });
    console.log(f, JSON.stringify(r));
    await p.screenshot({ path: `${dir}/${f}-320.png`, clip: { x: 0, y: 0, width: 320, height: 260 } });
    await p.close();
  }
  await b.close();
})();
