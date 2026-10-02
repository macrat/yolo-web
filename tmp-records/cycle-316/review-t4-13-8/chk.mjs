import { open, close, settle, URL } from "./lib.mjs";
import fs from "node:fs";
const J = JSON.parse(fs.readFileSync(new globalThis.URL("./phr-days.json", import.meta.url), "utf8"));
const o = await open({ width: 1280, height: 800, font: 16 }); const p = o.page;
await p.goto(URL, { waitUntil: "load" }); await settle(p, 500);
const res = [];
for (const [pid, words] of Object.entries(J.out)) {
  const r = await p.evaluate((words) => {
    const phraseCls = [...document.styleSheets].flatMap((s) => { try { return [...s.cssRules]; } catch { return []; } }).flatMap((r) => r.cssRules && r.cssRules.length ? [r, ...r.cssRules] : [r]).map((r) => r.selectorText || "").find((s) => /__phrase$/.test(s)).replace(/^\./, "");
    const btns = [...document.querySelectorAll("[aria-label='言葉の格子'] button")];
    btns.forEach((b, i) => { const ph = words[i]; const mark = b.querySelector("span"); const wd = document.createElement("span"); b.replaceChildren(mark, wd); ph.forEach((x, k) => { if (k) wd.append(document.createElement("wbr")); if (ph.length > 1) { const sp = document.createElement("span"); sp.className = phraseCls; sp.textContent = x; wd.append(sp); } else wd.append(document.createTextNode(x)); }); });
    const chk = [...document.querySelectorAll("button")].find((b) => b.textContent.trim() === "チェック").getBoundingClientRect();
    const g = btns[0].parentElement.getBoundingClientRect();
    const hs = btns.map((b) => Math.round(b.getBoundingClientRect().height)); btns.forEach(b=>b.style.alignSelf="start"); const nat = btns.map((b) => Math.round(b.getBoundingClientRect().height)); btns.forEach(b=>b.style.alignSelf=""); return { nat: nat.join(","), chkBottom: Math.round(chk.bottom), grid: Math.round(g.height), rows: [...new Set(btns.map((b) => Math.round(b.getBoundingClientRect().height)))].join(",") };
  }, words);
  res.push({ pid, ...r });
}
res.sort((a, b) => b.chkBottom - a.chkBottom);
console.log(res.slice(0, 6).map((r) => JSON.stringify(r)).join("\n"), "\nover800:", res.filter((r) => r.chkBottom > 800).length, "min", res[res.length - 1].chkBottom);
await p.evaluate(() => scrollTo(0, 0));
await close(o);
