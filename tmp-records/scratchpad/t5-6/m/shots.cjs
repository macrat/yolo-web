// node m/shots.cjs <base> <label> : 見本のページを4つの組 × ライト・ダークで撮り、セクションの並びと罫線を記録
const { openContext, settle } = require("./lib.cjs");
const fs = require("fs");
const [base, label] = process.argv.slice(2);
const PAGES = {
  cp: "/play/character-personality/result/blazing-strategist",
  kanji: "/play/kanji-level/result/beginner",
  cf: "/play/contrarian-fortune/result/overthinker",
  tc: "/play/traditional-color/result/ai",
};
const VARIANTS = [
  { name: "320", width: 320 }, { name: "375", width: 375 }, { name: "1280", width: 1280 }, { name: "320x200", width: 320, big: true },
];
const outline = () => {
  const main = document.querySelector("main");
  const secs = [...main.querySelectorAll("section")].filter((s) => !s.parentElement.closest("section"));
  const inner = [...main.querySelectorAll("section section")];
  const rect = (e) => e.getBoundingClientRect();
  const top = (e) => Math.round(rect(e).top + scrollY);
  const res = secs.map((s) => {
    const b = getComputedStyle(s, "::before");
    const h = s.querySelector("h1,h2");
    return { tag: s.tagName, rule: b.content !== "none" && b.borderTopWidth !== "0px", ruleW: b.content !== "none" ? Math.round(parseFloat(getComputedStyle(s, "::before").width)) : 0, top: top(s), heading: h ? h.textContent : null, headTop: h ? top(h) : null, headFs: h ? getComputedStyle(h).fontSize : null };
  });
  return { innerW: innerWidth, rootFs: getComputedStyle(document.documentElement).fontSize, overflow: document.documentElement.scrollWidth - innerWidth, sections: res, nested: inner.length, height: document.documentElement.scrollHeight };
};
(async () => {
  const dir = `m/shots-${label}`; fs.mkdirSync(dir, { recursive: true });
  const log = {};
  for (const v of VARIANTS) for (const dark of [false, true]) {
    const { ctx, close } = await openContext({ width: v.width, height: v.width === 1280 ? 800 : 667, dark, big: v.big });
    const page = await ctx.newPage();
    for (const [k, path] of Object.entries(PAGES)) {
      await page.goto(base + path, { waitUntil: "load" });
      await settle(page);
      const key = `${k}-${v.name}-${dark ? "dark" : "light"}`;
      log[key] = await page.evaluate(outline);
      await page.screenshot({ path: `${dir}/${key}.png`, fullPage: true });
    }
    await close();
  }
  fs.writeFileSync(`${dir}/outline.json`, JSON.stringify(log, null, 1));
  console.log("done");
})().catch((e) => { console.error(e); process.exit(1); });
