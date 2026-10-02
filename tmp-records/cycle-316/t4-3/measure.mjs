import { chromium } from "/home/user/yolo-web/node_modules/playwright/index.mjs";
import { writeFileSync } from "node:fs";

const base = process.argv[2] ?? "http://localhost:3316";
const out = "/home/user/yolo-web/tmp/cycle-316/t4-3";
const widths = [320, 375, 1280];
const sizes = [16, 32];
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });

const initScript = () => {
  window.__shifts = [];
  new PerformanceObserver((list) => {
    for (const e of list.getEntries()) {
      if (e.hadRecentInput) continue;
      window.__shifts.push({
        value: e.value,
        sources: (e.sources || []).map((s) => {
          const n = s.node;
          const el = n && (n.nodeType === 1 ? n : n.parentElement);
          const sec = el && el.closest("section[id]");
          return sec ? sec.id : el ? el.tagName : "?";
        }),
      });
    }
  }).observe({ type: "layout-shift", buffered: true });
  window.__domLayouts = null;
  document.addEventListener("DOMContentLoaded", () => {
    window.__domLayouts = [...document.querySelectorAll("#quantity-bars ul")].map(
      (u) => u.dataset.layout ?? null,
    );
  });
};

async function open(w, fs, { reduced = false } = {}) {
  const ctx = await browser.newContext({
    viewport: { width: w, height: 900 },
    reducedMotion: reduced ? "reduce" : "no-preference",
  });
  const page = await ctx.newPage();
  await page.addInitScript(initScript);
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Page.enable");
  await cdp.send("Page.setFontSizes", { fontSizes: { standard: fs } });
  await page.goto(base + "/storybook", { waitUntil: "load", timeout: 60000 });
  await page.evaluate(() =>
    Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 5000))]),
  );
  await page.waitForTimeout(600);
  return { ctx, page, cdp };
}

const measureBars = () => {
  const r = (el) => el.getBoundingClientRect();
  const range = document.createRange();
  const textW = (el) => {
    range.selectNodeContents(el);
    return range.getBoundingClientRect().width;
  };
  return [...document.querySelectorAll("#quantity-bars ul")].map((ul) => {
    const box = ul.closest("section[aria-labelledby]");
    const bs = getComputedStyle(box);
    const boxContent = box.clientWidth - parseFloat(bs.paddingLeft) - parseFloat(bs.paddingRight);
    const measure = parseFloat(getComputedStyle(document.documentElement).fontSize) * 40;
    const W = r(ul).width;
    const items = [...ul.querySelectorAll("li")];
    const tracks = items.map((li) => r(li.querySelector('[aria-hidden="true"]')));
    const lefts = tracks.map((t) => t.left);
    const widthsT = tracks.map((t) => t.width);
    const gap = parseFloat(getComputedStyle(ul).columnGap);
    const cols = ["[data-bar-name]", "[data-bar-value]", "[data-bar-current]"]
      .map((s) => [...ul.querySelectorAll(s)])
      .filter((a) => a.length)
      .map((a) => Math.max(...a.map(textW)));
    const T = cols.reduce((s, c) => s + c + gap, 0);
    const layout = ul.dataset.layout;
    // 値が帯の右（1行）／名前の行の右端（2行）にあるか、塗りの上に字が無いか。
    let valuePlacementOk = true;
    let textOnFill = 0;
    items.forEach((li, i) => {
      const v = r(li.querySelector("[data-bar-value]"));
      const n = r(li.querySelector("[data-bar-name]"));
      const t = tracks[i];
      if (layout === "stacked") {
        if (!(v.bottom <= t.top + 0.5 && Math.abs(v.top - n.top) < 1)) valuePlacementOk = false;
      } else if (!(v.left >= t.right - 0.5)) valuePlacementOk = false;
      const fill = li.querySelector('[aria-hidden="true"] > span');
      if (fill) {
        const f = r(fill);
        for (const cell of li.querySelectorAll("[data-bar-name],[data-bar-value],[data-bar-current]")) {
          range.selectNodeContents(cell);
          for (const tr of range.getClientRects()) {
            if (tr.width && tr.left < f.right && tr.right > f.left && tr.top < f.bottom && tr.bottom > f.top) textOnFill++;
          }
        }
      }
    });
    const values = items.map((li) => Number(li.querySelector("[data-bar-value]").textContent.replace("%", "")));
    const maxV = Math.max(...values);
    const fills = items.map((li) => li.querySelector('[aria-hidden="true"] > span'));
    const inner = (t) => t.width - 6; // 太い線 3px × 2
    const maxRowFull = items.every((li, i) =>
      values[i] !== maxV || (ul.closest("#quantity-bars") && fills[i] && Math.abs(r(fills[i]).width - inner(tracks[i])) <= 0.5),
    );
    const zeroUnfilled = items.every((li, i) => values[i] !== 0 || !fills[i]);
    const overflow = [ul, ...items].some((el) => el.scrollWidth > el.clientWidth + 0.5);
    return {
      label: ul.getAttribute("aria-labelledby"),
      layout,
      listW: +W.toFixed(2),
      bodyW: +Math.min(measure, boxContent).toFixed(2),
      trackLeftSpread: +(Math.max(...lefts) - Math.min(...lefts)).toFixed(2),
      trackWidthSpread: +(Math.max(...widthsT) - Math.min(...widthsT)).toFixed(2),
      trackW: +widthsT[0].toFixed(2),
      trackRatio: +(widthsT[0] / W).toFixed(3),
      oneLineFrameRatio: +((W - T) / W).toFixed(3),
      valuePlacementOk,
      textOnFill,
      nOverN: /\d+\s*\/\s*\d+/.test(ul.textContent),
      maxRowFull,
      zeroUnfilled,
      overflow,
    };
  });
};

