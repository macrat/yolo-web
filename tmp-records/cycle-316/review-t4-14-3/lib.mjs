import { chromium } from "/home/user/yolo-web/node_modules/playwright/index.mjs";
import fs from "node:fs";
export const BASE = "http://127.0.0.1:4731";
export const URL = BASE + "/play/irodori";
export const DIR = "/home/user/yolo-web/tmp/cycle-316/review-t4-14-3";
export const TODAY = "2026-09-28";
const stats = JSON.stringify({ gamesPlayed: 12, averageScore: 70, bestScore: 92, currentStreak: 3, maxStreak: 5, lastPlayedDate: TODAY, scoreDistribution: [0, 0, 0, 1, 1, 2, 3, 3, 1, 1] });
const h = (e) => JSON.stringify({ [TODAY]: e });
const ans = { h: 120, s: 50, l: 50 };
export const SEEDS = {
  first: null,
  mid: { "irodori-stats": stats, "irodori-history": h({ scores: [80, 70, null, null, null], answers: [ans, ans, null, null, null], totalScore: null, currentRound: 2, status: "playing" }) },
  done: { "irodori-stats": stats, "irodori-history": h({ scores: [80, 70, 60, 90, 50], answers: [ans, ans, ans, ans, ans], totalScore: 70, currentRound: 5, status: "completed" }) },
};
let n = 0;
export async function open({ width, height, font = 16, storage = null, dark = false, touch = width < 700, blockFonts = false }) {
  const dir = `${DIR}/prof/p${process.pid}-${n++}`;
  fs.mkdirSync(dir + "/Default", { recursive: true });
  fs.writeFileSync(dir + "/Default/Preferences", JSON.stringify({ webkit: { webprefs: { default_font_size: font } } }));
  const context = await chromium.launchPersistentContext(dir, { executablePath: "/opt/pw-browsers/chromium", viewport: { width, height }, colorScheme: dark ? "dark" : "light", hasTouch: touch, isMobile: touch });
  await context.route(/google|doubleclick|adsbygoogle/, (r) => r.abort());
  if (blockFonts) await context.route(/\.(woff2?|ttf|otf)(\?|$)/, (r) => r.abort());
  await context.addInitScript((storage) => {
    if (storage && !sessionStorage.getItem("__seeded")) {
      for (const [k, v] of Object.entries(storage)) localStorage.setItem(k, v);
      sessionStorage.setItem("__seeded", "1");
    }
    window.__gtag = [];
    const rec = function () { window.__gtag.push(JSON.parse(JSON.stringify(Array.from(arguments)))); };
    Object.defineProperty(window, "gtag", { get: () => rec, set: () => {}, configurable: false });
    window.__cls = [];
    new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__cls.push({ t: Math.round(e.startTime), v: e.value, input: e.hadRecentInput, src: (e.sources || []).map((s) => (s.node && (s.node.className || s.node.nodeName)) + "") }); }).observe({ type: "layout-shift", buffered: true });
    window.__pos = [];
    const t0 = performance.now();
    const tick = () => {
      const q = (f) => { const el = f(); return el ? Math.round(el.getBoundingClientRect().top) : null; };
      const dec = q(() => [...document.querySelectorAll("button")].find((b) => b.textContent.trim() === "決定"));
      const share = q(() => [...document.querySelectorAll("h2")].find((b) => b.textContent.trim() === "この結果を共有"));
      const how = q(() => document.querySelector("main details"));
      const last = window.__pos[window.__pos.length - 1];
      const cur = [dec, share, how, Math.round(scrollY)];
      if (!last || last[1].join() !== cur.join()) window.__pos.push([Math.round(performance.now() - t0), cur]);
      if (performance.now() - t0 < 3000) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, storage);
  const page = context.pages()[0] ?? (await context.newPage());
  return { context, page, dir };
}
export async function close(o) { await o.context.close(); fs.rmSync(o.dir, { recursive: true, force: true }); }
export async function cls(page) {
  return page.evaluate(() => ({ total: +window.__cls.filter((e) => !e.input).reduce((a, e) => a + e.v, 0).toFixed(4), src: [...new Set(window.__cls.filter((e) => !e.input && e.v > 0.0005).flatMap((e) => e.src))].join("|").slice(0, 200) }));
}
export async function settle(page, ms = 1200) { await page.evaluate(() => document.fonts.ready.then(() => 0)); await page.waitForTimeout(ms); }
export async function rootPx(page) { return page.evaluate(() => getComputedStyle(document.documentElement).fontSize); }
