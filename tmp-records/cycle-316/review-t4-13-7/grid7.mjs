import { open, close, settle, URL } from "./lib.mjs";
import fs from "node:fs";
const J = JSON.parse(fs.readFileSync(new URL_("./phr-all.json"), "utf8"));
function URL_(p) { return new globalThis.URL(p, import.meta.url); }
const sizes = [16, 17, 18, 19, 20, 21, 22, 24, 26, 28, 30, 32];
const widths = [320, 375, 1280];
const issues = []; const G = []; let cells = 0;
for (const f of sizes) {
  const o = await open({ width: 320, height: 800, font: f }); const p = o.page;
  await p.goto(URL, { waitUntil: "load" }); await settle(p, 500);
  for (const w of widths) {
    await p.setViewportSize({ width: w, height: 800 }); await p.waitForTimeout(100);
    for (const variant of ["built"]) { await p.evaluate((v) => { document.getElementById("__v")?.remove(); if (v === "nostrict") { const s = document.createElement("style"); s.id = "__v"; s.textContent = "[aria-label=\x27言葉の格子\x27] button{line-break:auto !important}"; document.head.append(s); } }, variant); for (const [pid, words] of Object.entries(J.out)) {
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
          const bb=b.getBoundingClientRect(); const cs=getComputedStyle(b); const bl=bb.left+parseFloat(cs.borderLeftWidth), br=bb.right-parseFloat(cs.borderRightWidth); let mn=1e9, mx=-1e9, tp=1e9; for (const t of [...b.childNodes].filter((n) => n.nodeType === 3)) { const r=document.createRange(); r.selectNodeContents(t); for (const q of r.getClientRects()) { mn=Math.min(mn,q.left); mx=Math.max(mx,q.right); tp=Math.min(tp,q.top);} } const mk=b.querySelector("span").getBoundingClientRect(); out.push({ gapL: Math.round(mn-bl), gapR: Math.round(br-mx), mk: Math.round(mn-mk.right), mkTop: Math.round(mk.top-tp), row: getComputedStyle(b).flexDirection, lines: L, ph: [...b.childNodes].filter((n) => n.nodeType === 3).map((n) => n.data), cw: Math.round(b.getBoundingClientRect().width) });
        }
        return { out, cls: phrasedCls, cols: getComputedStyle(btns[0].parentElement).gridTemplateColumns.split(" ").length };
      }, words);
      for (const c of r.out) {
        cells++; G.push([f,w,r.cols,c.gapL,c.gapR,c.row,c.mk,c.mkTop]);
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
console.log("cells", cells); const agg={}; for (const [f,w,cols,l,rr,row,mk,mt] of G){const k=`${w} ${f}px ${cols}col ${row}`; const a=agg[k]??={min:1e9,mk:new Set(),mt:new Set()}; a.min=Math.min(a.min,l,rr); if(row==="row"){a.mk.add(mk);a.mt.add(mt);} } for (const [k,a] of Object.entries(agg)) console.log(k,"minGap",a.min, a.mk.size?"mk-text "+[...a.mk]+" mkTop-textTop "+[...a.mt]:""); console.log(issues.join("\n"));
