// 使い方: node shots.mjs <baseUrl> <label>
// /play/daily を、決めた種（運勢）で、幅と配色ごとに撮る。
import { chromium } from "/home/user/yolo-web/node_modules/playwright/index.mjs";
import fs from "node:fs";
const [base, label] = process.argv.slice(2);
const out = "/home/user/yolo-web/tmp/cycle-316/t4-8";
const seeds = JSON.parse(fs.readFileSync(`${out}/seeds.json`, "utf8"));
const pick = (t) => seeds.entries.find((e) => e.title === t);
const samples = [pick("メガネ運 ピント合ってます"), pick("傘運 やや上向き")];
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const report = [];
for (const sample of samples) {
  for (const [w, h] of [[375, 667], [1280, 800], [320, 667]]) {
    for (const scheme of ["light", "dark"]) {
      const ctx = await browser.newContext({ viewport: { width: w, height: h }, colorScheme: scheme });
      await ctx.addInitScript((s) => { try { localStorage.setItem("yolos-fortune-seed", String(s)); } catch {} }, sample.seed);
      const page = await ctx.newPage();
      await page.goto(`${base}/play/daily`, { waitUntil: "networkidle", timeout: 30000 });
      await page.waitForTimeout(800);
      const name = `${label}-${sample.id}-${w}x${h}-${scheme}`;
      await page.screenshot({ path: `${out}/${name}.png` });
      await page.screenshot({ path: `${out}/${name}-full.png`, fullPage: true });
      const info = await page.evaluate(() => {
        const r = (el) => { if (!el) return null; const b = el.getBoundingClientRect(); return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height), bottom: Math.round(b.bottom) }; };
        const box = document.querySelector("main section[aria-labelledby]");
        const heading = box?.querySelector("h2");
        const stars = [...document.querySelectorAll("main *")].find((e) => e.children.length === 0 && /^[★☆]+$/.test(e.textContent.trim()));
        const starsAll = [...document.querySelectorAll("main *")].filter((e) => /[★☆]/.test([...e.childNodes].filter(n=>n.nodeType===3).map(n=>n.data).join("")));
        const ink = getComputedStyle(document.documentElement).getPropertyValue("--ink").trim();
        const probe = document.createElement("span"); probe.style.color = "var(--ink)"; document.body.appendChild(probe); const inkRgb = getComputedStyle(probe).color; probe.remove();
        const seal = [...document.querySelectorAll("main *")].some((e) => e.children.length === 0 && e.textContent.trim() === "占");
        const tsutsumi = !!document.querySelector('main [class*="Tsutsumi"], main [class*="tsutsumi"]');
        return {
          scrollWidth: document.documentElement.scrollWidth, innerWidth: innerWidth,
          box: r(box), boxTag: box?.tagName, boxName: box ? document.getElementById(box.getAttribute("aria-labelledby"))?.textContent : null,
          heading: r(heading), headingText: heading?.textContent, headingFontSize: heading && getComputedStyle(heading).fontSize, headingFont: heading && getComputedStyle(heading).fontFamily.slice(0, 40),
          starText: starsAll.map((e) => e.textContent), starColors: starsAll.map((e) => getComputedStyle(e).color), inkRgb, ink,
          starRole: starsAll.map((e) => e.closest("[role=img]")?.getAttribute("aria-label") ?? e.getAttribute("aria-label")),
          tsutsumi, seal, h1: document.querySelector("main h1")?.textContent ?? null,
          boxAnimation: box ? getComputedStyle(box).animationName : null,
          shareBtn: r([...document.querySelectorAll("main button")][0]),
        };
      });
      report.push({ name, fortune: sample.title, ...info });
      await ctx.close();
    }
  }
}
fs.writeFileSync(`${out}/${label}-shots.json`, JSON.stringify(report, null, 1));
console.log(JSON.stringify(report.filter((r) => r.name.includes("light")).map((r) => ({ n: r.name, sw: r.scrollWidth, box: r.box, h: r.heading, hfs: r.headingFontSize, stars: r.starText, sc: r.starColors, ink: r.inkRgb, role: r.starRole, ts: r.tsutsumi, seal: r.seal, h1: r.h1, share: r.shareBtn })), null, 0));
await browser.close();
