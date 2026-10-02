const { chromium } = require("playwright");
(async () => {
  const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
  const dir = __dirname;
  const helper = await b.newPage();
  const decode = async (buf) => helper.evaluate(async (d) => { const im = new Image(); im.src = "data:image/png;base64," + d; await im.decode(); const c = document.createElement("canvas"); c.width = im.width; c.height = im.height; const g = c.getContext("2d"); g.drawImage(im, 0, 0); return { w: im.width, h: im.height, data: Array.from(g.getImageData(0, 0, im.width, im.height).data) }; }, buf.toString("base64"));
  for (const vw of [320, 1280]) {
  const p = await b.newPage({ viewport: { width: vw, height: 600 }, deviceScaleFactor: 1 });
  await p.goto("file://" + dir + "/a.html");
  const setH = (v) => p.evaluate((v) => { const e = document.getElementById("h"); e.value = v; e.dispatchEvent(new Event("input")); }, v);
  const r = await p.evaluate(() => { const x = document.getElementById("h").getBoundingClientRect(); return { x: x.x, w: x.width, y: x.y }; });
  console.log("vw", vw, "track border-box x", r.x + 8, "w", r.w - 16);
  for (const v of [0, 30, 60, 120, 180, 240, 300, 360]) {
    await setH(v);
    const img = await decode(await p.screenshot({ clip: { x: 0, y: r.y + 8, width: vw, height: 1 } }));
    const xs = []; for (let x = Math.ceil(r.x); x < r.x + r.w; x++) { const i = x * 4; if (img.data[i] < 60 && img.data[i + 1] < 60 && img.data[i + 2] < 60) xs.push(x); }
    const cx = (Math.min(...xs) + Math.max(...xs) + 1) / 2;
    await setH(v < 180 ? 360 : 0);
    const g = await decode(await p.screenshot({ clip: { x: Math.floor(cx), y: r.y + 22, width: 1, height: 1 } }));
    const [R, G, B] = g.data.slice(0, 3).map((c) => c / 255); const mx = Math.max(R, G, B), mn = Math.min(R, G, B); let h;
    if (mx === mn) h = 0; else if (mx === R) h = (60 * ((G - B) / (mx - mn)) + 360) % 360; else if (mx === G) h = 60 * ((B - R) / (mx - mn)) + 120; else h = 60 * ((R - G) / (mx - mn)) + 240;
    console.log(`  value ${v}: thumb center x=${cx}, track color there hue≈${h.toFixed(1)}`);
  }
  await p.close();
  }
  await b.close();
})();
