import { chromium } from "/home/user/yolo-web/node_modules/playwright/index.mjs";
import fs from "node:fs";
const BASE = "http://127.0.0.1:" + fs.readFileSync(new URL("./port", import.meta.url), "utf8").trim();
const LABEL = process.argv[2]; const out = [];
for (const font of [16, 32]) {
  const dir = `/home/user/yolo-web/tmp/cycle-316/review-t4-13-7/prof-s-${font}`; fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir + "/Default", { recursive: true });
  fs.writeFileSync(dir + "/Default/Preferences", JSON.stringify({ webkit: { webprefs: { default_font_size: font } } }));
  const ctx = await chromium.launchPersistentContext(dir, { executablePath: "/opt/pw-browsers/chromium", viewport: { width: 320, height: 568 } });
  const p = ctx.pages()[0];
  for (const [w, h] of [[320, 3000], [375, 3000], [1280, 3000], [1280, 5000]]) for (const path of ["/no-such-page-xyz", "/about", "/privacy"]) {
    await p.setViewportSize({ width: w, height: h });
    await p.goto(BASE + path, { waitUntil: "load" }); await p.waitForTimeout(200);
    const m = await p.evaluate(() => { const f = [...document.querySelectorAll("footer")].pop(); const r = f.getBoundingClientRect(); const mains = document.querySelector("main")?.getBoundingClientRect(); return { fb: Math.round(r.bottom), ih: innerHeight, docH: document.documentElement.scrollHeight, bodyH: Math.round(document.body.getBoundingClientRect().height), htmlH: Math.round(document.documentElement.getBoundingClientRect().height) }; });
    out.push(`${path} ${w}x${h} ${font}px: footerBottom ${m.fb}/${m.ih} docH ${m.docH} body ${m.bodyH} html ${m.htmlH}`);
    if (path === "/no-such-page-xyz" && h === 3000 && w !== 375) await p.screenshot({ path: `shots/short-${LABEL}-${w}-${font}.png` });
  }
  await ctx.close(); fs.rmSync(dir, { recursive: true, force: true });
}
console.log(out.join("\n"));