const measureBoxes = () => {
  const r = (el) => el.getBoundingClientRect();
  return [...document.querySelectorAll("#result-box section[aria-labelledby]")].map((box) => {
    const cs = getComputedStyle(box);
    const parent = box.parentElement;
    const ps = getComputedStyle(parent);
    const parentContent = parent.clientWidth - parseFloat(ps.paddingLeft) - parseFloat(ps.paddingRight);
    const pre = box.querySelector("pre");
    const table = box.querySelector("table");
    const copy = box.querySelector("button");
    const name = document.getElementById(box.getAttribute("aria-labelledby"))?.textContent;
    return {
      name: name?.slice(0, 20),
      border: cs.borderTopWidth + "/" + cs.borderStyle,
      padding: cs.paddingTop + "/" + cs.paddingLeft,
      widthDiff: +(r(box).width - parentContent).toFixed(2),
      preBorder: pre ? getComputedStyle(pre).borderTopWidth : null,
      preBg: pre ? getComputedStyle(pre).backgroundColor : null,
      boxBg: cs.backgroundColor,
      tableBorder: table ? getComputedStyle(table).borderTopWidth : null,
      copyTop: copy ? +(r(copy).top - r(box).top).toFixed(1) : null,
      height: +r(box).height.toFixed(0),
      overflow: box.scrollWidth > box.clientWidth + 0.5,
    };
  });
};

const results = { bars: [], boxes: [], cls: [], firstPaint: [], docOverflow: [] };
for (const w of widths) for (const fs of sizes) {
  const { ctx, page } = await open(w, fs);
  const tag = `${w}px ${fs === 16 ? "既定" : "200%"}`;
  results.bars.push({ tag, lists: await page.evaluate(measureBars) });
  results.boxes.push({ tag, boxes: await page.evaluate(measureBoxes) });
  const shifts = await page.evaluate(() => window.__shifts);
  results.cls.push({
    tag,
    total: +shifts.reduce((s, e) => s + e.value, 0).toFixed(4),
    mine: +shifts
      .filter((e) => e.sources.some((s) => ["result-box", "quantity-bars", "phrased-text"].includes(s)))
      .reduce((s, e) => s + e.value, 0)
      .toFixed(4),
    sources: shifts.map((e) => `${e.value.toFixed(4)}:${e.sources.join(",")}`),
  });
  results.firstPaint.push({
    tag,
    atDomContentLoaded: await page.evaluate(() => window.__domLayouts),
    afterHydration: await page.evaluate(() =>
      [...document.querySelectorAll("#quantity-bars ul")].map((u) => u.dataset.layout),
    ),
  });
  results.docOverflow.push({
    tag,
    scrollW: await page.evaluate(() => document.documentElement.scrollWidth),
    innerW: w,
  });
  if (fs === 16 && w !== 320) {
    await page.locator("#result-box").screenshot({ path: `${out}/result-box-${w}.png` });
  }
  if (fs === 16) {
    await page.locator("#quantity-bars").screenshot({ path: `${out}/quantity-bars-${w}-default.png` });
  } else {
    // 要素の撮影は文字サイズを既定に戻すので、並びを画面に送ってから画面を撮る。
    const box = page.locator("#quantity-bars section[aria-labelledby]").nth(1);
    await box.evaluate((el) => el.scrollIntoView({ block: "start" }));
    await page.screenshot({ path: `${out}/irodori-${w}-200.png` });
  }
  if (w === 320 && fs === 16) {
    const irodori = page.locator("#quantity-bars section[aria-labelledby]").nth(1);
    await irodori.screenshot({ path: `${out}/irodori-320-default.png` });
  }
  await ctx.close();
}

