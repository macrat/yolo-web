// node crop.cjs out.png w h  png1:y1 png2:y2 ... : 複数の PNG の y から高さ h を切り出して横に並べる
const { chromium } = require("../node_modules/playwright");
const path = require("path");
(async () => {
  const [out, w, h, ...specs] = process.argv.slice(2);
  const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
  const p = await b.newPage({ viewport: { width: (+w + 10) * specs.length, height: +h } });
  const html = specs.map((s) => { const [f, y] = s.split(":"); return `<div style="width:${w}px;height:${h}px;overflow:hidden;display:inline-block;margin-right:10px;vertical-align:top;outline:1px solid red"><img src="data:image/png;base64,${require("fs").readFileSync(f).toString("base64")}" style="display:block;margin-top:-${y}px"></div>`; }).join("");
  await p.setContent(`<body style="margin:0;background:#888;white-space:nowrap">${html}</body>`);
  await p.waitForTimeout(500);
  await p.screenshot({ path: out });
  await b.close();
})();
