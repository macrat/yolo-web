const { open, setVal, BASE, DIR } = require("./lib.cjs");
const { PNG } = (() => { try { return require("/home/user/yolo-web/node_modules/pngjs"); } catch { return {}; } })();
function hsl2rgb(h, s, l) { s /= 100; l /= 100; const k = (n) => (n + h / 30) % 12; const a = s * Math.min(l, 1 - l); const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1))); return [255 * f(0), 255 * f(8), 255 * f(4)].map(Math.round); }
(async () => {
  for (const [width, theme] of [[320, "light"], [375, "dark"], [1280, "light"]]) {
    const { page, close } = await open({ width, theme, touch: width < 1000 });
    await page.goto(BASE + "/play/irodori", { waitUntil: "load" }); await page.evaluate(() => document.fonts.ready);
    const dec = async () => { const buf = await page.screenshot(); return page.evaluate(async (b64) => { const im = new Image(); im.src = "data:image/png;base64," + b64; await im.decode(); const c = document.createElement("canvas"); c.width = im.width; c.height = im.height; const x = c.getContext("2d"); x.drawImage(im, 0, 0); window.__img = x.getImageData(0, 0, im.width, im.height); return im.width; }, buf.toString("base64")); };
    const px = (x, y) => page.evaluate(([x, y]) => { const d = window.__img; const i = (y * d.width + x) * 4; return [d.data[i], d.data[i + 1], d.data[i + 2]]; }, [x, y]);
    const rowScan = (y, x0, x1) => page.evaluate(([y, x0, x1]) => { const d = window.__img; const out = []; for (let x = x0; x < x1; x++) { const i = (y * d.width + x) * 4; out.push([d.data[i], d.data[i + 1], d.data[i + 2]]); } return out; }, [y, x0, x1]);
    const rows = [];
    for (const [idx, max, S, L, H] of [[0, 360, 100, 50, null], [0, 360, 20, 25, null], [1, 100, null, 25, 200], [2, 100, 60, null, 30]]) {
      if (idx === 0) { await setVal(page, 1, S); await setVal(page, 2, L); }
      if (idx === 1) { await setVal(page, 0, H); await setVal(page, 2, L); }
      if (idx === 2) { await setVal(page, 0, H); await setVal(page, 1, S); }
      const vals = idx === 0 ? [0, 30, 60, 120, 180, 240, 300, 360] : [0, 25, 50, 75, 100];
      for (const v of vals) {
        await setVal(page, idx, v); await page.waitForTimeout(60);
        const g = await page.evaluate((i) => { const inp = document.querySelectorAll('input[type="range"]')[i]; const r = inp.getBoundingClientRect(); window.scrollBy(0, r.y - 200); const r2 = inp.getBoundingClientRect(); return { x: r2.x, y: r2.y, w: r2.width }; }, idx);
        await dec();
        const trackX = g.x + 8, trackW = g.w - 16;
        // row 4px above track top: track top = y + 14
        const yRow = Math.round(g.y + 14 - 4);
        const scan = await rowScan(yRow, Math.floor(g.x), Math.ceil(g.x + g.w));
        const bg = scan[0]; const dark = []; scan.forEach((c, i) => { if (Math.abs(c[0] - bg[0]) + Math.abs(c[1] - bg[1]) + Math.abs(c[2] - bg[2]) > 60) dark.push(i + Math.floor(g.x)); });
        const thumbC = (dark[0] + dark[dark.length - 1] + 1) / 2; if (v === 0) console.log("dark", idx, JSON.stringify(dark), JSON.stringify(bg));
        const expect = trackX + 8 + (trackW - 16) * (v / max);
        // colour: hide thumb
        await page.addStyleTag({ content: 'input[type="range"]::-webkit-slider-thumb{opacity:0!important}' });
        await page.waitForTimeout(50); await dec();
        const cx = Math.floor(expect); const c = await px(cx, Math.round(g.y + 22));
        const h = idx === 0 ? v % 360 : H, s = idx === 1 ? v : S, l = idx === 2 ? v : L;
        const e = hsl2rgb(h, s, l);
        await page.evaluate(() => document.querySelectorAll("style").forEach((s) => s.textContent.includes("opacity:0!important") && s.remove()));
        rows.push({ idx, S, L, H, v, thumbC, expect: +expect.toFixed(2), dx: +(thumbC - expect).toFixed(2), rgb: c.join(","), exp: e.join(","), dRGB: Math.max(...c.map((q, k) => Math.abs(q - e[k]))) });
      }
    }
    console.log(width, theme); console.table(rows);
    console.log("max |dx|", Math.max(...rows.map((r) => Math.abs(r.dx))), "max dRGB", Math.max(...rows.map((r) => r.dRGB)));
    await close();
  }
})();