// 読み上げ（ariaSnapshot）
{
  const { ctx, page } = await open(375, 16);
  results.aria = {
    bars: await page.locator("#quantity-bars ul").first().ariaSnapshot(),
    barsAll: await page.locator("#quantity-bars").ariaSnapshot(),
    boxes: await page.locator("#result-box").ariaSnapshot(),
    phrased: await page.locator("#phrased-text").ariaSnapshot(),
  };
  results.voiceOver = await page.evaluate(() =>
    [...document.querySelectorAll("#phrased-text h2")].map((h) => ({
      text: h.textContent,
      wbr: h.querySelectorAll("wbr").length,
      zwsp: h.textContent.includes("​"),
    })),
  );
  // 登場の動き
  results.animation = await page.evaluate(() =>
    [...document.querySelectorAll("#result-box section[aria-labelledby]")].map((b) => {
      const a = getComputedStyle(b);
      return {
        name: a.animationName,
        duration: a.animationDuration,
        iterations: a.animationIterationCount,
        props: b.getAnimations().map((x) => Object.keys(x.effect.getKeyframes()[0]).filter((k) => !["offset", "easing", "composite", "computedOffset"].includes(k))),
      };
    }),
  );
  // 組み直し: 375px → 320px、既定 → 200%
  const before = await page.evaluate(() => [...document.querySelectorAll("#quantity-bars ul")].map((u) => u.dataset.layout));
  await page.setViewportSize({ width: 320, height: 900 });
  await page.waitForTimeout(300);
  const after320 = await page.evaluate(() => [...document.querySelectorAll("#quantity-bars ul")].map((u) => u.dataset.layout));
  await page.setViewportSize({ width: 375, height: 900 });
  await page.waitForTimeout(300);
  const back375 = await page.evaluate(() => [...document.querySelectorAll("#quantity-bars ul")].map((u) => u.dataset.layout));
  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Page.setFontSizes", { fontSizes: { standard: 32 } });
  await page.waitForTimeout(300);
  const at200 = await page.evaluate(() => [...document.querySelectorAll("#quantity-bars ul")].map((u) => u.dataset.layout));
  const bars200 = await page.evaluate(measureBars);
  results.relayout = { before375: before, after320, back375, at200, bars200 };
  await ctx.close();
}
{
  const { ctx, page } = await open(375, 16, { reduced: true });
  results.animationReduced = await page.evaluate(() =>
    [...document.querySelectorAll("#result-box section[aria-labelledby]")].map((b) => ({
      name: getComputedStyle(b).animationName,
      running: b.getAnimations().length,
    })),
  );
  await ctx.close();
}
// ダークの見え方
{
  const ctx = await browser.newContext({ viewport: { width: 375, height: 900 }, colorScheme: "dark" });
  const page = await ctx.newPage();
  await page.goto(base + "/storybook", { waitUntil: "load" });
  await page.waitForTimeout(600);
  await page.locator("#quantity-bars").screenshot({ path: `${out}/quantity-bars-375-dark.png` });
  await page.locator("#result-box").screenshot({ path: `${out}/result-box-375-dark.png` });
  await ctx.close();
}
await browser.close();
writeFileSync(`${out}/measure.json`, JSON.stringify(results, null, 2));
console.log("ok");
