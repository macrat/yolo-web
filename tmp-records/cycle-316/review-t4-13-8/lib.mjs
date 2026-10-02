import { chromium } from "/home/user/yolo-web/node_modules/playwright/index.mjs";
import fs from "node:fs";
export const BASE = "http://127.0.0.1:37975";
export const URL = BASE + "/play/nakamawake";
export const DIR = "/home/user/yolo-web/tmp/cycle-316/review-t4-13-8";
export const TODAY = "2026-09-28";
export const G = { 1: ["袖", "襟", "帯", "裾"], 2: ["振袖", "留袖", "訪問着", "浴衣"], 3: ["お太鼓", "文庫", "角出し", "貝の口"], 4: ["絹", "紬", "縮緬", "銘仙"] };
export const WRONG = [["袖", "振袖", "お太鼓", "絹"], ["襟", "留袖", "文庫", "紬"], ["帯", "訪問着", "角出し", "縮緬"], ["裾", "浴衣", "貝の口", "銘仙"]];
const stats = JSON.stringify({ gamesPlayed: 123, gamesWon: 99, currentStreak: 13, maxStreak: 105, mistakeDistribution: [30, 20, 25, 24, 24], lastPlayedDate: TODAY });
const h = (e) => JSON.stringify({ [TODAY]: e });
export const SEEDS = {
  first: null,
  mid: { "nakamawake-stats": stats, "nakamawake-history": h({ solvedGroups: [1, 3], mistakes: 2, status: "playing" }) },
  won: { "nakamawake-stats": stats, "nakamawake-history": h({ solvedGroups: [1, 3, 2, 4], mistakes: 1, status: "won" }) },
  mid3: { "nakamawake-stats": stats, "nakamawake-history": h({ solvedGroups: [4, 1, 2], mistakes: 3, status: "playing" }) },
  mid0: { "nakamawake-stats": stats, "nakamawake-history": h({ solvedGroups: [], mistakes: 2, status: "playing" }) },
  lost0: { "nakamawake-stats": stats, "nakamawake-history": h({ solvedGroups: [], mistakes: 4, status: "lost" }) },
};
let n = 0;
export async function open({ width, height, font = 16, storage = null, dark = false }) {
  const dir = `${DIR}/prof/p${process.pid}-${n++}`;
  fs.mkdirSync(dir + "/Default", { recursive: true });
  fs.writeFileSync(dir + "/Default/Preferences", JSON.stringify({ webkit: { webprefs: { default_font_size: font } } }));
  const context = await chromium.launchPersistentContext(dir, { executablePath: "/opt/pw-browsers/chromium", viewport: { width, height }, colorScheme: dark ? "dark" : "light" });
  await context.route(/google|doubleclick|adsbygoogle/, (r) => r.abort());
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
    // sample positions each frame for 3s
    window.__pos = [];
    const t0 = performance.now();
    const tick = () => {
      const q = (f) => { const el = f(); return el ? Math.round(el.getBoundingClientRect().top) : null; };
      const chk = q(() => [...document.querySelectorAll("button")].find((b) => b.textContent.trim() === "チェック"));
      const share = q(() => document.getElementById("nakamawake-share"));
      const how = q(() => document.querySelector("main details"));
      const last = window.__pos[window.__pos.length - 1];
      const cur = [chk, share, how, Math.round(scrollY)];
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
export async function pick(page, w) { await page.getByRole("group", { name: "言葉の格子" }).getByRole("button", { name: w, exact: true }).click({ timeout: 5000 }); }
export async function guess(page, ws) { for (const w of ws) await pick(page, w); await page.getByRole("button", { name: "チェック" }).click({ timeout: 5000 }); await page.waitForTimeout(150); }
