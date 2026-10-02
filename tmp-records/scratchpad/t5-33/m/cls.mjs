// node m/cls.mjs <port> <games> <scenarios> [runs]
// Load CLS with layout-shift sources. Throttled (50KB/s, 400ms RTT, CPU 4x, mobile) unless NOTHROTTLE=1.
// Scenarios: fresh | playing | finished (no remembered result height) | remembered (same size) | estimated (remembered at another width)
import { chromium } from "playwright";
import fs from "node:fs";

const [port, gamesArg = "irodori", scenArg = "fresh,finished,remembered", runsArg = "1"] = process.argv.slice(2);
const RUNS = Number(runsArg);
const THROTTLE = !process.env.NOTHROTTLE;
const DESKTOP = !!process.env.DESKTOP;
const base = `http://localhost:${port}`;
const TODAY = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
const raw = JSON.parse(fs.readFileSync(new URL("./seeds.json", import.meta.url), "utf8").replaceAll("2026-09-30", TODAY));
for (const g in raw) for (const k in raw[g]) {
  if (!/stats/.test(k)) continue;
  const o = JSON.parse(raw[g][k]);
  if (!("gamesPlayed" in o)) continue;
  Object.assign(o, { gamesPlayed: 1234, currentStreak: 365, maxStreak: 1000 });
  if ("gamesWon" in o) o.gamesWon = 1001;
  if ("averageScore" in o) Object.assign(o, { averageScore: 73.4, bestScore: 100 });
  for (const d of ["guessDistribution", "mistakeDistribution", "scoreDistribution"]) if (Array.isArray(o[d])) o[d] = o[d].map((c, i) => c + ((i * 37) % 90) + 3);
  raw[g][k] = JSON.stringify(o);
}
const noHeights = (g) => Object.fromEntries(Object.entries(raw[g]).filter(([k]) => !/result-height|hint-height/.test(k)));
const playingIrodori = () => {
  const h = JSON.parse(raw.irodori["irodori-history"]);
  for (const d in h) Object.assign(h[d], { scores: [...h[d].scores.slice(0, 2), null, null, null], answers: [...h[d].answers.slice(0, 2), null, null, null], totalScore: null, currentRound: 2, status: "playing" });
  return { "irodori-history": JSON.stringify(h) };
};

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const SIZES = (process.env.SIZES ?? "320:16,375:16,1280:16,320:32,375:32,1280:32").split(",").map((s) => s.split(":").map(Number));

function probe(kv) {
  if (!sessionStorage.getItem("__seeded")) {
    for (const [k, v] of Object.entries(kv)) localStorage.setItem(k, v);
    sessionStorage.setItem("__seeded", "1");
  }
  window.__s = [];
  const desc = (n) => {
    if (!n) return "null";
    if (n.nodeType !== 1) return `#text(${(n.textContent || "").slice(0, 20)})`;
    const cls = typeof n.className === "string" ? n.className.split(" ")[0].replace(/-module__\w+__/, ".") : "";
    return `${n.tagName.toLowerCase()}${cls ? "." + cls : ""}[${(n.textContent || "").trim().slice(0, 12)}]`;
  };
  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) window.__s.push({ t: Math.round(e.startTime), v: e.value, r: e.hadRecentInput, src: e.sources.map((s) => `${desc(s.node)} y${Math.round(s.previousRect.y)}->${Math.round(s.currentRect.y)} h${Math.round(s.previousRect.height)}->${Math.round(s.currentRect.height)}`) });
  }).observe({ type: "layout-shift", buffered: true });
}

async function open(ctx, w, h, font, throttled) {
  const page = await ctx.newPage();
  await page.setViewportSize({ width: w, height: h });
  const cdp = await ctx.newCDPSession(page);
  if (font !== 16) await cdp.send("Page.setFontSizes", { fontSizes: { standard: font, fixed: font } });
  if (throttled && THROTTLE) {
    await cdp.send("Network.enable");
    await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 400, downloadThroughput: 50 * 1024, uploadThroughput: 50 * 1024 });
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  }
  return page;
}

async function measure(game, w, font, scenario) {
  const h = Number(process.env.H) || (w >= 1000 ? 800 : 667);
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: !DESKTOP, hasTouch: !DESKTOP, deviceScaleFactor: DESKTOP ? 1 : 2 });
  const seed = scenario === "fresh" ? (game === "kanji-kanaru" || game === "yoji-kimeru" ? { [`${game}-migrated-v2`]: "1" } : {}) : scenario === "playing" ? playingIrodori() : noHeights(game);
  await ctx.addInitScript(probe, seed);
  if (scenario === "remembered" || scenario === "estimated") {
    const pw = scenario === "remembered" ? w : w === 375 ? 320 : 375;
    const p = await open(ctx, pw, h, font, false);
    await p.goto(`${base}/play/${game}`, { waitUntil: "load", timeout: 120000 });
    await p.waitForTimeout(2500);
    await p.close();
  }
  const page = await open(ctx, w, h, font, true);
  await page.goto(`${base}/play/${game}`, { waitUntil: "load", timeout: 240000 });
  await page.waitForTimeout(4000);
  const s = await page.evaluate(() => window.__s);
  if (process.env.SHOT) await page.screenshot({ path: `${process.env.SHOT}-${game}-${scenario}-${w}-${font}.png`, fullPage: true });
  await ctx.close();
  return s;
}

for (const game of gamesArg.split(",")) for (const scenario of scenArg.split(",")) for (const [w, font] of SIZES) for (let i = 0; i < RUNS; i++) {
  if (scenario === "playing" && game !== "irodori") continue;
  const s = await measure(game, w, font, scenario);
  const cls = s.filter((e) => !e.r).reduce((a, e) => a + e.v, 0);
  console.log(`${game}\t${scenario}\t${w}\t${font === 16 ? "100%" : "200%"}\tCLS=${cls.toFixed(4)}`);
  if (process.env.VERBOSE || cls > 0.001) for (const e of s) console.log(`   t=${e.t} v=${e.v.toFixed(4)}${e.r ? " (input)" : ""}\n      ${e.src.join("\n      ")}`);
}
await browser.close();
