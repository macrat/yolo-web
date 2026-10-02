import { chromium } from "/home/user/yolo-web/node_modules/playwright/index.mjs";
import fs from "node:fs";
const BASE = "http://127.0.0.1:" + fs.readFileSync(new URL("./port", import.meta.url), "utf8").trim();
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium", ignoreDefaultArgs: ["--hide-scrollbars"] });
const inj = process.argv[2] === "old" ? "html,body{max-width:100vw!important}body{min-height:100svh!important}html{height:auto!important}" : null;
for (const w of [1280, 375]) { const p = await b.newPage({ viewport: { width: w, height: 800 } });
for (const path of ["/", "/blog/javascript-date-pitfalls-and-fixes", "/play/nakamawake", "/dictionary/colors/aoni", "/tools/bmi-calculator"]) {
  await p.goto(BASE + path, { waitUntil: "load" }); if (inj) await p.addStyleTag({ content: inj }); await p.waitForTimeout(200);
  const m = await p.evaluate(() => { scrollTo(9999, 0); const sx = scrollX; scrollTo(0,0); const hr = [...document.querySelectorAll("body *")].reduce((mx, e) => Math.max(mx, e.getBoundingClientRect().right), 0); return { iw: innerWidth, cw: document.documentElement.clientWidth, sw: document.documentElement.scrollWidth, bsw: document.body.scrollWidth, sx, maxRight: Math.round(hr) }; });
  console.log(w, path, JSON.stringify(m));
  if (path === "/" && w===1280) await p.screenshot({ path: `shots/sb-${process.argv[2]}.png` });
} await p.close(); }
await b.close();
