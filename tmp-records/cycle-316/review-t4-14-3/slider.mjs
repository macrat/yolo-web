import { open, close, settle, URL } from "./lib.mjs";
const font = +process.argv[2]; const block = process.argv[3] === "block"; const sim = process.argv[4] || "irodori";
const widths = process.argv.slice(5).map(Number);
const out = [];
for (const w of widths) {
  const o = await open({ width: w, height: 800, font, blockFonts: block });
  const p = o.page;
  await p.goto(URL, { waitUntil: "load" }); await settle(p, 500);
  const r = await p.evaluate((sim) => {
    const input = document.querySelector('input[type="range"]');
    const container = input.closest('[class*="container"]');
    if (sim === "pct") {
      // simulate image-resizer quality item: label 品質, longest value 100%
      container.style.setProperty("--slider-label", "2.06em");
      container.style.setProperty("--slider-value", "2.8em");
      container.style.setProperty("--slider-fixed", "calc(2.06em + 2.8em + 120px)");
      container.querySelectorAll('[class*="label"]').forEach((l) => (l.textContent = "品質"));
      container.querySelectorAll('[class*="value"]').forEach((v) => (v.textContent = "100%"));
    }
    const row = input.parentElement;
    const label = row.querySelector("label"), val = row.querySelector('[class*="value"]');
    const [dec, inc] = row.querySelectorAll("button");
    const R = (e) => e.getBoundingClientRect();
    const cs = getComputedStyle(input);
    const track = R(input).width - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const range = document.createRange(); range.selectNodeContents(val); const vt = range.getBoundingClientRect();
    const lr = document.createRange(); lr.selectNodeContents(label); const lt = lr.getBoundingClientRect();
    return {
      fonts: [...document.fonts].filter((f) => f.status === "loaded").map((f) => f.family).join(","),
      rows: Math.abs((R(label).top + R(label).bottom) / 2 - (R(input).top + R(input).bottom) / 2) < 5 ? 1 : 2,
      query: +R(container).width.toFixed(2), track: +track.toFixed(2), rem5: 5 * parseFloat(getComputedStyle(document.documentElement).fontSize),
      gapL: +(vt.left - R(dec).right).toFixed(2), gapR: +(R(inc).left - vt.right).toFixed(2),
      valBox: +R(val).width.toFixed(2), valText: +vt.width.toFixed(2), lblBox: +R(label).width.toFixed(2), lblText: +lt.width.toFixed(2),
      incRight: +R(inc).right.toFixed(1), contentRight: +R(container.parentElement).right.toFixed(1),
    };
  }, sim);
  out.push(`${w} ${font}px ${block ? "blocked" : "loaded"} ${sim}: ${JSON.stringify(r)}`);
  await close(o);
}
console.log(out.join("\n"));
