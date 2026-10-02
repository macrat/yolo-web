import { open, close, settle, URL } from "./lib.mjs";
import fs from "node:fs";
const J = JSON.parse(fs.readFileSync(new URL_("./phr-all.json"), "utf8"));
function URL_(p) { return new globalThis.URL(p, import.meta.url); }
const sizes = [16, 18, 20, 22, 24, 26, 28, 30, 32];
const widths = [320, 375, 1280];
const issues = []; let cells = 0;
for (const f of sizes) {
  const o = await open({ width: 320, height: 800, font: f }); const p = o.page;
  await p.goto(URL, { waitUntil: "load" }); await settle(p, 500);
  for (const w of widths) {
    await p.setViewportSize({ width: w, height: 800 }); await p.waitForTimeout(100);
    for (const variant of ["built", "nostrict"]) { await p.evaluate((v) => { document.getElementById("__v")?.remove(); if (v === "nostrict") { const s = document.createElement("style"); s.id = "__v"; s.textContent = "[aria-label=\x27言葉の格子\x27] button{line-break:auto !important}"; document.head.append(s); } }, variant); for (const [pid, words] of Object.entries(J.out)) {
      const r = await p.evaluate((words) => {
        const phrasedCls = [...document.styleSheets].flatMap((s) => { try { return [...s.cssRules]; } catch { return []; } }).flatMap((r) => r.cssRules ? [...r.cssRules] : [r]).map((r) => r.selectorText || "").find((s) => /phrased/.test(s))?.replace(/^\./, "");
        const btns = [...document.querySelectorAll("[aria-label='言葉の格子'] button")];
        const out = [];
        btns.forEach((b, i) => {
          const ph = words[i]; const mark = b.querySelector("span");
          b.replaceChildren(mark); ph.forEach((x, k) => { if (k) b.append(document.createElement("wbr")); b.append(document.createTextNode(x)); });
          b.classList.toggle(phrasedCls, ph.length > 1);
        });
        for (const b of btns) {
          const L = []; let lt = null;
          for (const t of [...b.childNodes].filter((n) => n.nodeType === 3)) for (let i = 0; i < t.data.length; i++) { const r = document.createRange(); r.setStart(t, i); r.setEnd(t, i + 1); const tp = Math.round(r.getBoundingClientRect().top); if (lt === null || Math.abs(tp - lt) > 3) { L.push(""); lt = tp; } L[L.length - 1] += t.data[i]; }
          out.push({ lines: L, ph: [...b.childNodes].filter((n) => n.nodeType === 3).map((n) => n.data), cw: Math.round(b.getBoundingClientRect().width) });
        }
        return { out, cls: phrasedCls, cols: getComputedStyle(btns[0].parentElement).gridTemplateColumns.split(" ").length };
      }, words);
      for (const c of r.out) {
        cells++;
        const s = c.lines.join("/"); const tag = `${variant} ${f}px ${w} #${pid} (${r.cols}col,${c.cw}px) ${s}`;
        if (c.lines.length > 1 && c.lines.some((l) => [...l].length === 1)) issues.push("1字 " + tag);
        if (c.lines.slice(1).some((l) => /^[ーぁぃぅぇぉっゃゅょゎァィゥェォッャュョヮヵヶ]/.test(l))) issues.push("行頭 " + tag);
        if (c.ph.length > 1 && c.lines.length > 1) {
          // mid-phrase break?
          const bounds = new Set(); let acc = 0; for (const x of c.ph.slice(0, -1)) { acc += x.length; bounds.add(acc); }
          let pos = 0; const mid = c.lines.slice(0, -1).some((l) => { pos += l.length; return !bounds.has(pos); });
          if (mid) issues.push("文節中 " + tag);
        }
      }
    }
    }
  }
  await close(o);
}
console.log("cells", cells); console.log(issues.join("\n"));
